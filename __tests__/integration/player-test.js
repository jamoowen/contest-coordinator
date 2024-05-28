import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';

import app from '../../dist/index.mjs'; // Change require to import
import { Player } from '../../dist/models/player.mjs';

import dotenv from "dotenv";
dotenv.config();


beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING);
});

/* Closing database connection after each test. */
// afterEach(async () => {
//   await mongoose.connection.close();
// });

afterAll(async () => {
  await Player.deleteMany({ username: /^test_user/ });
  await mongoose.connection.close(); 
})

// Tests for getPlayer function
describe('GET /api/player', () => {
  it('should return 400 if no playerId, username, or email is provided', async () => {
    await request(app)
      .get('/api/player')
      .expect(400);
  });

  it('should return player details if playerId is provided', async () => {
    // Assuming playerId exists in the database
    const playerId =process.env.TEST_PLAYER_A_ID;
    await request(app)
      .get(`/api/player?id=${playerId}`)
      .expect(200);
  });

  it('should return player details if username and email are provided', async () => {
    // Assuming username and email combination exists in the database
    const username = process.env.TEST_PLAYER_A_USERNAME;
    const email = process.env.TEST_PLAYER_A_EMAIL;
    await request(app)
      .get(`/api/player?username=${username}&email=${email}`)
      .expect(200);
  });
});

// Tests for registerExistingPlayer function
describe('POST /api/player/existing', () => {
  it('should return 400 if required fields are missing', async () => {
    await request(app)
      .post('/api/player/existing')
      .send({})
      .expect(400);
  });

  it('should return 400 if user does not exist with provided username and email', async () => {
    // Assuming user does not exist in the database
    const tournamentId = process.env.TEST_TOURNAMENT_ID;
    await request(app)
      .post('/api/player/existing')
      .send({ name: 'John Doe', username: 'non_existent_user', email: 'non_existent_email@example.com', tournamentId: tournamentId })
      .expect(400);
  });

  it('should return 400 if tournament does not exist with provided ID', async () => {
    // Assuming tournament does not exist in the database
    await request(app)
      .post('/api/player/existing')
      .send({ name: 'John Doe', username: 'existing_user', email: 'existing_email@example.com', tournamentId: '665573c91104ddfb6fdcfc32' })
      .expect(400);
  });

  // it('should return 200 if all inputs are valid', async () => {
  //   // Assuming valid inputs and existing user and tournament
  //   await request(app)
  //     .post('/api/player/existing')
  //     .send({ name: 'John Doe', username: 'existing_user', email: 'existing_email@example.com', tournamentId: 'some_tournament_id' })
  //     .expect(200);
  // });
});

// Tests for registerNewPlayer function
describe('POST /api/player/new', () => {
  it('should return 400 if required fields are missing', async () => {
    await request(app)
      .post('/api/player/new')
      .send({})
      .expect(400);
  });

  it('should return 400 if tournament does not exist with provided ID', async () => {
    // Assuming tournament does not exist in the database
    await request(app)
      .post('/api/player/new')
      .send({ name: 'TEST', username: 'test_user', email: 'new_email@example.com', tournamentId: '665573c91104ddfb6fdcfc32' })
      .expect(400);
  });

  it('should return 400 if username already exists in the database', async () => {
    // Assuming username already exists in the database
    const existingUsername = process.env.TEST_PLAYER_A_USERNAME;
    const existingEmail = process.env.TEST_PLAYER_A_EMAIL;
    const tournamentId = process.env.TEST_TOURNAMENT_ID;
    await request(app)
      .post('/api/player/new')
      .send({ name: 'John Doe', username: existingUsername, email: existingEmail, tournamentId: tournamentId })
      .expect(400);
  });

  it('should return 200 if all inputs are valid', async () => {
    // Assuming valid inputs and existing tournament
    const tournamentId = process.env.TEST_TOURNAMENT_ID;
    await request(app)
      .post('/api/player/new')
      .send({ name: 'TEST', username: 'test_user', email: 'new_email@example.com', tournamentId: tournamentId })
      .expect(200);
  });
});
