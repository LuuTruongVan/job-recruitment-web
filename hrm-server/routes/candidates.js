const express = require('express');
const router = express.Router();
const CandidatesController = require('../controllers/candidatesController');

router.get('/get-all', CandidatesController.getAll);
router.get('/count', CandidatesController.count);
router.post('/add', CandidatesController.create);
router.put('/update', CandidatesController.update);
router.get('/:id', CandidatesController.getProfile);
router.delete('/delete/:id', CandidatesController.delete);
router.get('/by-user/:userId', CandidatesController.getByUser);

module.exports = router;
