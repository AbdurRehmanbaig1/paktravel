const express = require('express');
const { addTour, getAllTours, getTourById } = require('../controllers/tourController');

const router = express.Router();

// POST /api/tours - Add a new tour
router.post('/', addTour);

// GET /api/tours - Get all tours
router.get('/', getAllTours);

// GET /api/tours/:clientPhone/:tourId - Get tour by ID
router.get('/:clientPhone/:tourId', getTourById);

module.exports = router; 