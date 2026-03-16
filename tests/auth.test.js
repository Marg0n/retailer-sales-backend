import request from "supertest";
import app from "../src/server.js";

describe("Auth API", () => {

    it("should login successfully", async () => {

        const res = await request(app)
            .post("/auth/login")
            .send({
                username: "sr1",
                password: "password123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();

    });

});