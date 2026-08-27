import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './swagger.js';
import { errorConverter, errorHandler } from './middleware/error.middleware.js';
import ApiError from './utils/ApiError.js';
import env from './config/env.config.js';
const app = express();
// Initialize Swagger docs
setupSwagger(app);
// Security HTTP headers
app.use(helmet());
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
if (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test') {
    app.use('/api', limiter);
}
// parse json request body with strict size limits to prevent memory exhaustion
app.use(express.json({ limit: '10kb' }));
// parse urlencoded request body with strict size limits
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// enable cors
app.use(cors());
// HTTP request logger
app.use(morgan('dev'));
// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
import authRoutes from './api/auth/auth.routes.js';
import usersRoutes from './api/users/users.routes.js';
import opportunitiesRoutes from './api/opportunities/opportunities.routes.js';
import dealRoomRoutes from './api/deal-room/deal-room.routes.js';
import adminRoutes from './api/admin/admin.routes.js';
import chatRoutes from './api/chats/chats.routes.js';
import insightsRoutes from './api/insights/insights.routes.js';
// v1 api routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/opportunities', opportunitiesRoutes);
app.use('/api/v1/deal-room', dealRoomRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/insights', insightsRoutes);
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(404, 'Not found'));
});
// convert error to ApiError, if needed
app.use(errorConverter);
// handle error
app.use(errorHandler);
export default app;
