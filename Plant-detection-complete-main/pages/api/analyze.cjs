const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4050;
const FLASK_API_URL = 'http://127.0.0.1:5300/checkimages';

app.use(cors());
app.use(express.json());

app.post('/api/analyze-disease', async (req, res) => {
  try {
    const folderPath = path.join(__dirname, 'toanalyze');
    const files = fs.readdirSync(folderPath);

    const imageFiles = files.filter(file => /\.(jpg|jpeg)$/i.test(file));

    if (imageFiles.length === 0) {
      return res.status(404).json({ error: 'No .jpg or .jpeg files found in toanalyze folder' });
    }

    const imagePath = path.join(folderPath, imageFiles[0]);

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await fetch(FLASK_API_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const data = await response.json();

    // Delete image after processing
    fs.unlinkSync(imagePath);

    if (response.ok) {
      res.json({
        result: data.prediction || 'Unknown',
        confidence: data.confidence ? Math.min(Math.round(data.confidence * (data.confidence <= 1 ? 100 : 1)), 100) : 0,
        heatmapUrl: data.heatmapUrl || ''
      });
    } else {
      res.status(500).json({ error: 'Failed to analyze disease' });
    }

  } catch (err) {
    console.error('Error analyzing disease:', err);
    res.status(500).json({ error: 'Failed to analyze disease.' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
