'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function Home() {
  const [features, setFeatures] = useState(['', '', '', '']);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [metrics, setMetrics] = useState(null);

  const handleChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handlePredict = async () => {
    try {
      const res = await fetch(
        'https://ml-api-fastapi-nwok.onrender.com/predict',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features: features.map(Number) }),
        }
      );
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const data = await res.json();
      setPrediction(data.prediction);
      fetchMetrics(); // Refresh metrics after prediction
    } catch (error) {
      console.error('Prediction error:', error);
      setPrediction(null);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(
        'https://ml-api-fastapi-nwok.onrender.com/metrics'
      );
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Metrics fetch error:', error);
      setMetrics(null);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Prepare chart data from prediction_distribution
  const chartData = metrics
    ? Object.entries(metrics.prediction_distribution).map(
        ([key, value]) => ({
          name: key,
          count: value,
        })
      )
    : [];

  return (
    <main style={{ padding: 40, maxWidth: 600, margin: 'auto' }}>
      <h1>ML Prediction App</h1>

      {/* Feature inputs */}
      {features.map((val, i) => (
        <input
          key={i}
          type="number"
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          placeholder={`Feature ${i + 1}`}
          style={{
            margin: 5,
            padding: 8,
            width: '22%',
            fontSize: 16,
            boxSizing: 'border-box',
          }}
        />
      ))}

      <br />

      {/* Predict button */}
      <button
        onClick={handlePredict}
        style={{
          marginTop: 10,
          padding: '10px 20px',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Predict
      </button>

      {/* Prediction result */}
      {prediction !== null && (
        <p style={{ marginTop: 20, fontSize: 18 }}>
          🔮 Prediction: <strong>{prediction}</strong>
        </p>
      )}

      {/* Metrics charts & logs */}
      {metrics && (
        <>
          <h2 style={{ marginTop: 40 }}>Prediction Distribution</h2>
          <BarChart width={500} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>

          <h2 style={{ marginTop: 40 }}>Recent Predictions</h2>
          <ul
            style={{
              maxHeight: 200,
              overflowY: 'auto',
              padding: 0,
              listStyle: 'none',
              border: '1px solid #ccc',
              borderRadius: 5,
              marginTop: 10,
            }}
          >
            {metrics.log.length === 0 && <li>No recent predictions.</li>}
            {metrics.log.map((entry, idx) => (
              <li
                key={idx}
                style={{
                  padding: 10,
                  borderBottom: '1px solid #eee',
                  fontSize: 14,
                }}
              >
                <strong>Time:</strong>{' '}
                {new Date(entry.timestamp).toLocaleString()}
                <br />
                <strong>Input:</strong> [{entry.input.join(', ')}]
                <br />
                <strong>Prediction:</strong> {entry.prediction}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
