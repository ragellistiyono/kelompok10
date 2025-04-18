import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';
import config from './config/app.config';
import { globalErrorHandler, AppError } from './utils/errorHandler';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Capture the original send method
  const originalSend = res.send;
  
  // Override the send method
  res.send = function(body) {
    console.log(`[${new Date().toISOString()}] Response: ${res.statusCode}`);
    // Call the original send method
    return originalSend.call(this, body);
  };
  
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(err, req, res, next);
});

// Server
const port = config.port || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port} in ${config.nodeEnv || 'development'} mode`);
  console.log(`API available at http://localhost:${port}/api`);
}); 