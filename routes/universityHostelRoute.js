const express = require('express');
const router = express.Router();
const { getHostelsByCity } = require('../controllers/universityHostelController');
const { getHostelById } = require('../controllers/universityHostelController');

router.get('/:city/hostels', getHostelsByCity);




router.get('/hostel/:id', getHostelById);


module.exports = router;
