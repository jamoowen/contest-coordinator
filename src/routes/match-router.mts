import express, { Request, Response } from 'express';

import { getMatch, recordMatch } from '../controllers/match-controller.mjs';

const router = express.Router();


router.get('/match', getMatch)
router.post('/match', recordMatch)
export { router } 