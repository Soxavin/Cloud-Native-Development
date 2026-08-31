const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3003;

app.post('/paymentprocess', (req, res) => {
  console.log('Processing payment for order:', req.body);

  // Simulate a payment outcome. Swap this for real logic later.
  const isSuccess = Math.random() > 0.3; // ~70% success rate

  if (isSuccess) {
    res.json({ status: 'Success', message: 'Payment processed successfully' });
  } else {
    res.json({ status: 'Failure', message: 'Payment processing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Payment Service running on http://localhost:${PORT}`);
});
