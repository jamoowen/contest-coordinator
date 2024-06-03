import express, { Request, Response } from 'express';

import { getLeaderboard, getTournaments, initializeTournament } from '../controllers/tournament-controller.mjs'

const router = express.Router();


router.get('/tournaments', getTournaments)
router.get('/tournaments/leaderboard', getLeaderboard)
router.post('/tournaments', initializeTournament)


export { router } 