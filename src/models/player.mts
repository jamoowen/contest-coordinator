import mongoose from 'mongoose';

const { Schema, SchemaTypes, model } = mongoose;

// Players are all of the players ever registered in our DB
// Each time a match is recorded or Tournament entered or Tournament won, the Player document should be updated
// This gives us a lifetime view of the Player and their history of competitions, allowing inference of analysis
// perhaps good idea to add additional validation/constraints to name and username
const playerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    contactDetails: {
        number: String, // Changed from Number to String
        twitter: String,
        discord: String,
    },
    dateCreated: {
        type: Date,
        default: Date.now, // Added default value
        required: true
    },
    dateModified: {
        type: Date,
        default: Date.now, // Added default value
        required: true
    },
    tournamentsEntered: {
        type: [SchemaTypes.ObjectId],
        ref: 'Tournament', // Added ref for ObjectId array
        default: []
    },
    tournamentsWon: {
        type: [SchemaTypes.ObjectId],
        ref: 'Tournament', // Added ref for ObjectId array
        default: []
    },
    games: {
        type: new Schema({
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
        }),
        required: true // Make the games object required
    }
});

const Player = model('Player', playerSchema);

export { Player };