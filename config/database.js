require('dotenv').config();

module.exports = {
  'url': process.env.MONGO_URL,
  'dbName': 'todo-crud'
};