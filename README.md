# contest-coordinator

This is a backend designed to help Tournament organizers register players for a given tournament, keep track of the games played in a particular tournament, and determine the leaderboard of the tournament etc.

I have chosen to use Express and MongoDB to build out these API routes and used the mongoose library to interact with the db.

Preface:
    This is my first time using express, as well as my first time using MongoDB. 
    I have created the schemas for my Documents under /models
    I implement route logic under /controllers which receive input from routes
    I declare routes under /routes
    I have not implemented delete functionality not authentication 


Dependencies: Node 18+, MongoDB atlas account

Firstly, if you would like to run this code yourself, you will need to set up a MongoDB Atlas account and create an environmental variable CONNECTION_STRING => this is the connection string MongoDB supplies you when you create a new Database and allows the code to read and write to it. 

To run: 
1. clone repo
2. run yarn install

5. 



run server: node --loader ts-node/esm test/test.ts                                         

The initial requirements for this project are the following: 
    - Register players for a tournament
    - Record the outcomes of matchups between two players
        - Win
        - Lose
        - Draw
        - Void (Matchup was cancelled)
    - Add a capability to rank who did the best out of those players.
    + Add a capability for generating matchups.
    + Indicate schedule with time intervals between matches.

*Need to document how to run the project (In this readme ideally)
*Must implement testing (ideally jest, else vitest)

Endpoints:
    create tournament -> creates a new tournament entry (every player registered must correspond to a tournament ID)

    register player -> registers a player in database with a given tournament ID (shouldnt be possible to enter a tournament ID that does not exist or has past)

    begin tournament -> randomly generate matchups based off the players entered capped at 6 rounds 2^6 (64 players) + create documents for each subsequent round

    record matchup -> record a given matchup, updating the player schema with the result and the matchup schema with the result if the round ==1

    show scores -> show a tally of the leaderboards?

    end tournament -> end the tournament at whatever stage it is at


Questions: 
    Im tempted to store foreign keys and references to other tables like you would do in a relational db?
    eg: i wanted to store a reference to the Player within the Tournaments.leaderboard array. But this would just end up 
    leading to an extra api call to the db? Tradeoff between size and query speed? also we would storing duplicate data if we store the username in both the Players document and within tournaments.leaderboards? what is best practice here? 

    I think i have too much logic within the controllers. Perhaps I should slim these down? 