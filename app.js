// Core Modules
const express = require('express');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary');
const fs = require('fs');

// Express Config
const app = express();


// Database Config
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const dbOptions = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };
mongoose.Promise = global.Promise; // Removes deprecation warning
mongoose.connect('mongodb://localhost/grubster');


const userSchema = new mongoose.Schema({
  _id: String,
  nickname: String,
  favorites: [String],
  creationDate: {type: Date, default: Date.now},
});
const User = mongoose.model('User', userSchema);

const recipeSchema = new mongoose.Schema({
  id: ObjectId,
  title: String,
  image: String,
  host: String,
  url: String,
  favorites: Number,
  category: [String],
  creationDate: {type: Date, default: Date.now},
});
recipeSchema.plugin(mongoosePaginate);
const Recipe = mongoose.model('Recipe', recipeSchema);


// Cloudinary Config
const cloudinarySecret = fs.readFileSync('./private/cloudinary_secret.txt').toString();
cloudinary.config({ 
  cloud_name: 'dormh2fvt', 
  api_key: '778489856867779', 
  api_secret: cloudinarySecret, 
});
const cloudinaryOptions = { gravity: 'center', height: 500, width: 500, crop: 'fill', };


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


// Favorite recipe
app.post('/api/recipes/:recipeID', (req, res) => {
  const { recipeID } = req.params;
  const { user } = req.query;

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


  cloudinary.uploader.upload(req.body.image,
    function(result) {

      const recipe = new Recipe({
        title: req.body.title,
        image: result.secure_url,
        host: req.body.host,
        url: req.body.url,
        favorites: 1,
        category: req.body.categories,
      });

      recipe.save((err, recipe) => {
        console.log('New recipe addded!');
        res.json(recipe);
      });

    }, cloudinaryOptions);
});


// User database
app.post('/api/users/:subject', (req, res) => {
  console.log('/users/:subject');

  const { subject } = req.params;
  const { nickname } = req.query; 

  User.findOne({ '_id': subject }, (err, user) => {
    if (user) {
      console.log('Found user', user);
      res.json(user);
    } else { // User not found, create new user
      console.log('Creating new user');
      const newUser = new User();

      newUser._id = subject;
      newUser.nickname = nickname;

      newUser.save((err, user) => {
        if (err) console.log(err);
        console.log('User saved!', user);
        res.json(user);
      });
    }
  });

});

function sendRecipes(data, res) {
  res.json({
    totalPages: data.pages,
    totalRecipes: data.total,
    recipes: data.docs,
  });
}





