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

    await mongoose.connection.close();
});


describe('POST /api/match', () => {
    it('Should enter a match into the given tournament', async () => {
        const tournamentData = {
            match: {
                tournamentId: process.env.TEST_TOURNAMENT_ID,
                playerA: process.env.TEST_PLAYER_A_ID,
                playerB: process.env.TEST_PLAYER_A_ID,
                playerAScore: 21,
                playerBScore: 10,
                outcome: 'win',
                winner: 'playerA'
            }
        };

        const response = await request(app)
            .post('/api/match')
            .send(tournamentData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('matchId');
    });

    it('Should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/api/match')
            .send({ match: {} });

        expect(response.status).toBe(400);
    });


});

describe('GET /api/match', () => {
    it('Should return match details if matchId and tournamentId are provided', async () => {

        const tournamentId = process.env.TEST_TOURNAMENT_ID;

        const response = await request(app)
            .get(`/api/match?matchId=1&tournamentId=${tournamentId}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.gameId).toBe(1);
    });

    it('Should return 400 if tournamentId is not provided', async () => {
        const response = await request(app)
            .get('/api/match?matchId=1')
            .send();

        expect(response.status).toBe(400);
    });

    it('Should return 400 if tournament is not found', async () => {
        const response = await request(app)
            .get('/api/match?tournamentId=665573c91104ddfb6fdcfc32')
            .send();

        expect(response.status).toBe(400);
    });

    it('Should return all matches if only tournamentId is provided', async () => {
        const tournamentId = process.env.TEST_TOURNAMENT_ID;

        const response = await request(app)
            .get(`/api/match?tournamentId=${tournamentId}`)
            .send();

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

});








