import * as request from "supertest";
import { Connection } from "typeorm";
import { startServer } from "../../startServer";
import { createTestConn } from "../../testUtils/createTestConn";
import { User } from "../../entity/User";
import { Express } from "express";

let app: Express;
let conn: Connection;

beforeAll(async () => {
  conn = await createTestConn();
  app = await startServer();
});

afterAll(async () => {
  await conn.close();
  const server = (app as any).server;
  if (server) {
    server.close();
  }
});

describe("Auth API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("registers a new user successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          role: "athlete",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("userId");

      // Verify user was created in database
      const user = await User.findOne({
        where: { email: "test@example.com" },
      });
      expect(user).toBeTruthy();
      expect(user!.email).toBe("test@example.com");
      expect(user!.role).toBe("athlete");
    });

    it("returns error for duplicate email", async () => {
      // First registration
      await request(app).post("/api/v1/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
      });

      // Second registration with same email
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "password456",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain("already taken");
    });

    it("validates email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("validates password length", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test2@example.com",
          password: "12",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Create a confirmed user for login tests
      const user = User.create({
        email: "logintest@example.com",
        password: "password123",
        confirmed: true,
        role: "athlete",
      });
      await user.save();
    });

    it("logs in successfully with valid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "logintest@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("email");
      expect(response.body.user).toHaveProperty("role");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("returns error for invalid email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain("Invalid");
    });

    it("returns error for invalid password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "logintest@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain("Invalid");
    });

    it("returns error for unconfirmed email", async () => {
      // Create unconfirmed user
      const user = User.create({
        email: "unconfirmed@example.com",
        password: "password123",
        confirmed: false,
      });
      await user.save();

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "unconfirmed@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain("confirm");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns current user when authenticated", async () => {
      // Create and login user
      const user = User.create({
        email: "metest@example.com",
        password: "password123",
        confirmed: true,
        role: "coach",
      });
      await user.save();

      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "metest@example.com",
          password: "password123",
        });

      const cookie = loginResponse.headers["set-cookie"];

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.email).toBe("metest@example.com");
      expect(response.body.user.role).toBe("coach");
    });

    it("returns 401 when not authenticated", async () => {
      const response = await request(app).get("/api/v1/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("authenticated");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("logs out successfully", async () => {
      // Create and login user
      const user = User.create({
        email: "logouttest@example.com",
        password: "password123",
        confirmed: true,
      });
      await user.save();

      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "logouttest@example.com",
          password: "password123",
        });

      const cookie = loginResponse.headers["set-cookie"];

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Logout successful");
    });
  });
});
