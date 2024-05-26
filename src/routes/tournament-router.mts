import express, { Request, Response } from 'express';

import { getTournaments, initializeTournament } from '../controllers/tournament-controller.mjs'

const router = express.Router();


router.get('/tournaments', getTournaments)
router.post('/tournaments', initializeTournament)

export { router } 