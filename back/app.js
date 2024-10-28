import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import  express from 'express';
import {getProducts} from './prod.js';


import cors from 'cors';;

import {generateToken, checkToken} from './auth.js';

const { Sequelize, DataTypes } = require('sequelize');

const app = express();

const bodyParser = require('body-parser');

const sequelize = new Sequelize(
  {
    dialect: 'sqlite',
    storage: 'database.sqlite'
  }
);

const User = sequelize.define('User',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pass: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }
)

const Products = sequelize.define('Products',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }
)

sequelize.sync();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello World');
})


app.get('/register', async (req, res) => {
  console.log(req.query)
  const user = req.query.user
  const pass = req.query.pass
  const token = generateToken(user, pass)
  User.create({ name: user, pass: pass, token: token })
  return res.json({
    token: token
  })
})

app.get('/login', async (req, res) => {
  console.log(req.query)
  const user = req.query.user
  const pass = req.query.pass

  const allTokens = await User.findAll({ attributes: ['token'] }).then((tokens) => tokens.map((token) => token.token))
  console.log(allTokens)
  let result = {
    valid: checkToken(user, pass, allTokens),
  }
  if (result.valid) {
    result.token = generateToken(user, pass)
  }

  res.json(result)
})

app.get('/add-product', async (req, res) => {
  console.log(req.query)
  const user = req.query.user
  const pass = req.query.pass
  const prod_name = req.query.prod_name
  const prod_price = req.query.prod_price
  
  const allTokens = await User.findAll({ attributes: ['token'] }).then((tokens) => tokens.map((token) => token.token))
  if (checkToken(user, pass, allTokens)) {
    Products.create({ name: prod_name, price: prod_price })
    res.send("Added product")
  } else {
    res.send("Invalid credentials")
  }
}
);

app.get('/products', async (req, res) => {
  console.log("sending")
  const result = await Products.findAll({attributes: ['name', 'price']}).then((products) => products.map((prod) => prod.dataValues))
  console.log(result)

  // res.json(getProducts());
  res.json(result)
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
}
);