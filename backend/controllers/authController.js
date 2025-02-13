const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Group = require('../models/groupModel');
const process = require("process");
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: String,
  to: String,
  from: String,
  groupId: String,
  groupName: String,
  status: String, // 'pending', 'accepted', 'rejected'
});

const Notification = mongoose.model('Notification', NotificationSchema);

// Function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
};

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,  // Disable certificate validation (for development/testing only)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP for Your Registration",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const image = req.file ? req.file.buffer : null; // Get the uploaded image from the request

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    const user = new User({ name, email, password: hashedPassword, role, otp, otpExpires, image });

    await user.save();
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Error registering user. Please try again." });
  }
};
// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if OTP matches and is not expired
  if (user.otp === otp && user.otpExpires > Date.now()) {
    user.otp = null; // Clear OTP after successful verification
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "OTP verified successfully", token });
  } else {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Include the user's role in the JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role }, // Add the role to the token payload
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Optional: Set token expiration
    );
    return res.json({ token, role: user.role }); // Send role along with token
  } else {
    return res.status(400).json({ message: "Invalid credentials" });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if OTP has expired
  if (user.otpExpires < Date.now()) {
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
    await user.save();

    try {
      await sendOTPEmail(email, otp); // Resend OTP to user's email
      return res.json({ message: "OTP has been resent to your email" });
    } catch (error) {
      return res.status(500).json({ message: "Error sending OTP" });
    }
  } else {
    return res.status(400).json({ message: "OTP is still valid. Please check your email." });
  }
};

// Get user profile
exports.profile = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email }).select("-password -otp -otpExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};




// Get all groups
exports.getGroups = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all groups where the user is either a member or the creator
    const groups = await Group.find({
      $or: [
        { members: user._id },
        { createdBy: user._id }
      ]
    });

    res.status(200).json({ groups });
  } catch (err) {
    console.error("Error fetching groups:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, image, description, createdBy, members } = req.body;

    // Check if all required fields are provided
    if (!name || !image || !description || !createdBy) {
      return res.status(400).json({
        message: "All fields ('name', 'image', 'description', and 'createdBy') are required.",
      });
    }

    // Ensure 'createdBy' and 'members' are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(createdBy) || 
        (members && !members.every(id => mongoose.Types.ObjectId.isValid(id)))) {
      return res.status(400).json({ message: "Invalid user ID(s) provided." });
    }

    // Create new group with optional members array
    const newGroup = new Group({
      name,
      image,
      description,
      createdBy,
      members: members || [], // Default to empty array if no members are provided
    });

    await newGroup.save();

    console.log("New group created:", newGroup);
    res.status(201).json({ message: "Group created successfully", group: newGroup });

  } catch (err) {
    console.error("Error creating group:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Add this new endpoint to get user details by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email image');
    
    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send group invite
exports.sendGroupInvite = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Create notification
    const notification = new Notification({
      type: 'group_invite',
      to: userId,
      from: req.user._id,
      groupId,
      groupName: group.name,
      status: 'pending'
    });

    await notification.save();
    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending group invite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Respond to group invite
exports.respondToGroupInvite = async (req, res) => {
  try {
    const { notificationId, groupId, accept } = req.body;
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update notification status
    notification.status = accept ? 'accepted' : 'rejected';
    await notification.save();

    if (accept) {
      // Add user to group members
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      // Check if user is already a member
      if (!group.members.includes(user._id)) {
        group.members.push(user._id);
        await group.save();
      }
    }

    res.json({ 
      message: `Invitation ${accept ? 'accepted' : 'rejected'} successfully`,
      status: notification.status,
      groupId: groupId
    });
  } catch (error) {
    console.error('Error responding to group invite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get notifications for the user
exports.getNotifications = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    
    // Get user profile to get the user ID
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find notifications using the user ID
    const notifications = await Notification.find({ to: user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};