const express = require('express');
const app = express();

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
require('dotenv').config();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

const PersonModel = require('./person_schema.js');
const dbconnect = require('./dbconnect.js');

/*
In the postman use the following URL
localhost:5002/auth/login

{
  "email":"a@gmail.com",
  "password":"abc",
  "role":"student"
}

*/

// LOGIN API
app.post("/auth/login", async (req, res) => {
  const { email, password, role } = req.body;
  console.log(email, role)

  try {
    // Find by email + role first — password can't be matched directly since it's hashed
    const person = await PersonModel.findOne({ emailid: email, role: role });

    if (!person) {
      return res.status(400).send("Invalid email or role");
    }

    const passwordMatches = await bcrypt.compare(password, person.pass);
    if (!passwordMatches) {
      return res.status(400).send("Invalid email or password");
    }

    const token = jwt.sign({ email: email, role: role }, JWT_SECRET, { expiresIn: '24h' })
    return res.json({ token })
  } catch (err) {
    res.status(500).send({ message: err.message || 'Error during login' });
  }
});//CLOSE Post METHOD

app.listen(5002, () => {
    console.log('Authentication Service Server is running on PORT NO: 5002')
})