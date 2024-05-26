import express, { Request, Response } from 'express';
import { Player } from '../models/player.mjs';
import mongoose from "mongoose";
import { Tournament } from '../models/tournament.mjs';


// Here we need to fetch the matchups for a given tournament + insert new matchup
// match record whould update bothe the players and tournament collections


// GET Match 
export async function getMatch(req: Request, res: Response) {
    const matchId = Number(req.query.matchId);
    const tournamentId = req.query.tournamentId;

    try {

        if (!tournamentId) {
            return res.status(400).json({ message: 'tournamentId must be supplied!' });
        }

        const tournament = await Tournament.findById({ tournamentId });

        if (!tournament) {
            return res.status(400).json({ message: `Tournament (${tournamentId}) not found in database` });
        }

        if (!tournament.games.length) {
            return res.status(400).json({ message: `No games played for tournament (${tournament.tournamentName})` });
        }

        if (matchId) {
            // find the match 
            const match = tournament.games.find(entry => entry.gameId === matchId);
            // if the match exists, return it, else return 400
            return match ? res.status(200).json(match) : res.status(400).json({ message: `Match (${matchId}) does not exist in Tournament (${tournament.tournamentName})` });
        }

        // if we are not supplied with a specific matchId via query params, return all of the games for the tournament
        return res.status(200).json(tournament.games)


    } catch (error: any) {
        console.log(`Unable to get games with query params: ${JSON.stringify(req.query)}: ${error.toString()}`)
        return { http: 500, message: `Unable to register new player: ${error.toString()}` }
    }

}




// New matchup
// insert into tournament.games
// insert gamId and outcome to players
// to record a mtach, we need an object describing the match, as well as the tournamentId: 
// matchObj = {
//     tournamentId: ,
//     playerA: '',
//     playerB: '',
//     playerAScore: ,
//     playerBScore: ,
//     outcome: ['win', 'draw', 'void', 'in progress'] ,
//     winner: playerA | playerB | null
// }

// this is a bigger function than i had planned, would be better to try split it up 
export async function recordMatch(req: Request, res: Response) {
    // push match outcome to tournaments.games
    // update leaderboard with winner
    // update player with game outcome

    try {
        const match = req.body.match
        const date = new Date()

        // all fields must be populated to correctly record a match
        if (!match.playerA || !match.playerB || !match.playerAScore || !match.playerBScore || !match.outcome || !match.winner) {
            return res.status(400).json({ message: 'match object must be fully populated: match: {tournamentId: , playerA: , playerB: , playerAScore: , playerBScore, outcome, winner }' });
        }

        if (!['win', 'draw', 'void', 'in progress'].includes(match.outcome)) {
            return res.status(400).json({ message: "outcome must be either: ['win', 'draw', 'void', 'in progress'] " });
        }

        if (!['playerA', 'playerB', 'none', null].includes(match.winner)) {
            return res.status(400).json({ message: "winner must be either: 'playerA', 'playerB', 'none' or null" })
        }


        const tournament = await Tournament.findById({ _id: match.tournamentId })
        const playerA = await Player.findById({ _id: match.playerA });
        const playerB = await Player.findById({ _id: match.playerB });

        if (!tournament) {
            return res.status(400).json({ message: `Unable to find a tournament matching the id (${match.tournamentId})` });
        }
        if (!playerA) {
            return res.status(400).json({ message: `Unable to find playerA in database (${match.playerA})` });
        }
        if (!playerB) {
            return res.status(400).json({ message: `Unable to find playerB in database (${match.playerB})` });
        }


        let gameWinner = null;

        // Should i be recording a game played if the outcome is void? 
        playerA.games.played = playerA.games.played + 1;
        playerB.games.played = playerB.games.played + 1;

        // the FieldToIncrement is the dynamic value i will pass to the update method later to increment the players games within the leaderboard
        let playerAFieldToIncrement = 'void';
        let playerBFieldToIncrement = 'void';

        if (match.outcome === 'win' && match.winner === 'playerA') {
            playerA.games.won = playerA.games.won + 1;
            playerAFieldToIncrement = 'won';
            playerBFieldToIncrement = 'lost';
            gameWinner = playerA;
        }
        if (match.outcome === 'win' && match.winner === 'playerB') {
            playerB.games.won = playerB.games.won + 1;
            playerAFieldToIncrement = 'lost';
            playerBFieldToIncrement = 'won';
            gameWinner = playerB;
        }
        if (match.outcome === 'draw') {
            playerA.games.drew = playerA.games.drew + 1;
            playerB.games.drew = playerB.games.drew + 1;
            playerAFieldToIncrement = 'drew'
            playerBFieldToIncrement = 'drew'
        }

        if (match.outcome === 'void') {
            playerA.games.void = playerA.games.void + 1;
            playerB.games.void = playerB.games.void + 1;
        }

        // we need to find the max gameId -> when adding a new game, we will increment this
        const gameIdList = tournament.games.map((game) => game.gameId)
        const maxGameId = Math.max(...gameIdList)
        // we will insert this into tournaments.games
        const newGameObj = {
            gameId: maxGameId + 1,
            playerAId: playerA._id,
            playerBId: playerB._id,
            playerAUsername: playerA.username,
            playerBUsername: playerB.username,
            playerAScore: match.playerAScore,
            playerBScore: match.playerBScore,
            outcome: match.outcome,
            winner: gameWinner
        }

        tournament.games.push(newGameObj);
        tournament.dateModified = date;
        playerA.dateModified = date;
        playerB.dateModified = date;
        await tournament.save();
        await playerA.save();
        await playerB.save();


        // update tournament leaderboard (slightly more tricky as we have to update an object array... 
        // perhaps I shouldve made an array key value pairs so i can index the player i want to update? would be 2 less api calls )

        //update playerA
        // [] is the syntax for dynamic field names 
        await Tournament.updateOne(
            { _id: tournament._id, 'leaderBoard.playerId': playerA._id },
            {
                $inc: {
                    'leaderBoard.$.played': 1,
                    [`leaderBoard.$.${playerAFieldToIncrement}`]: 1
                }
            }
        );

        //update playerB
        await Tournament.updateOne(
            { _id: tournament._id, 'leaderBoard.playerId': playerB._id },
            {
                $inc: {
                    'leaderBoard.$.played': 1,
                    [`leaderBoard.$.${playerBFieldToIncrement}`]: 1
                }
            }
        );

        return res.status(200).json({message: "successfully recorded match"})
    } catch (error: any) {
        console.log(`Unable to record match: ${error.toString()}`)
        return { http: 500, message: `Unable to record match: ${error.toString()}` }
    }


}

// tournament 6651c799abaa52775cef792f

// curl --header "Content-Type: application/json" \
//   --request POST \
//   --data '{"name":"james","username":"jamoowen", "email":"test@gmail.com", "tournamentId":"6651c80055f517ad10cb6f3a"}' \
//   http://localhost:8000/api/player/new


// curl "http://localhost:8000/api/players?id=6651c80055f517ad10cb6f3a"
// 6651c80055f517ad10cb6f3a