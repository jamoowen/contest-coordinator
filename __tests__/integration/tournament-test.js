import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../dist/index.mjs'; // Change require to import
import { Tournament } from '../../dist/models/tournament.mjs';

import dotenv from "dotenv";
dotenv.config();

beforeAll(async () => {
    await mongoose.connect(process.env.CONNECTION_STRING);
});

/* Closing database connection after each test. */
afterAll(async () => {
    await Tournament.deleteMany({ tournamentName: /^test_tournament/ });
    await mongoose.connection.close();
});

describe('POST /api/tournaments', () => {
    it('Should create a new tournament and return the tournament id', async () => {
        const tournamentData = {
            tournamentName: 'test_tournament',
            tournamentDescription: '...',
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
        const tournamentId = process.env.TEST_TOURNAMENT_ID; 
        const response = await request(app).get(`/api/tournaments?id=${tournamentId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('tournamentName');
    });

});

describe('GET /api/tournaments/leaderboard', () => {
    it('should return the sorted leaderboard', async () => {
        const tournamentId = process.env.TEST_TOURNAMENT_ID; 
        const response = await request(app).get(`/api/tournaments/leaderboard?id=${tournamentId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 400 if no tournamentid is provided', async () => {
        
        const response = await request(app).get(`/api/tournaments/leaderboard`);
        expect(response.status).toBe(400);
        
    });

});





