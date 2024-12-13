// tests/messages.test.js
const request = require("supertest");
const app = require("../app"); // Asegúrate de que tu app esté exportada
const server = require("../../index");
const { default: mongoose } = require("mongoose");

describe("GET /api/messages", () => {
  it("should return all messages", async () => {
    const res = await request(app).get("/api/messages");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

afterAll(async () => {
  await mongoose.connection.close(); // Ejemplo para MongoDB
  server.close(); // Cierra el servidor
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
