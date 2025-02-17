// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const groupsRouter = require("./routes/groups");
const messagesRoutes = require("./routes/messagesRoutes"); // New messages routes

const axios = require("axios");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allows all origins
    methods: ["GET", "POST"], // Allowed HTTP methods for socket polling
  },
  transports: ["websocket", "polling"], // Ensure both transports are allowed
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
});


const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Attach io to the app so it can be accessed in controllers
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 100,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/groups", groupsRouter);
app.use("/api/messages", messagesRoutes); // Use messages routes

// Example route
app.get("/", (req, res) => {
  return res.send("Hello world!");
});

// API to upload a file
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileData = {
      data: req.file.buffer.toString("base64"),
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
    };

    res.json({ fileData });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// --- Socket.io Connection ---
io.on("connection", (socket) => {
  console.log("New client connected");
  let currentUser = null;

  socket.on("setUser", (userId) => {
    currentUser = userId;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected`);
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    if (groupId) {
      socket.leave(groupId);
      console.log(`User left group: ${groupId}`);
    }
  });

  socket.on("generate", async (data) => {
    try {
      const response = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          model: "command",
          prompt: data.prompt,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `BEARER ${COHERE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      socket.emit("generateResponse", response.data);
    } catch (error) {
      console.error("Generation error:", error);
      socket.emit("generateError", { message: error.message });
    }
  });

  socket.on("sendMessage", async (message) => {
    try {
      const Message = require("./models/Message");
      const newMessage = new Message({
        ...message,
        readBy: [message.senderId], // Mark as read by sender
      });
      await newMessage.save();

      // Broadcast to all users in the group
      socket.to(message.groupId).emit("newMessage", newMessage);

      // Get group members and emit unreadMessage event to all except sender
      const Group = require("./models/groupModel");
      const group = await Group.findById(message.groupId);
      if (group) {
        group.members.forEach((memberId) => {
          if (memberId.toString() !== message.senderId.toString()) {
            io.to(`user_${memberId}`).emit("newMessage", newMessage);
          }
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  socket.on("markMessagesAsRead", async ({ groupId, userId }) => {
    try {
      const Message = require("./models/Message");
      await Message.updateMany(
        {
          groupId,
          senderId: { $ne: userId },
          readBy: { $nin: [userId] },
        },
        { $addToSet: { readBy: userId } }
      );

      io.emit("messagesMarkedAsRead", { groupId, userId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", () => {
    if (currentUser) {
      socket.leave(`user_${currentUser}`);
    }
    console.log("User disconnected");
  });
});

// API to get unread counts per group for a user is now handled by messagesRoutes

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
