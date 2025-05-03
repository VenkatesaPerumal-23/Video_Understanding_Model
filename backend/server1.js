import pkg from 'twelvelabs-js';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

const { TwelveLabs } = pkg;

const client = new TwelveLabs({ apiKey: 'tlk_2QPR5EK1GPCJVQ2BG5HBX3ZF6ECQ' });
const createIndex = async () => {
  try {
    const index = await client.index.create({
      name: 'videgpt',
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

    console.log(`Created index: id=${index.id} name=${index.name} engines=${JSON.stringify(index.engines)}`);
    return index.id; // Return the index ID for use later
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
};



app.post('/generate-text', async (req, res) => {
    const { videoId, prompt } = req.body;
    console.log("Generating text");
    console.log(`Received request with videoId=${videoId} and prompt=${prompt}`);
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
  console.log(`Server is running on http://localhost:${PORT}`);
});

