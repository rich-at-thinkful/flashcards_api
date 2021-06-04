require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const winston = require("winston");
const cuid = require("cuid");

const { NODE_ENV } = require("./config");

const app = express();

const morganOption = (NODE_ENV === "production")
  ? "tiny"
  : "common";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "info.log" })
  ]
});

if (NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
  
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(express.json());

function deleteItem(collection, id) {
  const itemIndex = collection.findIndex(i => i.id === id);
  if (itemIndex) {
    collection.splice(itemIndex, 1);
  }
}

const decks = [
  {
    "id": "cko50i9vh00007zmnh6b01hsl",
    "name": "Rendering in React",
    "description": "React's component structure allows for quickly building a complex web application that relies on DOM manipulation. "
  },
  {
    "name": "React Router",
    "description": "React Router is a collection of navigational components that compose declaratively with your application.",
    "id": "cko50ifsx00017zmnhbcx2lk7"
  }
];

const cards = [
  {
    "id": "cko50ir4300027zmnaopmd0fu",
    "front": "Differentiate between Real DOM and Virtual DOM.",
    "back": "Virtual DOM updates are faster but do not directly update the HTML",
    "deckId": "cko50i9vh00007zmnh6b01hsl"
  },
  {
    "id": "cko50ix2s00037zmnfomv4e76",
    "front": "How do you modify the state of a different React component?",
    "back": "Not at all! State is visible to the component only.",
    "deckId": "cko50i9vh00007zmnh6b01hsl"
  },
  {
    "id": "cko50j6ir00047zmn7u1c9w33",
    "front": "How do you pass data 'down' to a React child component?",
    "back": "As properties or props",
    "deckId": "cko50i9vh00007zmnh6b01hsl"
  },
  {
    "front": "What path will match the follow Route?\n<Route>\n  <NotFound />\n</Route>",
    "back": "All paths. A route with no path matches all URL's",
    "deckId": "cko50ifsx00017zmnhbcx2lk7",
    "id": "cko50jc9y00057zmn1235bk74"
  },
  {
    "front": "What does <Switch> do?",
    "back": "Renders the first matching child <Route> ",
    "deckId": "cko50ifsx00017zmnhbcx2lk7",
    "id": "cko50jhwh00067zmnb7x60n4y"
  }
];

app.get("/cards", (req, res) => {
  res
    .json({ data: cards });
});

app.post("/cards", (req, res) => {
  const { data } = req.body;
  if (!data) {
    const message = `Body must have 'data' key`;
    logger.error(message);
    return res
      .status(400)
      .json({ error: message });
  }

  const { front, back, deckId } = data;

  // Validate required fields are present
  const requiredFields = ["front","back","deckId"];
  for (const field of requiredFields) {
    if (!data[field]) {
      const message = `'${field}' is required`;
      logger.error(message);
      return res
        .status(400)
        .json({ error: message });
    }
  }

  // Validate deck exists
  const deck = decks.find(d => d.id === deckId);
  if (!deck) {
    const message = `Deck id ${deckId} does not exist.`;
    logger.error(message);
    return res
      .status(400)
      .json({ error: message });
  } 

  // Create an ID
  const id = cuid();

  const card = {
    id,
    front,
    back,
    deckId,
  };

  cards.push(card);
  logger.info(`Card with id ${id} created`);

  res
    .status(201)
    .json({ data: card });
});

app.get("/cards/:cardId", (req, res) => {
  const { cardId } = req.params;
  const card = cards.find(c => c.id === cardId);

  // make sure we found a card
  if (!card) {
    const message = `Card with id ${cardId} not found.`;
    logger.error(message);
    return res
      .status(404)
      .json({ error: message });
  }

  res.json({ data: card });
});

app.delete("/cards/:cardId", (req, res) => {
  const { cardId } = req.params;
  const cardIndex = cards.findIndex(c => c.id === cardId);

  if(cardIndex === -1) {
    const message = `Card id ${cardId} does not exist`;
    return res
      .status(404)
      .json({ message });
  }

  cards.splice(cardIndex, 1);
  res
    .status(204)
    .send();
});

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
    .forEach(cardId => deleteItem(cards, cardId));

  logger.info(`Deck with id ${deckId} deleted.`);
  res
    .status(204)
    .end();
});


app.use(function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message });
});

module.exports = app;