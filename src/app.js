const express = require("express");
const morgan = require("morgan");

const app = express();
const cardsRouter = require("./cards/cards-router");
const decksRouter = require("./decks/decks-router");
const errorHandler = require("./errors/errorHandler");

// -- PIPELINE STARTS HERE ---

// Middleware
app.use(morgan("common"));
app.use(express.json());

// Routes
app.use("/cards", cardsRouter);
app.use("/decks", decksRouter);

// Error Handler
app.use(errorHandler);

module.exports = app;