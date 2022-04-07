const router = require("express").Router();
const { list, create, read, destroy } = require("./decks-controller");

router
  .route("/")
  .get(list)
  .post(create);

router
  .route("/:deckId")
  .get(read)
  .delete(destroy);

module.exports = router;
