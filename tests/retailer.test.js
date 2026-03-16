import request from "supertest";
import app from "../src/app.js";

describe("Retailer API", () => {
    it("should fail CSV import without file", async () => {
        const res = await request(app)
            .post("/api/retailers/import");

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("CSV file is required");
    });
});