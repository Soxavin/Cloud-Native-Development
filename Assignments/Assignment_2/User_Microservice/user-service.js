const express = require('express');
const app = express();
app.use(express.json());

const dbconnect = require('./dbconnect.js');
const PersonModel = require('./person_schema.js');

/*
These routes are reached through the API Gateway on port 4000, e.g.:
GET localhost:4000/user/viewprofile
PUT localhost:4000/user/updateprofile   body: { "name": "New Name", "mobile": 87654321 }

Header: Authorization: Bearer <user token>

The x-user-email header is set by the API Gateway AFTER it verifies the JWT —
it is the trusted identity of whoever is calling, not something the client sets directly.
*/

// GET /user/viewprofile
app.get('/user/viewprofile', async (req, res) => {
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(400).send({ message: 'Missing identity — this route must be called through the API Gateway' });
  }

  try {
    const person = await PersonModel.findOne({ emailid: email }).select('-pass');
    if (!person) {
      return res.status(404).send({ message: 'Profile not found' });
    }
    res.status(200).send(person);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// PUT /user/updateprofile
app.put('/user/updateprofile', async (req, res) => {
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(400).send({ message: 'Missing identity — this route must be called through the API Gateway' });
  }

  const { name, mobile } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (mobile) updates.mobile = mobile;

  try {
    const updated = await PersonModel.findOneAndUpdate(
      { emailid: email },
      { $set: updates },
      { new: true }
    ).select('-pass');

    if (!updated) {
      return res.status(404).send({ message: 'Profile not found' });
    }
    res.status(200).send(updated);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.listen(5004, () => console.log('User Service Server is running on PORT NO: 5004'));
