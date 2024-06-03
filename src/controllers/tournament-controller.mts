import express, { Request, Response } from 'express';
import { Tournament, platformEnum } from '../models/tournament.mjs';
import { validateInput } from '../services/validate-input.mjs';
// we need to handle a few different calls to /tournaments
// 1. GET list of all tournaments
// 2. GET details of a specific tournament, including leaderboard (if there is a param)
// 3. POST initialize a new tournament, return the tournament ID

export async function getTournaments(req: Request, res: Response) {
    const tournamentId = req.query.id
    // return res.status(200).json({"tournaments": [{"tournament1": "boohoo"}]}) 
    // if we are provided a tournament query param, then provide data just relating to that tournament
    try {
        if (tournamentId) {
            const data = await Tournament.findById({ _id: tournamentId })
            // if we find the tournament via the given id return it, else return 400 and the err message
            return data ? res.status(200).json(data) : res.status(400).json({ message: `Cannot find tournament (${tournamentId}) in database` })

        } else {
            // return all tournaments
            const data = await Tournament.find({})
            return res.status(200).json(data)
        }
    } catch (error: any) {
        console.log("Error handling /tournaments get request")
        return res.status(500).json({ error: error.toString() });

    }
}

export async function getLeaderboard(req: Request, res: Response) {
    const tournamentId = req.query.id
    // return res.status(200).json({"tournaments": [{"tournament1": "boohoo"}]}) 
    // if we are provided a tournament query param, then provide data just relating to that tournament
    try {
        if (!tournamentId) {
            console.log(`You must provide a valid tournament id to view leaderboard`)
            return res.status(400).json({ message: `You must provide a valid tournament id` })
        }

        const data = await Tournament.findById({ _id: tournamentId })

        if (!data) {
            console.log(`Unable to find the given tournament`)
            return res.status(400).json({ message: `Unable to find the given tournament` })
        }

        const leaderboard = data.leaderBoard;
        const sortedLeaderboard = leaderboard.sort((a: any, b: any) => b.won - a.won);
        return res.status(200).json(sortedLeaderboard)

    } catch (error: any) {
        console.log("Error handling /tournaments get request")
        return res.status(500).json({ error: error.toString() });

    }
}

// Needed fields in body:
// tournamentName
// tournamentDescription
// tournamentFormat
// gameName
// platform

export async function initializeTournament(req: Request, res: Response) {
    const data = req.body
    // validate all required data is supplied
    const requiredInput = ["tournamentName", "tournamentDescription", "tournamentFormat", "gameName", "platform", "prize"]
    const validInput = await validateInput(data, requiredInput)

    if (!validInput) { return res.status(400).json({ message: `Ensure all input fields are populated: ${requiredInput}` }); }
    // platform supplied must be one of supplied list
    if (!data.platform || !platformEnum.includes(data.platform)) {
        return res.status(400).json({ message: "platform must be one of the following: ['PC', 'PS', 'Xbox', 'Console', 'Crossplay', 'Mobile', 'Nintendo', 'Other']" });
    }

    const date = new Date();

    const tournament = await Tournament.create({
        tournamentName: data.tournamentName,
        tournamentDescription: data.tournamentDescription,
        tournamentFormat: data.tournamentFormat,
        gameName: data.gameName,
        platform: data.platform,
        prize: data.prize,
        dateCreated: date,
        dateModified: date,
        leaderBoard: [],
        games: []
    })
    return res.status(200).json({ message: `Succesffully initialized tournament '${tournament.tournamentName}' `, tournamentId: tournament._id })

}

// curl --header "Content-Type: application/json" \
//   --request POST \
//   --data '{"tournamentName":"xyz","tournamentDescription":"a tournament", "tournamentFormat":"p", "gameName":"mw3", "platform":"PC", "prize": "nothing"}' \
//   http://localhost:8000/api/tournaments


// curl "http://localhost:8000/api/tournaments?id=6651c80055f517ad10cb6f3a"
// 6651c80055f517ad10cb6f3a
