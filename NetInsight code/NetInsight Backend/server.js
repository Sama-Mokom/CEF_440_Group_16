require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./DB');

const networkMetricsRoutes = require('./routes/networkMetrics');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.send('NetInsight backend running...');
});

app.use('/api/network-metrics', networkMetricsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});