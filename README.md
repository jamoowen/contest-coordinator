# contest-coordinator

This is an Express backend designed to help Tournament organizers register players for a given tournament, keep track of the games played in a particular tournament, and determine the leaderboard of the tournament etc.

I have chosen to use Express and MongoDB to build out these API routes and used the mongoose library to interact with the db.

Preface:
    This is my first time using express, as well as my first time using MongoDB. 
    I have created the schemas for my Documents under /models
    I handle requests within functions defined in /controllers which receive input from /routes
    I have a few functions under /services which perform some logic
    I have not implemented delete functionality nor authentication 

Dependencies: Node 18+, MongoDB atlas account

Firstly, if you would like to run this code yourself, you will need to set up a MongoDB Atlas account and create an environmental variable 'CONNECTION_STRING' within a .env file within the root directory. this is the connection string MongoDB supplies you when you create a new Database and allows the code to read and write to it. 

To run: 
1. clone repo
2. run yarn install
3. add CONNECTION_STRING to a .env file in the root directory
4. run yarn dev/yarn start 

for testing, see bottom of this README

run server manually: node --loader ts-node/esm test/test.ts                                         

The initial requirements for this project are the following: 
    1. Register players for a tournament
    2. Record the outcomes of matchups between two players
        - Win
        - Lose
        - Draw
        - Void (Matchup was cancelled)
    3. Add a capability to rank who did the best out of those players (leaderboard).

    (1) to register a player for a given tournament, you can make a post request to either /api/player/new or /api/player/existing 
        This will either register an existing player (he has registered for a tournament before) or a new player, with the given tournament
    (2) To record the outcome of a matchup, you can make a post request to /api/match 
    (3) To view the leaderboard of a given tournament, you can make a get request to /api/tournaments/leaderboard?id=<tournamentId> where the tournamentId is the ID of the tournament you would like to check. This will return a sorted leaderboard of all players that enrolled in a given tournament you can also make the same request to /api/tournaments?id=<tournamentId> which will return all of the tournaments data (including name, date created, leaderboard, games played etc)

*Note - when recording a match, the results are added to the tournament's stats (leaderboard & games), as well as the player's lifetime stats (this will indicate total games played, total wins etc)
  

Questions & improvements: 
Im tempted to store foreign keys and references to other tables like you would do in a relational db?
eg: i wanted to store a reference to the Player within the Tournaments.leaderboard array. But this would just end up 
leading to an extra api call to the db? Tradeoff between size and query speed? also we would storing duplicate data if we store the username in both the Players document and within tournaments.leaderboards? what is best practice here? 

I think i have too much logic within the controllers. Perhaps I should slim these down?

I need to validate the objectId that is sent - if mongoose isnt able to cast the given input to objectId type it throws an error

Testing:

the integration tests run through all of the enpoints and test different scenarios but use the live db that you provision (I felt mocking would take me too long to try and set up).
For the tests to work, we need to run the below curl commands and add a few environmental variables to our .env file (to test getting an existing customer and registering existing customers for tournaments)
To do this: 
1. Start the server
2. Run the first curl command and add the tournament id that is provided in the response to your .env 
3. Add the tournamentID to the two player curl commands and run them, adding their username, email and id to the .env as well
4. Run yarn test

TEST_TOURNAMENT_ID=   
TEST_PLAYER_A_ID=  
TEST_PLAYER_A_USERNAME=  
TEST_PLAYER_A_EMAIL=  
TEST_PLAYER_B_ID=  
TEST_PLAYER_B_USERNAME=  
TEST_PLAYER_B_EMAIL=  

curl --header "Content-Type: application/json" \
--request POST \
--data '{"tournamentName":"Battle of the Deathstar","tournamentDescription":"A battlefront tournament", "tournamentFormat":"other", "gameName":"Battlefront 2", "platform":"PS", "prize": "$1000"}' \
http://localhost:8000/api/tournaments

curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"Luke Skywalker","username":"average_jedi", "email":"lukesky@gmail.com", "tournamentId":""}' \
  http://localhost:8000/api/player/new

curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"Anakin Skywalker","username":"Darth_Vader", "email":"vader@hotmail.com", "tournamentId":""}' \
  http://localhost:8000/api/player/new



Additional manual tests:

to check leaderboard (enter a tournament id):  
curl "http://localhost:8000/api/tournaments/leaderboard?id="


to record a match (enter a tournamentId, playerA, playerB) :  
playerA & playerB must be their ID's  
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"match": {"tournamentId": "","playerA":"","playerB":"", "playerAScore":"21", "playerBScore":"10", "outcome":"win", "winner": "playerA"}}' \
  http://localhost:8000/api/match  