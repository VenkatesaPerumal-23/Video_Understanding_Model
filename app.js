import pkg from 'twelvelabs-js';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

const { TwelveLabs } = pkg;

const client = new TwelveLabs({ apiKey: 'tlk_0CXJVPE1ZCAKYC23X43HK0A589EE' });
let VideoIdentifier;

const createIndex = async () => {
  try {
    const index = await client.index.create({
      name: 'Final',
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

const uploadFiles = async (indexId, inputPath) => {
  try {
    const stats = await fsPromises.stat(inputPath);

    let files = [];
    if (stats.isDirectory()) {
      files = await fsPromises.readdir(inputPath); // Read directory contents
      files = files.map((file) => path.join(inputPath, file)); // Get full file paths
    } else if (stats.isFile()) {
      files = [inputPath]; // Single file case
    } else {
      throw new Error('Input path is neither a file nor a directory');
    }

    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv']; // Supported extensions
    for (const file of files) {
      if (!videoExtensions.includes(path.extname(file).toLowerCase())) {
        console.log(`Skipping non-video file: ${file}`);
        continue;
      }
      console.log(`Uploading ${file}`);
      const task = await client.task.create({
        indexId,
        file,
      });
      console.log(`Created task: id=${task.id}`);
      await task.waitForDone(50, (task) => {
        console.log(`  Status=${task.status}`);
      });
      if (task.status !== 'ready') {
        throw new Error(`Indexing failed with status ${task.status}`);
      }
      VideoIdentifier=task.videoId;
      console.log(`Uploaded ${file}. The unique identifier of your video is ${task.videoId}`);
    }
  } catch (error) {
    console.error('Error uploading files:', error);
  }
};

const searchQuery = async (indexId, queryText, options) => {
  try {
    let searchResults = await client.search.query({
      indexId: indexId,
      queryText: queryText,
      options: options,
    });
    printPage(searchResults.data);

    while (true) {
      const page = await searchResults.next();
      if (page === null) break;
      else printPage(page);
    }
  } catch (error) {
    console.error('Error searching query:', error);
  }
};

const generateText = async (videoId, prompt) => {
  try {
    const text = await client.generate.text(videoId, prompt);
    console.log(`Open-ended Text: ${text.data}`);
  } catch (error) {
    console.error('Error generating text:', error);
  }
};

function printPage(searchData) {
  searchData.forEach((clip) => {
    console.log(
      `video_id= ${clip.videoId} score=${clip.score} start=${clip.start} end=${clip.end} confidence=${clip.confidence}`,
    );
  });
}

const main = async () => {
  try {
    const indexId = await createIndex();
    const directoryPath = 'test.mp4'; // Replace with your video file or directory
    await uploadFiles(indexId, directoryPath);

    const queryText = ''; // Replace with your query text
    const options = ['visual', 'text_in_video']; // Specify search options based on your requirements
    await searchQuery(indexId, queryText, options);

    // Generate open-ended text for the video
    const videoId = VideoIdentifier; // Replace with actual videoId
    const prompt1 = 'What is going on there ??? Is there any professional Activities going ???';
    console.log("\n",prompt1," :\n")
    await generateText(videoId, prompt1);

    console.log("--------------------------------------------------------------------------------------------------------------------------------");

    const prompt2 = 'Is there any laptop present there, if yes waht is the color ???';
    console.log("\n",prompt2," :\n")
    await generateText(videoId, prompt2);

    console.log("--------------------------------------------------------------------------------------------------------------------------------");


    const prompt3 = 'What is the color of the suitcase ???';
    console.log("\n",prompt3," :\n")
    await generateText(videoId, prompt3);

    console.log("--------------------------------------------------------------------------------------------------------------------------------");

  } catch (error) {
    console.error('Error in main:', error);
  }
};

main();
