require("dotenv").config();

const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./app/config/swagger_output.json";
const endpointsFiles = [
  "./app/routes/api.routes.js",
  "./app/routes/event.routes.js",
  "./app/routes/eventType.routes.js",
  "./app/routes/password.routes.js",
  "./app/routes/user.routes.js",
  "./app/routes/computer.routes.js",
  "./app/routes/session.routes.js",
];

const doc = {
  info: {
    version: "1.0.0",
    title: "OSTestBed API",
    description: "OSTestBed API",
  },
  host: `${process.env.IP}:8080`,
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "api",
      description: "general endpoints not associated with an entity (endpoints you care about).",
    },
    {
      name: "user",
      description: "endpoints related to users.",
    },
    {
      name: "event",
      description: "endpoints related to events.",
    },
    {
      name: "eventType",
      description: "endpoints related to event types.",
    },
    {
      name: "password",
      description: "endpoints related to passwords.",
    },
    {
      name: "computer",
      description: "endpoints related to computers.",
    },
    {
      name: "session",
      description: "endpoints related to sessions.",
    },
  ],
  definitions: {
    User: {
      userId: 1,
      email: "email@email.com",
      isAdmin: false,
      updatedAt: "2022-02-24T02:26:42.581Z",
      createdAt: "2022-02-24T02:26:42.581Z",
    },
    Password: {
      passwordId: 1,
      password: "<hashed>",
      isAdminPassword: false,
    },
    Event: {
      eventId: 1,
      eventTypeId: 2,
      userId: 1,
    },
    EventType: {
      eventTypeId: 1,
      eventType: "some event",
    },
    Computer: {
      computerId: 1,
      portId: 2,
      serialNumber: "some serial number",
      model: "3B+",
      inUse: true,
    },
    Session: {
      sessionId: 12,
      userId: 1,
      computerId: 1,
      startTime: "the time the session started",
      endTime: "the time the session ended",
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
