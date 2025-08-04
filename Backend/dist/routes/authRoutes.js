"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Register new user
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, department, position, employeeId, phone } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ $or: [{ email }, { employeeId }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or employee ID already exists' });
        }
        // Create new user
        const user = new User_1.default({
            firstName,
            lastName,
            email,
            password,
            department,
            position,
            employeeId,
            phone,
            role: 'employee' // Default role
        });
        await user.save();
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                department: user.department,
                position: user.position,
                employeeId: user.employeeId
            }
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to register user' });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                department: user.department,
                position: user.position,
                employeeId: user.employeeId,
                avatar: user.avatar
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});
// Get current user profile
router.get('/me', auth_1.auth, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// Update user profile
router.put('/me', auth_1.auth, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // Don't allow password update through this route
        delete updates.role; // Don't allow role update through this route
        const user = await User_1.default.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update profile' });
    }
});
// Change password
router.put('/change-password', auth_1.auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to change password' });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map