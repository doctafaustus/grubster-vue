// Core Modules
const express = require('express');
const bodyParser = require('body-parser');


// Express
const app = express();


// Database
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const dbOptions = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };
mongoose.Promise = global.Promise; // Removes deprecation warning
mongoose.connect('mongodb://localhost/grubster');
const Recipe = mongoose.model('Recipe', new Schema({
  id: ObjectId,
  title: String,
  image: String,
  url: String,
  mealType: String,
  foodType: String,
  diet: String,
  creationDate: {type: Date, default: Date.now},
}));



// Middleware
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));


// Listen
app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port 3000');
});


// All Recipes
app.get('/api/recipes', (req, res) => {
  Recipe.find({}, (err, recipes) => {
    res.json(recipes);
  });
});

// Searched Recipes
app.get('/api/recipes/search', (req, res) => {
  const { term } = req.query;

  Recipe.find({ title: { $regex: term, $options: 'i' } }, (err, recipes) => {
    res.json(recipes);
  });
});

// Recent Recipes
app.get('/api/recipes/recent', (req, res) => {
  Recipe.find({}).sort({ creationDate: -1 }).exec((err, recipes) => {
    res.json(recipes);
  });
});

// Most Popular Recipes
app.get('/api/recipes/most-popular', (req, res) => {
  Recipe.find({}).sort({ favorites: -1 }).exec((err, recipes) => {
    res.json(recipes);
  });
});

// Recipe Categories
app.get('/api/recipes/category', (req, res) => {
  const { category } = req.query;

  Recipe.find({ mealType: category }).exec((err, recipes) => {
    res.json(recipes);
  });
});