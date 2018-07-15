// Core Modules
const express = require('express');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary');
const fs = require('fs');
const path = require('path');


// Express Config
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Database Config
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const dbOptions = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };
mongoose.Promise = global.Promise; // Removes deprecation warning


// Connect to DB
if (!process.env.PORT) {
  mongoose.connect('mongodb://localhost/grubster');
} else {
  console.log("Application running in Heroku!");
  const mongodbUri = process.env.MONGODB_URI; // A Heroku config variable
  const mongooseUri = uriUtil.formatMongoose(mongodbUri);
  mongoose.connect(mongooseUri, dbOptions);
}



// Private Config Data
const adminID = process.env.PORT ? process.env.ADMIN_ID : fs.readFileSync('./private/admin-id.txt').toString();


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
  flag: Number,
  creationDate: {type: Date, default: Date.now},
});
recipeSchema.plugin(mongoosePaginate);
const Recipe = mongoose.model('Recipe', recipeSchema);


// Configure MongoStore options
// This enables users to stay logged in even if the server goes down
let mongoStoreOptions;
if (!process.env.PORT) {
  mongoStoreOptions = {
    url: 'mongodb://localhost/grubster',
  };
} else {
  mongoStoreOptions = {
    url: process.env.MONGODB_URI,
    ttl: 365 * 24 * 60 * 60,
  };
}




// Cloudinary Config
const cloudinarySecret = process.env.PORT ? process.env.CLOUDINARY_SECRET : fs.readFileSync('./private/cloudinary_secret.txt').toString();


cloudinary.config({ 
  cloud_name: 'dormh2fvt', 
  api_key: '778489856867779', 
  api_secret: cloudinarySecret, 
});
const cloudinaryOptions = { gravity: 'center', height: 285, width: 285, crop: 'fill', };


// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(express.static(`${__dirname}/grubster/dist/static`));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 31556952000, secure: false, },
  resave: true,
  saveUninitialized: true,
  store: new MongoStore(mongoStoreOptions),
}));


app.use((req, res, next) => {
  if (req.session.sub === adminID) res.cookie('isAdmin', 'true');
  else res.cookie('isAdmin', 'false');
  next();
});

// Listen
app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port 3000');
});


// Homepage (Heroku-accessible only)
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/grubster/dist/index.html`));
});


// PAGE: All Recipes
app.get('/api/recipes', (req, res) => {

  const page = req.query.page;
  Recipe.paginate({ flag: { $lt: 3 }}, { page: page, limit: 12, sort: { creationDate: -1 }}, (err, data) => {
    sendRecipes(data, res);
  });
});


// Search Recipes
app.get('/api/recipes/search/:term', (req, res) => {
  const { page } = req.query;
  const { term } = req.params;

  Recipe.paginate({ flag: { $lt: 3 }, title: { $regex: term, $options: 'i' }}, { page: page, limit: 12, sort: { favorites: -1 }}, (err, data) => {
    sendRecipes(data, res);
  });
});


// PAGE: Most Popular Recipes
app.get('/api/recipes/most-popular', (req, res) => {
  const { page } = req.query;

  Recipe.paginate({ flag: { $lt: 3 }}, { page: page, limit: 12, sort: { favorites: -1 }}, (err, data) => {
    sendRecipes(data, res);
  });
});

// PAGE: Favorite Recipes
app.get('/api/recipes/favorites', (req, res) => {
  const { page } = req.query;

  User.findOne({ '_id': req.session.sub }, (err, user) => {

    if (!user) return res.sendStatus(404);

    const userFavorites = user.favorites;

    // Not using paginate here to account for the user-defined order of favorites
    Recipe.find({ _id: { $in: userFavorites }}, (err, data) => {
      data.sort(function(a, b) {
        return userFavorites.indexOf(a._id) - userFavorites.indexOf(b._id);
      }).reverse();

      sendRecipes({
        pages: 1,
        total: data.length,
        docs: data,
      }, res);

    });
  });

});


// PAGE: Recipe Categories
app.get('/api/recipes/category/:category', (req, res) => {
  const { category } = req.params;
  const { page } = req.query;

  Recipe.paginate({ category: category, flag: { $lt: 3 }}, { page: page, limit: 12, sort: { creationDate: -1 }}, (err, data) => {
    sendRecipes(data, res);
  });
});



// Extension POST
app.post('/api/extension', (req, res) => {
  console.log('/api/extension');

  // First check if recipe is already in database
  Recipe.findOne({ url: req.body.url }, (err, recipe) => {
    if (!recipe) {

      cloudinary.uploader.upload(req.body.image,
        function(result) {

          const recipe = new Recipe({
            title: req.body.title,
            image: result.secure_url || 'http://res.cloudinary.com/dormh2fvt/image/upload/v1527317481/placeholder_rjy55k.jpg',
            host: req.body.host,
            url: req.body.url,
            favorites: 0,
            flag: 0,
            category: req.body.categories,
          });

          recipe.save((err, recipe) => {
            console.log('New recipe addded!');
            if (req.body.sub) {
              saveExtensionRecipeAsFavorite(recipe, req, res, 'recipe added');
            } else {
              res.json({ message: 'recipe added' });
            }
          });

        },
      cloudinaryOptions);

    } else {
      if (req.body.sub) {
        saveExtensionRecipeAsFavorite(recipe, req, res, 'favorited');
      } else {
        res.json({ message: 'in db, no user' });
      }
    }
  });
});


function saveExtensionRecipeAsFavorite(recipe, req, res, message) {
  User.findOne({ '_id': req.body.sub }, (err, user) => {
    const userFavorites = user.favorites;
    if (userFavorites.indexOf(recipe._id) === -1) {      
      recipe.favorites++;
      recipe.save(() => {
        user.favorites.push(recipe._id);
        user.save((err, user) => {
          if (message === 'recipe added') {
            console.log('Recipe added to database and favorited');
          } else {
            console.log('Recipe already in database but favorited');
          }
          res.json({ message: message });
        });
      });
    } else {
      console.log('Recipe already in database AND favorites');
      res.json({ message: message });
    }
  });
}



// Add / find users
app.post('/api/users/:subject', (req, res) => {

  const { subject } = req.params;
  const { nickname } = req.query; 

  req.session.sub = subject;

  User.findOne({ '_id': subject }, (err, user) => {
    if (user) {
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


// Logout
app.get('/api/logout', (req, res) => {
  req.session.destroy(function(err) {
    res.sendStatus(200);
  });
});


// Add Favorite
app.post('/api/favorites/add/:subject', (req, res) => {
  console.log('/api/favorites/add/:subject');

  const { subject } = req.params;
  const { recipeID } = req.query;

  User.findOne({ '_id': subject }, (err, user) => {
    if (!user) return res.sendStatus(404);

    const userFavorites = user.favorites;

    if (userFavorites.indexOf(recipeID) === -1) {
      user.favorites.push(recipeID);
      user.save((err, user) => {
        console.log(recipeID + ' added to favorites!');
        Recipe.findOne({ _id: recipeID }, (err, recipe) => {
          recipe.favorites++;
          recipe.save(() => {
            console.log('recipe saved!');
            res.json(user.favorites);
          });
        });
      });
    } else {
      console.log('recipe already in favorites');
      res.json(user.favorites);
    }
  });
});


// Remove Favorite
app.post('/api/favorites/remove/:subject', (req, res) => {
  console.log('/api/favorites/remove/:subject');

  const { subject } = req.params;
  const { recipeID } = req.query;

  User.findOne({ '_id': subject }, (err, user) => {
    if (!user) return res.sendStatus(404);
    user.favorites = user.favorites.filter(favorite => favorite !== recipeID);
    user.save((err, user) => {
      console.log(recipeID + ' removed from favorites!');
      Recipe.findOne({ _id: recipeID }, (err, recipe) => {
        recipe.favorites--;
        recipe.save(() => {
          res.json(user.favorites);
        });
      });
    });
  });
});


// Refresh Favorites
app.get('/api/favorites/refresh/:subject', (req, res) => {
  console.log('/api/favorites/refresh:subject')
  const { subject } = req.params;
  User.findOne({ '_id': subject }, (err, user) => {
    res.json(user.favorites);
  });
});


// Flag Recipe
app.get('/api/flag/:recipeID', (req, res) => {
  const { recipeID } = req.params;

  Recipe.findOne({ '_id': recipeID }, (err, recipe) => {
    recipe.flag++;
    recipe.save(() => {
      console.log('recipe saved!');
      res.sendStatus(200);
    });
  });

});

// Admin Delete
app.get('/api/admin-delete/:recipeID', (req, res) => {
  const { recipeID } = req.params;

  if (req.session.sub === adminID) {
    Recipe.remove({ '_id': recipeID }, (err, recipe) => {
      console.log('recipe deleted!');
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(401);
  }
});



function sendRecipes(data, res) {
  res.json({
    totalPages: data.pages,
    totalRecipes: data.total,
    recipes: data.docs,
  });
}





