import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../dist/index.mjs'; // Change require to import

import dotenv from "dotenv";
dotenv.config();

beforeEach(async () => {
    await mongoose.connect(process.env.CONNECTION_STRING);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe('POST /api/tournaments', () => {
    it('Should create a new tournament and return the tournament id', async () => {
        const tournamentData = {
            tournamentName: 'A battle in a galaxy far far away',
            tournamentDescription: 'the force...',
            tournamentFormat: 'Single Elimination',
            gameName: 'Battlefront 2',
            platform: 'PS',
            prize: '$1000000'
        };

        const response = await request(app)
            .post('/api/tournaments')
            .send(tournamentData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('tournamentId');
    });

});

describe('GET /api/tournaments', () => {
    it('should return all tournaments if no query param', async () => {
        const response = await request(app).get('/api/tournaments');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a specific tournament by ID', async () => {
        const tournamentId = '665350e27092d3c62176b180'
        const response = await request(app).get(`/api/tournaments?id=${tournamentId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('tournamentName');
    });

});





