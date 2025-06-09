import express from 'express';
import { signUpSchema } from '../validation/userValidation.js';
import upload from '../middlewares/upload.js';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  signUp,
  signIn,
  forgotPassword,
  verifyOtp,
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory
} from '../controllers/employeeController.js';

const router = express.Router();

// --- Employee Routes ---
router.post('/', createEmployee);
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

router.post('/sign-up', (req, res, next) => {
  const { error } = signUpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  return signUp(req, res, next);
});
router.post('/sign-in', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);


router.post('/add-category', upload.single('image'), addCategory);
router.get('/categories', getCategories);
router.get('/category/:id', getCategories); 
router.put('/category/:id', upload.single('image'), updateCategory);
router.delete('/category/:id', deleteCategory);

export default router;
