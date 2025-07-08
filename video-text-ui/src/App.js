import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [videoId, setVideoId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setVideoId('');
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await axios.post('http://localhost:5000/upload', formData);
      setVideoId(response.data.videoId);
      alert(`Video uploaded. Video ID: ${response.data.videoId}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video.');
    } finally {
      setUploading(false);
    }
  };

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
        <div className="card">
          <h1>🎥 Video Understanding Assistant</h1>
          <div className="form-section">
            <label>Upload Video:</label>
            <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} />
            {uploading && <p>Uploading video and indexing...</p>}
          </div>

          <div className="form-section">
            <label>Video ID:</label>
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Enter or use uploaded Video ID"
            />
          </div>

          <div className="form-section">
            <label>Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question about the video..."
            />
          </div>

          <button onClick={handleGenerateText} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Text'}
          </button>

          {result && (
            <div className="result">
              <h2>Result:</h2>
              <p>{result}</p>
            </div>
          )}
        </div>

        <div className="card history">
          <h2>🕘 Query History</h2>
          <ul>
            {queryHistory.map((entry, index) => (
              <li key={index}>
                <strong>Video ID:</strong> {entry.videoId}<br />
                <strong>Prompt:</strong> {entry.prompt}<br />
                <strong>Result:</strong> {entry.result}
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
