import * as request from "supertest";
import { Connection } from "typeorm";
import { startServer } from "../../startServer";
import { createTestConn } from "../../testUtils/createTestConn";
import { User } from "../../entity/User";
import { Athlete } from "../../entity/Athlete";
import { Express } from "express";

let app: Express;
let conn: Connection;
let authCookie: string[];
let userId: string;

beforeAll(async () => {
  conn = await createTestConn();
  app = await startServer();

  // Create and login a test user
  const user = User.create({
    email: "athlete@example.com",
    password: "password123",
    confirmed: true,
    role: "athlete",
  });
  await user.save();
  userId = user.id;

  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: "athlete@example.com",
    password: "password123",
  });

  authCookie = loginResponse.headers["set-cookie"];
});

afterAll(async () => {
  await conn.close();
  const server = (app as any).server;
  if (server) {
    server.close();
  }
});

describe("Athletes API", () => {
  describe("POST /api/v1/athletes", () => {
    it("creates an athlete profile successfully", async () => {
      const response = await request(app)
        .post("/api/v1/athletes")
        .set("Cookie", authCookie)
        .send({
          firstName: "John",
          lastName: "Doe",
          primarySport: "Football",
          positions: ["Quarterback", "Safety"],
          heightFeet: "6'2\"",
          weight: 195,
          graduationYear: 2025,
          hometown: "Dallas, TX",
          performanceScore: 85,
          physicalScore: 80,
          academicScore: 75,
          socialScore: 70,
          evaluationScore: 80,
        });

      expect(response.status).toBe(201);
      expect(response.body.athlete).toHaveProperty("id");
      expect(response.body.athlete.firstName).toBe("John");
      expect(response.body.athlete.lastName).toBe("Doe");
      expect(response.body.athlete.primarySport).toBe("Football");
      expect(response.body.athlete.starRating).toBeGreaterThan(0);

      // Verify star rating calculation
      // Expected composite: (85*0.4) + (80*0.2) + (75*0.15) + (70*0.15) + (80*0.1)
      // = 34 + 16 + 11.25 + 10.5 + 8 = 79.75
      // Star rating should be 4.0 (70-79 range)
      expect(response.body.athlete.starRating).toBe(4.0);
    });

    it("returns 401 when not authenticated", async () => {
      const response = await request(app).post("/api/v1/athletes").send({
        firstName: "Test",
        lastName: "User",
        primarySport: "Basketball",
      });

      expect(response.status).toBe(401);
    });

    it("returns 400 when trying to create duplicate profile", async () => {
      // First creation already happened in previous test
      const response = await request(app)
        .post("/api/v1/athletes")
        .set("Cookie", authCookie)
        .send({
          firstName: "Jane",
          lastName: "Smith",
          primarySport: "Soccer",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("already has");
    });
  });

  describe("GET /api/v1/athletes", () => {
    beforeAll(async () => {
      // Create some public athlete profiles for testing
      const user2 = User.create({
        email: "athlete2@example.com",
        password: "password123",
        confirmed: true,
        role: "athlete",
      });
      await user2.save();

      const athlete2 = Athlete.create({
        userId: user2.id,
        firstName: "Jane",
        lastName: "Smith",
        primarySport: "Basketball",
        performanceScore: 90,
        physicalScore: 85,
        academicScore: 88,
        socialScore: 80,
        evaluationScore: 87,
        starRating: 4.5,
        isPublic: true,
      });
      await athlete2.save();
    });

    it("returns list of public athletes", async () => {
      const response = await request(app).get("/api/v1/athletes");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("athletes");
      expect(response.body).toHaveProperty("total");
      expect(Array.isArray(response.body.athletes)).toBe(true);
      expect(response.body.athletes.length).toBeGreaterThan(0);
    });

    it("filters by sport", async () => {
      const response = await request(app).get(
        "/api/v1/athletes?sport=Basketball"
      );

      expect(response.status).toBe(200);
      expect(response.body.athletes.length).toBeGreaterThan(0);
      response.body.athletes.forEach((athlete: any) => {
        expect(athlete.primarySport).toContain("Basketball");
      });
    });

    it("filters by star rating range", async () => {
      const response = await request(app).get(
        "/api/v1/athletes?minStars=4&maxStars=5"
      );

      expect(response.status).toBe(200);
      response.body.athletes.forEach((athlete: any) => {
        expect(athlete.starRating).toBeGreaterThanOrEqual(4);
        expect(athlete.starRating).toBeLessThanOrEqual(5);
      });
    });

    it("supports pagination", async () => {
      const response = await request(app).get(
        "/api/v1/athletes?limit=1&offset=0"
      );

      expect(response.status).toBe(200);
      expect(response.body.athletes.length).toBeLessThanOrEqual(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.offset).toBe(0);
    });
  });

  describe("GET /api/v1/athletes/:id", () => {
    let athleteId: string;

    beforeAll(async () => {
      const athlete = await Athlete.findOne({ where: { userId } });
      athleteId = athlete!.id;
    });

    it("returns athlete by ID", async () => {
      const response = await request(app).get(
        `/api/v1/athletes/${athleteId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.athlete).toHaveProperty("id");
      expect(response.body.athlete.id).toBe(athleteId);
    });

    it("returns 404 for non-existent athlete", async () => {
      const response = await request(app).get(
        "/api/v1/athletes/00000000-0000-0000-0000-000000000000"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("not found");
    });
  });

  describe("GET /api/v1/athletes/me/profile", () => {
    it("returns current user's athlete profile", async () => {
      const response = await request(app)
        .get("/api/v1/athletes/me/profile")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.athlete).toHaveProperty("id");
      expect(response.body.athlete.userId).toBe(userId);
    });

    it("returns 401 when not authenticated", async () => {
      const response = await request(app).get("/api/v1/athletes/me/profile");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/v1/athletes/:id", () => {
    let athleteId: string;

    beforeAll(async () => {
      const athlete = await Athlete.findOne({ where: { userId } });
      athleteId = athlete!.id;
    });

    it("updates athlete profile successfully", async () => {
      const response = await request(app)
        .put(`/api/v1/athletes/${athleteId}`)
        .set("Cookie", authCookie)
        .send({
          bio: "Updated bio for athlete profile",
          hometown: "Austin, TX",
          performanceScore: 90,
        });

      expect(response.status).toBe(200);
      expect(response.body.athlete.bio).toBe("Updated bio for athlete profile");
      expect(response.body.athlete.hometown).toBe("Austin, TX");
      expect(response.body.athlete.performanceScore).toBe(90);
      // Star rating should be recalculated
      expect(response.body.athlete.starRating).toBeGreaterThan(0);
    });

    it("returns 403 when trying to update another user's profile", async () => {
      // Create another user and athlete
      const user2 = User.create({
        email: "athlete3@example.com",
        password: "password123",
        confirmed: true,
        role: "athlete",
      });
      await user2.save();

      const athlete2 = Athlete.create({
        userId: user2.id,
        firstName: "Bob",
        lastName: "Johnson",
        primarySport: "Soccer",
        isPublic: true,
      });
      await athlete2.save();

      const response = await request(app)
        .put(`/api/v1/athletes/${athlete2.id}`)
        .set("Cookie", authCookie)
        .send({
          bio: "Trying to update someone else's profile",
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("permissions");
    });
  });

  describe("GET /api/v1/athletes/search", () => {
    it("searches athletes by name", async () => {
      const response = await request(app).get(
        "/api/v1/athletes/search?q=John"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("athletes");
      expect(response.body).toHaveProperty("total");
    });

    it("searches athletes by sport and star rating", async () => {
      const response = await request(app).get(
        "/api/v1/athletes/search?sport=Football&minStars=3&maxStars=5"
      );

      expect(response.status).toBe(200);
      expect(response.body.athletes).toBeDefined();
    });
  });
});
