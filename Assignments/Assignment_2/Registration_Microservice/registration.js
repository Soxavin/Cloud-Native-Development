const express = require('express');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());

const bcrypt = require('bcryptjs');

const dbconnect = require('./dbconnect.js');
const PersonModel = require('./person_schema.js');

/*
In the postman use the following URL
localhost:5001/register/userregister

{
  "firstname":"Joe",
  "email":"a@gmail.com",
  "password":"abc",
  "mobile": 12345678,
  "role": "student"
}

*/

function uniqueid(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

const SALT_ROUNDS = 10;

//REG API
app.post('/register/userregister', async (req, res) => {
  console.log("REGISTER API EXECUTED")

  // 1. VALIDATE INPUT
  const { firstname, email, password, mobile, role } = req.body;
  if (!firstname || !email || !password || !role) {
    return res.status(400).send({ message: 'firstname, email, password, and role are required' });
  }

  try {
    // 2. CHECK EMAIL (reject duplicates)
    const existing = await PersonModel.findOne({ emailid: email });
    if (existing) {
      return res.status(409).send({ message: 'Email already registered' });
    }

    // 3. HASH PASSWORD (never store plain text)
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. STORE IN MONGODB
    const pobj = new PersonModel({
      id: uniqueid(1000, 9999),
      name: firstname,
      emailid: email,
      pass: hashedPassword,
      mobile: mobile,
      role: role
    });

    await pobj.save();
    // 5. RETURN SUCCESS
    res.status(200).send('DOCUMENT INSERED IN MONGODB DATABASE');
  } catch (err) {
    res.status(500).send({ message: err.message || 'Error in Employee Save ' });
  }
});//CLOSE POST METHOD

// START THE EXPRESS SERVER. 5000 is the PORT NUMBER
app.listen(5001, () => console.log('EXPRESS Server Started at Port No: 5001'));