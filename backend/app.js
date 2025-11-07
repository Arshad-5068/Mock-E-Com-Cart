const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: 'Headphones', price: 59.99 },
  { id: 2, name: 'Keyboard', price: 39.99 },
  { id: 3, name: 'Smartwatch', price: 79.99 },
  { id: 4, name: 'Shoes', price: 99.99 },
  { id: 5, name: 'Book', price: 19.99 }
];

let cart = [];

// Get all products
app.get('/api/products', (req, res) => res.json(products));

// Get cart with total
app.get('/api/cart', (req, res) => {
  const items = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, name: product?.name ?? 'N/A', price: product?.price ?? 0 };
  });
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  res.json({ items, total });
});

// Add to cart
app.post('/api/cart', (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || qty < 1) return res.status(400).json({ error: 'Invalid input' });
  const item = cart.find(i => i.productId === productId);
  if (item) item.qty += qty;
  else cart.push({ id: Date.now(), productId, qty });
  res.json({ success: true });
});

// Remove from cart
app.delete('/api/cart/:id', (req, res) => {
  cart = cart.filter(item => item.id != req.params.id);
  res.json({ success: true });
});

// Checkout (mock receipt)
app.post('/api/checkout', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name/email required' });
  const items = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, name: product?.name ?? '', price: product?.price ?? 0 };
  });
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const receipt = { name, email, items, total, timestamp: new Date().toISOString() };
  cart = [];
  res.json(receipt);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
