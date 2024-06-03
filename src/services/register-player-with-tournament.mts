import express, { Request, Response } from 'express';
import { Player } from '../models/player.mjs';
import mongoose from "mongoose";
import { Tournament } from '../models/tournament.mjs'

// REGISTERS PLAYER FOR A SPECIFIC TOURNAMENT (internal function)
// this function will register a playerId with a given tournament
// Should this be stuck under /services?  
export async function registerPlayerWithTournament(playerId: string, tournamentId: string) {
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
        return { http: 200, message: "Player successfully registered!", playerId: player._id }

    } catch (error: any) {
        console.log("Error registering player")
        return { http: 500, message: `Unable to register player for a given tournament: ${error.toString()}` }
    }
}