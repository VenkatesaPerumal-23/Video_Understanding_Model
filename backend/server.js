// server1.js
import pkg from 'twelvelabs-js';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

const { TwelveLabs } = pkg;
const client = new TwelveLabs({ apiKey: 'tlk_2QPR5EK1GPCJVQ2BG5HBX3ZF6ECQ' }); // Replace with environment variable in production

// Create a new index on the fly
const createIndex = async () => {
  try {
    const index = await client.index.create({
      name: 'videogpt-' + Date.now(),
      engines: [
        {
          name: 'marengo2.6',
          options: ['visual', 'conversation', 'text_in_video'],
        },
        {
          name: 'pegasus1.1',
          options: ['visual', 'conversation'],
        },
      ],
    });

    console.log(`Created index: id=${index.id} name=${index.name}`);
    return index.id;
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
};

// Endpoint: Upload new video and get videoId
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const indexId = await createIndex();
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log(`Uploading file: ${file.path}`);

    const task = await client.task.create({
      indexId,
      file: file.path,
    });

    await task.waitForDone(50, (task) => {
      console.log(`  Status=${task.status}`);
    });

    if (task.status !== 'ready') {
      throw new Error(`Indexing failed: ${task.status}`);
    }

    const videoId = task.videoId;
    console.log(`Upload complete. Video ID: ${videoId}`);
    res.status(200).json({ videoId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload video' });
  }
});

// Endpoint: Generate text from video and prompt
app.post('/generate-text', async (req, res) => {
  const { videoId, prompt } = req.body;
  console.log(`Received request: videoId=${videoId}, prompt="${prompt}"`);

  try {
    const text = await client.generate.text(videoId, prompt);
    console.log(`Response from Twelve Labs:`, text);

    if (text && text.data) {
      res.status(200).json({ text: text.data });
    } else {
      res.status(500).json({ error: 'No text data in response.' });
    }
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: error.message || 'Failed to generate text.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
