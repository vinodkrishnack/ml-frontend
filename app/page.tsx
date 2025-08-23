'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
    const res = await fetch('https://ml-api-fastapi-nwok.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: features.map(Number) }),
    });
    const data = await res.json();
    setPrediction(data.prediction);
    fetchMetrics(); // Refresh chart after prediction
  };

  const fetchMetrics = async () => {
    const res = await fetch('https://ml-api-fastapi-nwok.onrender.com/metrics');
    const data = await res.json();
    setMetrics(data);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const chartData = {
    labels: metrics ? Object.keys(metrics.prediction_distribution) : [],
    datasets: [
      {
        label: 'Predictions Count',
        data: metrics ? Object.values(metrics.prediction_distribution) : [],
        backgroundColor: '#0070f3',
      },
    ],
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>🧠 ML Prediction App</h1>

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
        🔍 Predict
      </button>

      {prediction !== null && (
        <p>
          🔮 Prediction Result: <strong>{prediction}</strong>
        </p>
      )}

      {metrics && (
        <>
          <h2>📊 Prediction Distribution</h2>
          <div style={{ maxWidth: 400, marginBottom: 40 }}>
            <Bar data={chartData} />
          </div>

          <h2>📄 Recent Logs</h2>
          <ul>
            {metrics.log.map((entry: any, idx: number) => (
              <li key={idx}>
                <strong>{entry.timestamp}</strong>: Predicted <b>{entry.prediction}</b> for input: {JSON.stringify(entry.input)}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
