import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [videoId, setVideoId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);

  const handleGenerateText = async () => {
    if (!videoId || !prompt) {
      alert('Please enter both Video ID and Prompt.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/generate-text', {
        videoId,
        prompt,
      });

      const newResult = response.data.text;
      
      // Update query history with the new entry at the top
      const newEntry = { videoId, prompt, result: newResult };
      setQueryHistory([newEntry, ...queryHistory]);

      setResult(newResult);
    } catch (error) {
      console.error('Error generating text:', error);
      alert('Failed to generate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="left-pane">
          <h1>Video Understanding</h1>
          <div className="form-group">
            <label htmlFor="videoId">Video ID:</label>
            <input
              type="text"
              id="videoId"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Enter video ID"
            />
          </div>
          <div className="form-group">
            <label htmlFor="prompt">Prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your question or prompt"
            />
          </div>
          <button onClick={handleGenerateText} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Text'}
          </button>
        </div>

        <div className="right-pane">
          <h2>Query History</h2>
          <div className="history">
            <ul>
              {queryHistory.map((entry, index) => (
                <li key={index}>
                  <strong>Video ID:</strong> {entry.videoId}<br /><br />
                  <strong>Prompt:</strong> {entry.prompt}<br /><br />
                  <strong>Result:<br /></strong> {entry.result}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
