const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

async function createTables() {
  await client.query(`
    DROP TABLE IF EXISTS favorites CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS products CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL NOT NULL
    );

    CREATE TABLE favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      product_id INTEGER REFERENCES products(id)
    );
  `);
}

async function createProduct({ name, description, price }) {
  const { rows } = await client.query(
    "INSERT INTO products(name, description, price) VALUES($1, $2, $3) RETURNING *",
    [name, description, price]
  );
  return rows[0];
}

async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await client.query(
    "INSERT INTO users(username, password) VALUES($1, $2) RETURNING *",
    [username, hashedPassword]
  );
  return rows[0];
}

async function fetchUsers() {
  const { rows } = await client.query("SELECT * FROM users");
  return rows;
}

async function fetchProducts() {
  const { rows } = await client.query("SELECT * FROM products");
  return rows;
}

async function createFavorite({ userId, productId }) {
  const { rows } = await client.query(
    "INSERT INTO favorites(user_id, product_id) VALUES($1, $2) RETURNING *",
    [userId, productId]
  );
  return rows[0];
}

async function fetchFavorites(userId) {
  const { rows } = await client.query(
    "SELECT * FROM favorites WHERE user_id = $1",
    [userId]
  );
  return rows;
}

async function destroyFavorite({ userId, favoriteId }) {
  await client.query("DELETE FROM favorites WHERE user_id = $1 AND id = $2", [
    userId,
    favoriteId,
  ]);
}

module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
