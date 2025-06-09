import Employee from '../model/employee.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import sendEmail from "../utils/SendEmail.utils.js";
import Category from '../model/Category.js';
import path from 'path';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET_KEY;



// Create
export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read All
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read One
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Not found' });

    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Not found' });

    await employee.destroy();
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const signUp = async (req, res) => {
  try {
    const { full_name, email, phone_number, password, confirm_password } = req.body;

    const missingFields = [];
    if (!full_name) missingFields.push("full_name");
    if (!email) missingFields.push("email");
    if (!phone_number) missingFields.push("Phone_number");
    if (!password) missingFields.push("password");
    if (!confirm_password) missingFields.push("confirm_password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missing: missingFields
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await Employee.create({
      full_name:full_name,
      email,
      phone_number,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: newCustomer.id, email: newCustomer.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: "Signup successful",
      Employee: {
        id: newCustomer.id,
        full_name: newCustomer.full_name,
        email: newCustomer.email,
        phone_number: newCustomer.phone_number
      },
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};


export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingCustomer = await Employee.findOne({ where: { email } });
    if (!existingCustomer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, existingCustomer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: existingCustomer.id, email: existingCustomer.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: "Sign in successful",
      customer: {
        id: existingCustomer.id,
        Full_name: existingCustomer.Full_name,
        email: existingCustomer.email,
        Phone_number: existingCustomer.Phone_number
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



  

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // expires in 5 minutes

    // Save OTP and expiry to user
    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    // Send OTP via email
    const message = `Your OTP for password reset is: ${otp}. It will expire in 5 minutes.`;

    await sendEmail(
      user.email,
      "Password Reset OTP",
      message
    );

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Employee.findOne({ email });

    if (!user || user.resetOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid — you can now allow password reset
    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.filename : null;
    const cat = await Category.create({ name, image });
    res.status(201).json(cat);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (req.file) {
      // Delete old image file if exists
      if (category.image) {
        const oldImagePath = path.join('uploads', category.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      category.image = req.file.filename;
    }

    if (name) category.name = name;

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Delete image file if exists
    if (category.image) {
      const imagePath = path.join('uploads', category.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



