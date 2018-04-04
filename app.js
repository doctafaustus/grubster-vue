// Core Modules
const express = require('express');
const bodyParser = require('body-parser');


// Express
const app = express();


// Database
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const dbOptions = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };
mongoose.Promise = global.Promise; // Removes deprecation warning
mongoose.connect('mongodb://localhost/grubster');
const schema = new mongoose.Schema({
  id: ObjectId,
  title: String,
  image: String,
  url: String,
  category: [String],
  creationDate: {type: Date, default: Date.now},
});
schema.plugin(mongoosePaginate);
const Recipe = mongoose.model('Recipe', schema);



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

  const page = req.query.page || 1;
  console.log('PAGE!!!', page);

  Recipe.paginate({}, { page: page, limit: 10 }, (err, data) => {
    console.log('paginating!', data);
    res.json({
      totalPages: data.pages,
      recipes: data.docs,
    });
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
app.get('/api/recipes/category/:category', (req, res) => {
  const { category } = req.params;

  Recipe.find({ category: category }).exec((err, recipes) => {
    res.json(recipes);
  });
});

