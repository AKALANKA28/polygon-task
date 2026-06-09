const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/stats', taskController.getStats);
router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', roleCheck('admin'), taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', roleCheck('admin'), taskController.delete);
router.get('/:id/comments', taskController.getComments);
router.post('/:id/comments', taskController.addComment);

module.exports = router;
