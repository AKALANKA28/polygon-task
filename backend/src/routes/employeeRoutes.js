const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

// Profile routes (any authenticated user)
router.get('/profile', employeeController.getProfile);
router.put('/profile', employeeController.updateProfile);

// Employee management routes (admin only)
router.get('/', roleCheck('admin'), employeeController.getAll);
router.post('/', roleCheck('admin'), employeeController.createEmployee);
router.get('/:id', roleCheck('admin'), employeeController.getById);
router.put('/:id', roleCheck('admin'), employeeController.updateEmployee);
router.delete('/:id', roleCheck('admin'), employeeController.deleteEmployee);
router.get('/:id/stats', roleCheck('admin'), employeeController.getStats);

module.exports = router;
