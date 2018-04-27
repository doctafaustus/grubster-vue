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
  favorites: Number,
  category: [String],
  creationDate: {type: Date, default: Date.now},
});
schema.plugin(mongoosePaginate);
const Recipe = mongoose.model('Recipe', schema);



// Middleware
app.use((req, res, next) => {
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
  const page = req.query.page;
  Recipe.paginate({}, { page: page, limit: 12, sort: { creationDate: -1 }}, (err, data) => {
    sendRecipes(data, res);
  });
});


// Searched Recipes
app.get('/api/recipes/search', (req, res) => {
  const { term } = req.query;

  Recipe.find({ title: { $regex: term, $options: 'i' } }, (err, recipes) => {
    res.json(recipes);
  });
});


// Most Popular Recipes
app.get('/api/recipes/most-popular', (req, res) => {
  const { page } = req.query;

  Recipe.paginate({}, { page: page, limit: 12, sort: { favorites: -1 }}, (err, data) => {
    sendRecipes(data, res);
  });
});

// Recipe Categories
app.get('/api/recipes/category/:category', (req, res) => {
  const { category } = req.params;
  const { page } = req.query;

  Recipe.paginate({ category: category }, { page: page, limit: 12, sort: { creationDate: -1 }}, (err, data) => {
    sendRecipes(data, res);
  });
});


// Update recipe
app.post('/api/recipes/:recipeID', (req, res) => {
  const { recipeID } = req.params;

  Recipe.findOne({ _id: recipeID }, (err, recipe) => {
    recipe.favorites++;
    recipe.save(() => {
      console.log('recipe saved!');
      res.sendStatus(204);
    });
  });
});



// Extension POST
app.post('/api/extension', (req, res) => {
  console.log('api/extension', req.body);

  const recipe = new Recipe({
    title: req.body.title,
    image: req.body.image,
    url: req.body.url,
    favorites: 1,
    //category: [String],
  });

  recipe.save((err, recipe) => {
    console.log('new recipe addded!');
    res.json(recipe);
  });
});


function sendRecipes(data, res) {
  res.json({
    totalPages: data.pages,
    totalRecipes: data.total,
    recipes: data.docs,
  });
}