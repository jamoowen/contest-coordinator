import express, { Request, Response } from 'express';
import { Player } from '../models/player.mjs';
import mongoose from "mongoose";
import { Tournament } from '../models/tournament.mjs'

// when registering a player:
// 1. if doesnt exist -> insert into players collection
// 1. if exists && tournamentId not in tournamentsEntered -> update tournamentsEntered, dateModified
// 2. update tournament leaderboard with playerId


// GET PLAYER
export async function getPlayer(req: Request, res: Response) {
    const playerId = req.query.id;
    const username = req.query.username;
    const email = req.query.email;

    try {
        // Tournament oraginzers do not need access to all players in our db, only individually queried ones
        if (!playerId && (!username || !email)) {
            return res.status(400).json({ message: 'username + email or playerId is required' });
        }

        // if the playerId is supplied then query it
        if (playerId) {
            const player = await Player.findById({ _id: playerId });
            return player ? res.status(200).json(player) : res.status(400).json({ message: `Cannot find player (${playerId}) in database` })
        }
        // otherwise you can also 
        if (username && email) {
            const player = await Player.where("username").equals(username).where("email").equals(email)
            return player ? res.status(200).json(player) : res.status(400).json({ message: `Cannot find player (username: ${username}, email: ${email}) in database` })
        }
        return res.status(500).json({ message: "username + email or playerId is required" });
    } catch (error: any) {
        console.log("Error handling /players get request")
        return res.status(500).json({ error: error.toString() });
    }
}

// REGISTERS PLAYER FOR A SPECIFIC TOURNAMENT (internal function)
// this function will register a playerId with a given tournament 
async function registerPlayerWithTournament(playerId: string, tournamentId: string) {
    console.log(`registering: ${playerId}, tournament: ${tournamentId}`)
    try {
        const player = await Player.findById({ _id: playerId });
        const tournament = await Tournament.findById({ _id: tournamentId });
        const date = new Date()

        if (!player) {
            return { http: 400, message: "Can't find player in database" }
        }
        if (!tournament) {
            return { http: 400, message: "Can't find tournament in database" }
        }

        // this checks if the given playerId exists
        // firstly, if there is no length to the leaderboard, we return false. else, we return the result of the .some search
        // .some returns true if the given callback returns true for the array its enacted on
        const playerExists = tournament.leaderBoard.length ? tournament.leaderBoard.some(entry => entry.playerId.equals(playerId)) : false;

        // if the player is already in the leaderboard, we dont need to do anything
        if (playerExists) {
            return { http: 400, message: "Player already registered" }
        }

        // append player to leaderboard and update the dateModified (Should probably switch the dateModified to be handled by middleware)
        tournament.leaderBoard.push({ playerId: player._id, playerUsername: player.username });
        tournament.dateModified = date;
        player.tournamentsEntered.push(tournament._id);
        player.dateModified = date
        tournament.dateModified = new Date();


        await player.save()
        await tournament.save()
        return { http: 200, message: "Player successfully registered" }

    } catch (error: any) {
        console.log("Error registering player")
        return { http: 500, message: `Unable to register player for a given tournament: ${error.toString()}` }
    }
}

// EXISTING PLAYER
// this should update the characters document with the new tournament id && add the players id to tournament leaderboard
export async function registerExistingPlayer(req: Request, res: Response) {

    const data = req.body


    try {
        if (!data.name || !data.username || !data.email || !data.tournamentId) {
            return res.status(400).json({ message: 'name, username, email, and tournament id must be supplied' });
        }

        // here, I'm checking if the player exists with a given username email combo
        // we would need extra checks like this to ensure the player registering is indeed the player in out db
        const userId = await Player.exists({ username: data.username, email: data.email })
        const tournamentId = await Tournament.exists({ _id: data.tournamentId })

        if (!userId) {
            return res.status(400).json({ message: `Unable to find a user matching the username (${data.username}) and email (${data.email})` });
        }
        if (!tournamentId) {
            return res.status(400).json({ message: `Unable to find a tournament matching the id (${data.tournamentId})` });
        }

        // annoyingly typescript was complaining about the objectId type so i cast to string. might be better to fix later
        const registerResponse = await registerPlayerWithTournament(userId._id.toString(), tournamentId._id.toString())

        return res.status(registerResponse.http).json({ message: registerResponse.message })

    } catch (error: any) {
        console.log(`Unable to register existing player: ${error.toString()}`)
        return { http: 500, message: `Unable to register existing player: ${error.toString()}` }
    }

}


// NEW PLAYER 
// this is to be called if the player has never registered before
export async function registerNewPlayer(req: Request, res: Response) {
    try {
        const data = req.body
        const date = new Date()

        if (!data.name || !data.username || !data.email || !data.tournamentId) {
            return res.status(400).json({ message: 'name, username, email, and tournament id must be supplied' });
        }

        const tournamentId = await Tournament.exists({ _id: data.tournamentId })
        const playerAlreadyExists = await Player.exists({ username: data.username })

        if (!tournamentId) {
            return res.status(400).json({ message: `Unable to find a tournament matching the id (${data.tournamentId})` });
        }
        if (playerAlreadyExists) {
            return res.status(400).json({message: `User (${data.username}) already exists in database`})
        }


        // the create method returns the _id
        const player = await Player.create({
            name: data.name,
            username: data.username,
            email: data.email,
            dateCreated: date,
            dateModified: date,
            contactDetails: { number: data?.number, twitter: data?.twitter, discord: data?.discord },
            tournamentsEntered: [tournamentId],
            games: {
                played: 0,
                won: 0,
                lost: 0,
                void: 0
            }

        })

        const registerResponse = await registerPlayerWithTournament(player._id.toString(), tournamentId.toString())

        return res.status(registerResponse.http).json({ message: registerResponse.message })
    } catch (error: any) {
        console.log(`Unable to register new player: ${error.toString()}`)
        return { http: 500, message: `Unable to register new player: ${error.toString()}` }
    }


}

// tournament 6651c799abaa52775cef792f

// curl --header "Content-Type: application/json" \
//   --request POST \
//   --data '{"name":"james","username":"jamoowen", "email":"test@gmail.com", "tournamentId":"6651c80055f517ad10cb6f3a"}' \
//   http://localhost:8000/api/player/new


// curl "http://localhost:8000/api/players?id=6651c80055f517ad10cb6f3a"
// 6651c80055f517ad10cb6f3a