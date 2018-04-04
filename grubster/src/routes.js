import showRecipes from './components/show-recipes.vue';
import recent from './components/recent.vue';
import mostPopular from './components/most-popular.vue';
import category from './components/category.vue';

export default [
  { path: '/', component: showRecipes },
  { path: '/recent', component: recent },
  { path: '/most-popular', component: mostPopular },
  { path: '/category/:category', component: category }, 
]