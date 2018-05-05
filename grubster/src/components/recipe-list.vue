<template>
  <div id="show-recipes">

    <div id="search">
      <form id="search-form" v-on:submit.prevent="search">
        <span id="search-icon"></span>
        <input type="text" id="search-form-input" placeholder="Search Recipes" autocomplete="off">
      </form>
    </div>

    <div id="title-bar">
      <h2 id="recipes-title">{{ categories[this.getCategory()] }}</h2><span>({{ totalRecipes }})</span>
    </div>
    <div id="title-border"></div>
    <ul class="recipe-list">
      <li class="recipe-card" v-for="recipe in recipes" v-bind:data-recipe-id="recipe._id">
        <div class="recipe-like">
          <span class="recipe-like-count">{{ recipe.favorites }}</span>
          <svg class="heart" viewBox="0 0 32 32" v-on:click="favorite($event)">
            <path d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454 C30,20.335,16,28.261,16,28.261z"/>
          </svg> 
        </div>
        <a class="recipe-link" :href="recipe.url" target="_blank">
          <div class="recipe-image"><img v-bind:src="recipe.image"></div>
          <div class="recipe-card-bottom">
            <div class="recipe-title">{{ recipe.title }}</div>
            <div class="recipe-host">{{ recipe.host }}</div>
          </div>
        </a>
      </li>
    </ul>
    <a id="show-more" href="#" class="btn btn-orange" v-show="pageCounter < totalPages" v-on:click.prevent="getRecipes">Show More</a>
  </div>
</template>



<script>
export default {
  props: ['categories'],
  data() {
    return {
      recipes: [],
      pageCounter: 0,
      totalPages: 0,
      totalRecipes: 0,
      recipesTitle: '',
      category: this.getCategory(),
    }
  },
  created() {
    this.getRecipes();
  },
  methods: {
    favorite(event) {
      const recipeCard = event.currentTarget.closest('li');
      const id = recipeCard.getAttribute('data-recipe-id');
      const recipeLikeCountEl = recipeCard.querySelector('.recipe-like-count');
      const recipeLikeCountNum = Number(recipeLikeCountEl.innerHTML);

      recipeLikeCountEl.innerHTML = recipeLikeCountNum + 1;
      event.currentTarget.classList.add('favorited');
      this.likeRecipe(id);
    },
    getCategory() {
      return window.location.pathname.replace('/category/', '');
    },
    getEndpoint() {
      let endPoint;
      const path = window.location.pathname;
      if (path.indexOf('/category/') > -1) {
        endPoint = `category/${this.category}`;
      } else if (path === '/' || path === '/callback') {
        endPoint = '';
      } else if (path === '/most-popular') {
        endPoint = 'most-popular';
      }
      return endPoint;
    },
    getRecipes() {
      this.pageCounter++;
      this.$http.get(`http://localhost:3000/api/recipes/${this.getEndpoint()}?page=${this.pageCounter}`)
      .then(data => {
        this.recipes.push(...data.body.recipes);
        this.totalPages = data.body.totalPages;
        this.totalRecipes = data.body.totalRecipes;
      });
    },
    likeRecipe(recipeID) {
      this.$http.post(`http://localhost:3000/api/recipes/${recipeID}`, {a: 1}, {emulateJSON: true})
      .then(data => {
        console.log('done!', data);
      });
    }
  },
  watch: {
    '$route.params': function() {
      this.category = this.getCategory();
      console.log('category', this.category);
      this.recipes = [];
      this.pageCounter = 0;
      this.getRecipes();
    }
  }
}
</script>