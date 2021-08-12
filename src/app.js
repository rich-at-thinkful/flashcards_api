const express = require("express");
const morgan = require("morgan");
const cuid = require("cuid");

const app = express();

const notFound = require("./errors/notFound");
const errorHandler = require("./errors/errorHandler");
const cardsRouter = require("./cards/cards.router");

// Import data store
const { cards, decks } = require("./dataStore");

// Utility function to delete items from any provided collection by id
function deleteItem(collection, id) {
  const itemIndex = collection.findIndex(i => i.id === id);
  if (itemIndex > -1) {
    collection.splice(itemIndex, 1);
  }
}

// -- PIPELINE STARTS HERE ---

// Middleware
app.use(morgan("common"));
app.use(express.json());

// Routes
app.use("/cards", cardsRouter);
app.use("/study-cards", cardsRouter);

app.get("/decks", (req, res) => {
  res
    .json({ data: decks });
});

app.post("/decks", (req, res) => {
  const { data } = req.body;
  if (!data) {
    const message = `Body must have 'data' key`;
    logger.error(message);
    return res
      .status(400)
      .json({ error: message });
  }

  const { name, description } = data;

  const requiredFields = ["name", "description"];
  for (const field of requiredFields) {
    if (!data[field]) {
      const message = `'${field}' is required`;
      logger.error(message);
      return res
        .status(400)
        .json({ error: message });
    }
  }

  // get an id
  const id = cuid();

  const deck = {
    id,
    name,
    description,
  };

  decks.push(deck);

  logger.info(`Deck with id ${id} created`);

  res
    .status(201)
    .json({ data: deck });
});

app.get("/decks/:deckId", (req, res) => {
  const { deckId } = req.params;
  const deck = decks.find(d => d.id === deckId);

  // make sure we found a list
  if (!deck) {
    const message = `Deck with id ${deckId} not found.`;
    logger.error(message);
    return res
      .status(404)
      .json({ error: message });
  }

  res.json({ data: deck });
});

app.delete("/decks/:deckId", (req, res) => {
  const { deckId } = req.params;

  const deckIndex = decks.findIndex(d => d.id === deckId);

  if (deckIndex === -1) {
    const message = `Deck with id ${deckId} not found.`; 
    logger.error(message);
    return res
      .status(404)
      .json(message);
  }

  // Delete deck
  deleteItem(decks, deckId);
  // Delete all cards in deck
  cards
    .filter(c => c.deckId === deckId)
    .forEach(c => deleteItem(cards, c.id));

  logger.info(`Deck with id ${deckId} deleted.`);
  res
    .status(204)
    .end();
});

// Not Found Handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

module.exports = app;