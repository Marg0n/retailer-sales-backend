// admin.test.js
import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../src/app.js";

//* admin JWT for authorized requests
let adminToken;

//* SR JWT for forbidden access checks
let srToken;

beforeAll(async () => {
    //? login as admin
    const adminRes = await request(app)
        .post("/auth/login")
        .send({
            email: "admin@example.com",
            password: "admin123",
        });
    adminToken = adminRes.body.token;

    //? login as sales rep
    const srRes = await request(app)
        .post("/auth/login")
        .send({
            email: "sr1@example.com",
            password: "sr123",
        });
    srToken = srRes.body.token;
});

describe("Admin API", () => {

    describe("POST /admin/assignments/bulk", () => {
        it("should bulk assign retailers successfully", async () => {
            const res = await request(app)
                .post("/admin/assignments/bulk")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    salesRepId: 2, //? sr1@example.com
                    retailerUids: ["RTL-001"], //? assuming seeded retailer
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("message", "Retailers assigned successfully");
            expect(res.body.assigned).toBeGreaterThanOrEqual(0);
            expect(res.body.requested).toBe(1);
        });

        it("should fail without salesRepId", async () => {
            const res = await request(app)
                .post("/admin/assignments/bulk")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ retailerUids: ["RTL-001"] });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("salesRepId and retailerUids are required");
        });

        it("should return 403 for non-admin users", async () => {
            const res = await request(app)
                .post("/admin/assignments/bulk")
                .set("Authorization", `Bearer ${srToken}`)
                .send({
                    salesRepId: 2,
                    retailerUids: ["RTL-001"],
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/Forbidden access/);
        });
    });

    describe("POST /admin/retailers/import", () => {
        const csvFilePath = path.join(__dirname, "sample_retailers.csv");

        beforeAll(() => {
            //? create a small sample CSV
            const csvContent = `uid,name,phone,region,area,territory,distributor,points,routes,notes
RTL-TEST-1,Retailer Test,01711111111,Dhaka,Gulshan,Gulshan-1,ABC Distributor,100,Route A,Test note
RTL-TEST-2,Retailer Test 2,01722222222,Dhaka,Gulshan,Gulshan-1,ABC Distributor,150,Route B,Another note`;
            fs.writeFileSync(csvFilePath, csvContent);
        });

        afterAll(() => {
            //? cleanup sample CSV
            if (fs.existsSync(csvFilePath)) fs.unlinkSync(csvFilePath);
        });

        it("should import CSV retailers successfully", async () => {
            const res = await request(app)
                .post("/admin/retailers/import")
                .set("Authorization", `Bearer ${adminToken}`)
                .attach("file", csvFilePath);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("message", "Retailers imported successfully");
            expect(res.body.failed).toBe(0);
            expect(Array.isArray(res.body.errors)).toBe(true);
        });

        it("should fail when no file is uploaded", async () => {
            const res = await request(app)
                .post("/admin/retailers/import")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("CSV file is required");
        });

        it("should return 403 for non-admin users", async () => {
            const res = await request(app)
                .post("/admin/retailers/import")
                .set("Authorization", `Bearer ${srToken}`)
                .attach("file", csvFilePath);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/Forbidden access/);
        });
    });
});