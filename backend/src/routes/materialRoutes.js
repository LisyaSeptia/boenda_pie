const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getMaterials)
  .post(authorize('ADMIN'), createMaterial);

router.route('/:id')
  .get(getMaterialById)
  .put(authorize('ADMIN'), updateMaterial)
  .delete(authorize('ADMIN'), deleteMaterial);

module.exports = router;
