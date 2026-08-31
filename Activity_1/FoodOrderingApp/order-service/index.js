const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());
const PORT = 3002;

const PAYMENT_SERVICE_URL = 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = 'http://localhost:3004';

app.post('/addorder', async (req, res) => {
  const orderId = Date.now(); // simple unique id for demo purposes
  console.log(`New order received: ${orderId}`, req.body);

  try {
    // Step 1: Order API calls Payment API
    const paymentResponse = await axios.post(`${PAYMENT_SERVICE_URL}/paymentprocess`, {
      orderId,
      ...req.body
    });

    const paymentStatus = paymentResponse.data.status; // "Success" or "Failure"

    // Step 2: Order API calls Notification API with the payment result
    const notificationResponse = await axios.post(`${NOTIFICATION_SERVICE_URL}/sendnotification`, {
      orderId,
      status: paymentStatus
    });

    // Step 3: Order API responds to the User
    res.json({
      orderId,
      paymentStatus,
      notification: notificationResponse.data.message
    });

  } catch (error) {
    console.error('Error in order flow:', error.message);
    res.status(500).json({ message: 'Order processing failed', error: error.message });
  }
});

app.get('/vieworder', (req, res) => {
  res.json({ message: 'Viewing order details' });
});

app.delete('/cancelorder', (req, res) => {
  res.json({ message: 'Order cancelled' });
});

app.listen(PORT, () => {
  console.log(`Order Service running on http://localhost:${PORT}`);
});
