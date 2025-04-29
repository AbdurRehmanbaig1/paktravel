const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Routes
const clientRoutes = require('./routes/clientRoutes');
const tourRoutes = require('./routes/tourRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/tours', tourRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Travel Agency Management API');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 