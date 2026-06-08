const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));

// Profile routes (shortcut)
const auth = require('./middleware/auth');
const employeeController = require('./controllers/employeeController');
app.get('/api/profile', auth, employeeController.getProfile);
app.put('/api/profile', auth, employeeController.updateProfile);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'polygon-task-api' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
