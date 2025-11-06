const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');

const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const certificateRoutes = require('./routes/certificates');

const app = express();
app.use(cors());
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