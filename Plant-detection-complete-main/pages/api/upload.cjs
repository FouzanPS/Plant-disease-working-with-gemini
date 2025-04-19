const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Enable CORS and JSON parsing
app.use(cors({
  origin: (origin, callback) => {
    if (origin === 'http://localhost:8000' || !origin) {
      callback(null, true); // Allow localhost:8000 or no origin (e.g., testing locally)
    } else {
      callback(null, true); // Allow all other origins
    }
  },
  methods: ['GET', 'POST'],
  credentials: true, // Allow credentials if needed (e.g., cookies)
}));

app.use(express.json());

// Ensure 'toanalyze' folder exists
const uploadDir = path.join(__dirname, 'toanalyze');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1691952341234.jpg
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  res.json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    path: req.file.path,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Upload server running on http://localhost:${PORT}`);
});
