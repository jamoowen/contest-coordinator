import express, { Request, Response } from 'express';

import { getTournaments, initializeTournament } from '../controllers/tournament-controller.mjs'

const router = express.Router();

// get all tournaments
// router.get('/tournaments', async (req: Request, res: Response) => {
//     const data = await Tournament.find({});
//     console.log("Retrieved tournaments")
//     res.status(200).json(data)

// })

router.get('/tournaments', getTournaments)
router.post('/tournaments', initializeTournament)

export { router } 