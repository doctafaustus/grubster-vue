<template>
  <div id="show-recipes">

    <div id="search">
      <form id="search-form" v-on:submit.prevent="search">
        <span id="search-icon"></span>
        <input type="text" id="search-form-input" placeholder="Search Recipes" autocomplete="off">
      </form>
    </div>

    <h2 id="recipes-title">{{ recipesTitle }}</h2><span>({{ totalRecipes }})</span>
    <ul class="recipe-list">
      <li class="recipe-card" v-for="recipe in recipes" v-bind:data-recipe-id="recipe._id">
        <div class="recipe-like">
          <span class="recipe-like-count">{{ recipe.favorites }}</span>
          <svg class="heart" viewBox="0 0 32 32">
            <path d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454 C30,20.335,16,28.261,16,28.261z"/>
          </svg> 
        </div>
        <div class="recipe-image"><img v-bind:src="recipe.image"></div>
        <div class="recipe-card-bottom">
          <div class="recipe-title">{{ recipe.title }}</div>
          <div class="recipe-host">kristineskitchenblog.com</div>
        </div>
      </li>
    </ul>
    <a id="show-more" href="#" class="btn btn-orange" v-show="pageCounter < totalPages" v-on:click.prevent="getRecipes">Show More</a>
  </div>
</template>



<script>
export default {
  data() {
    return {
      recipes: [],
      pageCounter: 0,
      totalPages: 0,
      totalRecipes: 0,
      recipesTitle: 'Recent Recipes',
    }
  },
  created() {
    this.getRecipes();
  },
  methods: {
    getRecipes() {
      this.pageCounter++;
      this.$http.get(`http://localhost:3000/api/recipes?page=${this.pageCounter}`)
      .then(data => {
        this.recipes.push(...data.body.recipes);
        this.totalPages = data.body.totalPages;
        this.totalRecipes = data.body.totalRecipes;
      });
    },
  }
}
</script>