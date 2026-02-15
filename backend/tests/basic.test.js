const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Need to export app from index.js

// Mock Auth Middleware? 
// For simplicity in this assessment, we might test public routes or mock the protect middleware.
// But let's just test a basic health check or auth failure if no token.

describe('API Endpoints', () => {
    it('GET / should return status message', async () => {
        // This assumes app is exported and server not started automatically if required by test
        // Refactoring index.js might be needed to separate app and server.listen
        // For now, let's assuming we just check the root route we added.
        // Wait, index.js sends 'CollabBoard API is running' on /
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('CollabBoard API is running');
    });

    it('GET /api/boards should fail without token', async () => {
        const res = await request(app).get('/api/boards');
        expect(res.statusCode).toEqual(401);
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
