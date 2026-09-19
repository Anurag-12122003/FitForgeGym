import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './module/auth/auth.route.js';
import exerciseRoutes from './module/exercises/exercise.route.js';
import routineRoutes from './module/routines/routine.route.js';
import trackerRoutes from './module/workouts/tracker.route.js';
import foodRoutes from './module/foods/food.route.js';
import dietRoutes from './module/nutrition/diet.route.js';
import uploadRoutes from './module/upload/upload.route.js';
import progressRoutes from './module/progress/progress.route.js';
import muscleRouter from './module/muscles/muscle.route.js';
import aiRoutes from './module/ai/ai.route.js';
import equipmentRoutes from './module/equipment/equipment.route.js';

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173' || 'http://localhost:5174',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// Modular API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/diet-plans', dietRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/muscles', muscleRouter);
app.use('/api/ai', aiRoutes);
app.use('/api/equipment', equipmentRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', database: 'MySQL', architecture: 'ESM' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred',
  });
});