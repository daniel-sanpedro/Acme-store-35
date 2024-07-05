const express = require("express");
const {
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/users", async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await createUser({ username, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:id/favorites", async (req, res) => {
  try {
    const favorites = await fetchFavorites(req.params.id);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users/:id/favorites", async (req, res) => {
  try {
    const favorite = await createFavorite({
      userId: req.params.id,
      productId: req.body.product_id,
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res) => {
  try {
    await destroyFavorite({
      userId: req.params.userId,
      favoriteId: req.params.id,
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to insert random users and products
async function insertRandomData() {
  const users = [
    { username: "user1", password: "password1" },
    { username: "user2", password: "password2" },
    { username: "user3", password: "password3" },
  ];

  const products = [
    { name: "Product 1", description: "Description 1", price: 10.0 },
    { name: "Product 2", description: "Description 2", price: 20.0 },
    { name: "Product 3", description: "Description 3", price: 30.0 },
  ];

  for (const user of users) {
    await createUser(user);
  }

  for (const product of products) {
    await createProduct(product);
  }
}

async function init() {
  await createTables();
  await insertRandomData();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

init();
