const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true }, // Added description field
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'vsmUser', required: true }, // Reference to User model
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'vsmUser' }], // Array of User references
  createdAt: { type: Date, default: Date.now },
  isLive: { type: Boolean, default: false },
});

const Group = mongoose.model("vsmGroup", groupSchema);

module.exports = Group;
