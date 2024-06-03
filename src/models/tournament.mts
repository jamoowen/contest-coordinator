import mongoose, { mongo } from "mongoose";

const { Schema, SchemaTypes, model } = mongoose;

// tournament schema will be initialized with empty leaderboard & games
// leaderBoard will be populated when players register for the tournament
// games will be populated when matches are recorded
const platformEnum = ['PC', 'PS', 'Xbox', 'Console', 'Crossplay', 'Mobile', 'Nintendo', 'Other']

const tournamentSchema = new Schema({
    tournamentName: {
        type: String,
        required: true
    },
    tournamentDescription: {
        type: String,
        required: true
    },
    tournamentFormat: {
        type: String,
        required: true
    },
    gameName: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: platformEnum,
        required: true
    },
    prize: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true
    },
    dateModified: {
        type: Date,
        required: true
    },
    tournamentWinner: {
        type: SchemaTypes.ObjectId,
        default: null
    },
    leaderBoard: [
        {
            playerId: {
                type: SchemaTypes.ObjectId,
                required: true
            },
            playerUsername: {
                type: String,
                required: true
            },
            played: {
                type: Number,
                default: 0
            },
            won: {
                type: Number,
                default: 0
            },
            lost: {
                type: Number,
                default: 0
            },
            drew: {
                type: Number,
                default: 0
            },
            void: {
                type: Number,
                default: 0
            }
        }
    ],
    games: [
        {
            gameId: {
                type: Number,
                required: true
            },
            playerAId: {
                type: SchemaTypes.ObjectId,
                required: true
            },
            playerBId: {
                type: SchemaTypes.ObjectId,
                required: true
            },
            playerAUsername: {
                type: String,
                required: true
            },
            playerBUsername: {
                type: String,
                required: true
            },
            playerAScore: {
                type: Number,
                default: 0
            },
            playerBScore: {
                type: Number,
                default: 0
            },
            outcome: {
                type: String,
                enum: ['win', 'draw', 'void', 'in progress']
            },
            winner: SchemaTypes.ObjectId
        }
    ]
})

// index?
// tournamentSchema.index({dateCreated:1})

const Tournament = model("Tournament", tournamentSchema);

export { Tournament, platformEnum };