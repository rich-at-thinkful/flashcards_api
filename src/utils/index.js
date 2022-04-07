// Utility function to delete items from any provided collection by id
function deleteItem(collection, id) {
  const itemIndex = collection.findIndex(i => i.id === id);
  if (itemIndex > -1) {
    collection.splice(itemIndex, 1);
  }
}

module.exports = {
  deleteItem,
};
