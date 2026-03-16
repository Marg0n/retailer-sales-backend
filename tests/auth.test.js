import request from "supertest";
import app from "../src/app.js";

describe("Auth API", () => {
    it("should login successfully", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "sr1@example.com",
                password: "sr123",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});

describe("Unknown Auth API", () => {
    it("should return 404 for unknown route", async () => {
        const res = await request(app).get("/unknown");
        expect(res.statusCode).toBe(404);
    });
});