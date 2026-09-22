const express = require('express');
const app = express();
app.use(express.json());

const dbconnect = require('./dbconnect.js');
const PersonModel = require('./person_schema.js');

/*
These routes are reached through the API Gateway on port 4000, e.g.:
GET    localhost:4000/admin/searchuser?query=joe
GET    localhost:4000/admin/viewalluser
DELETE localhost:4000/admin/deluser?email=a@gmail.com

Header: Authorization: Bearer <admin token>
*/

// GET /admin/searchuser — search by name or email
app.get('/admin/searchuser', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).send({ message: 'Provide a query parameter, e.g. ?query=joe' });
  }

  try {
    const results = await PersonModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { emailid: { $regex: query, $options: 'i' } }
      ]
    }).select('-pass'); // never send password hashes back, even to admins

    if (results.length === 0) {
      return res.status(404).send({ message: 'No user found' });
    }
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// GET /admin/viewalluser — list every user
app.get('/admin/viewalluser', async (req, res) => {
  try {
    const allUsers = await PersonModel.find({}).select('-pass');
    res.status(200).send(allUsers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// DELETE /admin/deluser — delete by email
app.delete('/admin/deluser', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send({ message: 'Provide an email query parameter, e.g. ?email=a@gmail.com' });
  }

  try {
    const deleted = await PersonModel.findOneAndDelete({ emailid: email });
    if (!deleted) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted', deletedEmail: deleted.emailid });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.listen(5003, () => console.log('Admin Service Server is running on PORT NO: 5003'));
