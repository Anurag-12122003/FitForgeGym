import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { FitnessLevel, Gender } from '../../generated/prisma/enums.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
const updateProfileSchema = z.object({
  gender: z.nativeEnum(Gender),
  age: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  fitnessLevel: z.nativeEnum(FitnessLevel),
  primaryGoal: z.string().optional(),
});

// POST: Register User
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName
      },
      include: { profile: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '2d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
});

// POST: Login User
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Login failed' });
  }
});

// GET: Current Authenticated User Info
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName:user.fullName,
      role: user.role,
      profile: user.profile,
    },
  });
});

// POST: Logout (Clear Cookie)
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// PUT: Update Profile (User data update)
router.put(
  '/profile',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      console.log("UserId", userId)
      const data = updateProfileSchema.parse(req.body);
      console.log("data", data)
      const profile = await prisma.profile.upsert({
        where: {
          userId,
        },

        create: {
          userId,
          gender: data.gender,
          age: data.age ?? null,
          heightCm: data.heightCm ?? null,
          weightKg: data.weightKg ?? null,
          fitnessLevel: data.fitnessLevel,
          primaryGoal: data.primaryGoal ?? null,
        },

        update: {
          gender: data.gender ?? null,
          age: data.age ?? null,
          heightCm: data.heightCm ?? null,
          weightKg: data.weightKg ?? null,
          fitnessLevel: data.fitnessLevel,
          primaryGoal: data.primaryGoal ?? null,
        },
      });


      res.json({
        message: 'Profile updated successfully',
        profile,
      });
    } catch (error: any) {
      res.status(400).json({
        message: error.message || 'Failed to update profile',
      });
    }
  }
);

router.get('/all', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Prisma से सभी यूज़र्स का डेटा निकाला और प्रोफाइल को शामिल किया
    const users = await prisma.user.findMany({
      include: { 
        profile: true 
      },
      orderBy: { 
        createdAt: 'desc' // नए यूज़र्स तालिका में सबसे ऊपर दिखेंगे
      }
    });

    if (!users || users.length === 0) {
      res.status(404).json({ message: 'No users found' });
      return;
    }

    const formattedUsers = users.map(user => {
      // तिथि (Joined Date) को YYYY-MM-DD फॉर्मेट में बदलने के लिए
      const joinedDate = user.createdAt.toISOString().split('T')[0];

      return {
        name: user.fullName || "N/A",              // NAME
        email: user.email,                         // EMAIL
        primaryGoal: user.profile?.primaryGoal || "Not Set", // PRIMARY GOAL (Profile मॉडल से)
        joinedDate: joinedDate,                     // JOINED DATE (createdAt से)
        role:user.role,
        status: user.profile === null ? "Inactive" : "Active",  // STATUS (Profile मॉडल से या Default)
      };
    });

    res.json({ users: formattedUsers });

  } catch (error) {
    console.error("Error fetching admin user list:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;