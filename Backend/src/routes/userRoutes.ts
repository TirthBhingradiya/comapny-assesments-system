import express, { Request } from 'express';
import { auth, adminAuth ,managerAuth} from '../middleware/auth';
import User from '../models/User';

// Extend the Request interface to include user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Get all users (admin and manager only)
router.get('/', managerAuth, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, department, role, search } = req.query;

    const filter: any = {};

    // Role-based filtering
    if (req.user.role === 'manager') {
      // Managers can only see users in their department
      filter.department = req.user.department;
    }
    // Admins can see all users (no additional filtering)

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get basic user list for regular users (limited data)
router.get('/basic/list', auth, async (req: AuthRequest, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('firstName lastName email department role employeeId')
      .sort({ firstName: 1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (admin only)
router.put('/:id', adminAuth, async (req: AuthRequest, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Handle password separately

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Toggle user active status (admin only)
router.patch('/:id/toggle-status', adminAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Get team members (manager only)
router.get('/team/members', managerAuth, async (req: AuthRequest, res) => {
  try {
    // Only managers can access this route
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Only managers can view team members.' });
    }

    const teamMembers = await User.find({ 
      department: req.user.department,
      role: 'employee',
      isActive: true 
    })
    .select('firstName lastName email employeeId position phone')
    .sort({ firstName: 1 });

    res.json({ teamMembers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get users for asset assignment (admin and manager only)
router.get('/assignment/list', auth, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission to assign assets
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only managers and admins can assign assets.' });
    }

    let filter: any = { isActive: true };

    // Role-based filtering
    if (req.user.role === 'manager') {
      // Managers can only see users in their department
      filter.department = req.user.department;
    }
    // Admins can see all users (no additional filtering)

    const users = await User.find(filter)
      .select('firstName lastName email employeeId department role position phone')
      .sort({ firstName: 1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users for assignment' });
  }
});

// Get user profile (own profile or admin/manager viewing others)
router.get('/profile/:id', auth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Role-based access control
    if (req.user.role === 'employee') {
      // Employees can only view their own profile
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
      }
    } else if (req.user.role === 'manager') {
      // Managers can view profiles of users in their department
      if (user.department !== req.user.department) {
        return res.status(403).json({ error: 'Access denied. You can only view profiles of users in your department.' });
      }
    }
    // Admins can view any profile
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router; 