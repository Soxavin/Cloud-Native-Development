const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3004;

app.post('/sendnotification', (req, res) => {
  const { status, orderId } = req.body;
  console.log(`Notification: Order ${orderId} - Payment ${status}`);
  res.json({ message: `Notification sent for order ${orderId}: ${status}` });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on http://localhost:${PORT}`);
});
