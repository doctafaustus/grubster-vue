//import mostPopular from './components/most-popular.vue';
import recipeList from './components/recipe-list.vue';

export default [
  { path: '/', 
    component: recipeList,
    alias: ['/callback', '/category/:category', '/most-popular', '/favorites', '/search/:term'],
  },
]