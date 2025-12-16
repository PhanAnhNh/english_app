const express = require('express');
const router = express.Router();
const listeningController = require('../controller/listeningController');

router.get('/', listeningController.getAllListenings);
router.get('/:id', listeningController.getListeningById);
router.post('/', listeningController.createListening);
router.put('/:id', listeningController.updateListening);
router.delete('/:id', listeningController.deleteListening);

module.exports = router;