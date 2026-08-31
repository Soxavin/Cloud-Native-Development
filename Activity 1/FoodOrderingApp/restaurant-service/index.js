const express = require('express');
const app = express();
const PORT = 3001;

app.get('/viewallrestaurant', (req, res) => {
  res.json({ message: 'Viewing all restaurants' });
});

app.get('/searchrestaurant', (req, res) => {
  res.json({ message: 'Searching for a restaurant' });
});

app.listen(PORT, () => {
  console.log(`Restaurant Service running on http://localhost:${PORT}`);
});
