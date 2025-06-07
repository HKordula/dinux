import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import publicRoutes from './routes/publicRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './middleware/logger.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use(logger)

// Auth
app.use('/api', authRoutes);

// Public
app.use('/api', publicRoutes);

// User
app.use('/api', userRoutes);

// Admin
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// general error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}\nGo to http://localhost:${PORT}/index.html`));