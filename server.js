// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (index.html, script.js, style.css) from this folder
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
  });

// Schema + Model for Micro Complaints
const complaintSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, required: true }, // school, transit, food, home, random, other
  intensity: {
    type: String,
    enum: ['mild', 'bad', 'meltdown'],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// Routes

// (Optional) test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Micro Complaints API is running 👀' });
});

// Create a complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const { text, category, intensity } = req.body;

    if (!text || !category || !intensity) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const complaint = await Complaint.create({ text, category, intensity });
    res.status(201).json(complaint);
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete a complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Complaint.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting complaint:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
