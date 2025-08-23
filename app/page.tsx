'use client';

import { useState } from 'react';

export default function Home() {
  const [features, setFeatures] = useState(['', '', '', '']);
  const [prediction, setPrediction] = useState(null);

  const handleChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handlePredict = async () => {
    const res = await fetch('https://ml-api-fastapi-nwok.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: features.map(Number) }),
    });

    const data = await res.json();
    setPrediction(data.prediction);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>ML Prediction App</h1>
      {features.map((val, i) => (
        <input
          key={i}
          type="number"
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          placeholder={`Feature ${i + 1}`}
          style={{ margin: 5 }}
        />
      ))}
      <br />
      <button onClick={handlePredict} style={{ marginTop: 10 }}>
        Predict
      </button>

      {prediction !== null && (
        <p>
          🔮 Prediction: <strong>{prediction}</strong>
        </p>
      )}
    </main>
  );
}
