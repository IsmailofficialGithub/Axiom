import request from 'supertest';
import app from '../../app.js';
import * as authService from './auth.service.js';
// Mock the auth service to prevent real database/Supabase calls during testing
jest.mock('./auth.service.js', () => ({
    registerUser: jest.fn(),
    loginUser: jest.fn(),
}));
describe('Auth Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/v1/auth/register', () => {
        it('should return 201 when registration is successful', async () => {
            // Setup mock
            const mockResult = { message: 'User registered successfully. Proceed to login.' };
            authService.registerUser.mockResolvedValue(mockResult);
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User',
                role: 'investor',
            });
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockResult);
            expect(authService.registerUser).toHaveBeenCalledTimes(1);
        });
        it('should return 400 validation error if email is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                password: 'password123',
                full_name: 'Test User',
                role: 'investor',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid email');
            expect(authService.registerUser).not.toHaveBeenCalled();
        });
    });
    describe('POST /api/v1/auth/login', () => {
        it('should return 200 and a token when login is successful', async () => {
            // Setup mock
            const mockResult = {
                access_token: 'fake-jwt',
                user: { id: '1', email: 'test@example.com', role: 'investor' },
            };
            authService.loginUser.mockResolvedValue(mockResult);
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockResult);
            expect(authService.loginUser).toHaveBeenCalledTimes(1);
        });
    });
});
