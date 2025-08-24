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
  const [metrics, setMetrics] = useState<any>(null);

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
      const data = await res.json();
      setPrediction(data.prediction);
      fetchMetrics(); // refresh metrics after prediction
    } catch (err) {
      console.error('Prediction failed:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(
        'https://ml-api-fastapi-nwok.onrender.com/metrics'
      );
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const chartData = metrics
    ? Object.entries(metrics.prediction_distribution).map(([label, count]) => ({
        name: label,
        count,
      }))
    : [];

  return (
    <main style={{ padding: 40, maxWidth: 700, margin: 'auto' }}>
      <h1>🌼 ML Prediction App with Observability</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
        {features.map((val, i) => (
          <input
            key={i}
            type="number"
            placeholder={`Feature ${i + 1}`}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            style={{
              padding: 10,
              fontSize: 16,
              width: 100,
            }}
          />
        ))}
      </div>

      <button
        onClick={handlePredict}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          fontSize: 16,
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        Predict
      </button>

      {prediction !== null && (
        <p style={{ marginTop: 20, fontSize: 18 }}>
          🔮 Prediction: <strong>{prediction}</strong>
        </p>
      )}

      {metrics && (
        <>
          <h2 style={{ marginTop: 40 }}>📊 Prediction Distribution</h2>
          <BarChart width={500} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>

          <h2 style={{ marginTop: 40 }}>🧾 Recent Predictions</h2>
          <ul
            style={{
              listStyle: 'none',
              maxHeight: 200,
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: 0,
              borderRadius: 5,
            }}
          >
            {metrics.log.length === 0 && <li style={{ padding: 10 }}>No logs.</li>}
            {metrics.log.map((entry: any, idx: number) => (
              <li
                key={idx}
                style={{
                  padding: 10,
                  borderBottom: '1px solid #eee',
                  fontSize: 14,
                }}
              >
                <strong>🕒</strong> {new Date(entry.timestamp).toLocaleString()}
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
