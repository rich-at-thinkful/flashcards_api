const { decks, cards } = require("../dataStore");
const cuid = require("cuid");
const logger = require("../logger");
const { deleteItem } = require("../utils");

const list = (req, res) => {
  res
    .json({ data: decks });
};

const create = (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    const message = `Body must have 'data' key`;
    return next({
      status:400,
      message,
    }); 
  }

  const { name, description } = data;

  const requiredFields = ["name", "description"];
  for (const field of requiredFields) {
    if (!data[field]) {
      const message = `'${field}' is required`;
      return next({
        status: 400,
        message,
      });
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
};

const read = (req, res, next) => {
  const { deckId } = req.params;
  const deck = decks.find(d => d.id === deckId);

  // make sure we found a list
  if (!deck) {
    const message = `Deck with id ${deckId} not found.`;
    return next({
      status: 404,
      message,
    });
  }

  res.json({ data: deck });
};

const destroy = (req, res, next) => {
  const { deckId } = req.params;

  const deckIndex = decks.findIndex(d => d.id === deckId);

  if (deckIndex === -1) {
    const message = `Deck with id ${deckId} not found.`; 
    return next({
      status: 404,
      message,
    });
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
};

module.exports = {
  list,
  create,
  read,
  destroy,
};

