import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../dist/index.mjs'; // Change require to import



import dotenv from "dotenv";
dotenv.config();


beforeEach(async () => {
    await mongoose.connect(process.env.CONNECTION_STRING);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});




describe("GET /api/player", () => {



    // it("Should register a new player for a given tournament", async () => {
    //   const res = await request(app).get("/api/player");
    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.length).toBeGreaterThan(0);
    // });
    // it("should return all products", async () => {
    //   const res = await request(app).get("/api/player");
    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.length).toBeGreaterThan(0);
    // });

    it("should return all products", async () => {
        const res = await request(app).get("/api/tournaments");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      });


  });
