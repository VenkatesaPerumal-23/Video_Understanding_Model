// app.js
import pkg from 'twelvelabs-js';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

const { TwelveLabs } = pkg;
const client = new TwelveLabs({ apiKey: 'tlk_2QPR5EK1GPCJVQ2BG5HBX3ZF6ECQ'}); // Replace with actual key
let VideoIdentifier;

const createIndex = async () => {
  try {
    const index = await client.index.create({
      name: 'final_videogpt_2025',
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

    console.log(`Created index: id=${index.id}`);
    return index.id;
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
};

const uploadFiles = async (indexId, inputPath) => {
  try {
    const stats = await fsPromises.stat(inputPath);

    let files = [];
    if (stats.isDirectory()) {
      files = await fsPromises.readdir(inputPath);
      files = files.map((file) => path.join(inputPath, file));
    } else if (stats.isFile()) {
      files = [inputPath];
    } else {
      throw new Error('Input path is neither file nor directory');
    }

    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    for (const file of files) {
      if (!videoExtensions.includes(path.extname(file).toLowerCase())) {
        console.log(`Skipping non-video file: ${file}`);
        continue;
      }
      console.log(`Uploading ${file}`);
      const task = await client.task.create({ indexId, file });
      await task.waitForDone(50, (task) => {
        console.log(`  Status=${task.status}`);
      });

      if (task.status !== 'ready') throw new Error(`Indexing failed: ${task.status}`);
      VideoIdentifier = task.videoId;
      console.log(`Video uploaded. Unique video ID: ${task.videoId}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
};

const main = async () => {
  try {
    const indexId = await createIndex();
    const videoPath = 'music.mp4';
    await uploadFiles(indexId, videoPath);
    console.log("Generated Video ID:", VideoIdentifier);
  } catch (error) {
    console.error('Error in main:', error);
  }
};

main();
