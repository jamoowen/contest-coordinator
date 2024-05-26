import express, { Request, Response } from 'express';

import { getPlayer, registerNewPlayer, registerExistingPlayer } from '../controllers/player-controller.mjs';

const router = express.Router();


router.get('/player', getPlayer)
router.post('/player/new', registerNewPlayer)
router.post('/player/existing', registerExistingPlayer)
export { router } 