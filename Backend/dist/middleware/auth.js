"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerAuth = exports.adminAuth = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};
exports.auth = auth;
const adminAuth = async (req, res, next) => {
    try {
        await (0, exports.auth)(req, res, () => { });
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Access denied.' });
    }
};
exports.adminAuth = adminAuth;
const managerAuth = async (req, res, next) => {
    try {
        await (0, exports.auth)(req, res, () => { });
        if (!['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Manager privileges required.' });
        }
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Access denied.' });
    }
};
exports.managerAuth = managerAuth;
//# sourceMappingURL=auth.js.map