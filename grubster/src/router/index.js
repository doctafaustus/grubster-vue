import Vue from 'vue'
import Router from 'vue-router'
import recipeList from '../components/recipe-list.vue';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: recipeList
    }
  ]
})
