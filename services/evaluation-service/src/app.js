const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');

const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const certificateRoutes = require('./routes/certificates');

const app = express();

const allowedOrigins = [
  'https://eduplus-academy-ty5x.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/evaluations/health', async (req, res) => {
  const ok = await db.health();
  res.json({ ok });
});

app.use('/api/evaluations', (req, res, next) => next()); // namespace
app.use('/api/evaluations', teacherRoutes);
app.use('/api/evaluations', studentRoutes);
app.use('/api/evaluations', certificateRoutes);

module.exports = app;