const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const ai = new GoogleGenAI({ apiKey: 'AIzaSyBbln8RAByNy7-8b66JSyV_k10ekM0L7vY' });

app.use(express.json()); // Middleware to parse JSON request bodies

// Enable CORS for all origins and specifically for http://localhost:8080
app.use(
  cors({
    origin: ['*', 'http://localhost:8080'], // Allows all origins and http://localhost:8080
  })
);

app.post('/remedysearch', async (req, res) => {
  const { context } = req.body;

  if (!context) {
    return res.status(400).json({ error: 'Context is required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: context,
    });

    return res.json({
      remedy: response.text,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

// Start the server on port 3080
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
