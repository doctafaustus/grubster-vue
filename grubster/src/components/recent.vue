<template>
  <div id="show-recipes">
    <h2>Recently Added Recipes</h2>
    <ul class="recipe-list">
      <li class="recipe-card" v-for="recipe in recipes">
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
  </div>
</template>



<script>
export default {
  data() {
    return {
      recipes: [],
    }
  },
  created() {
    this.$http.get('http://localhost:3000/api/recipes/recent')
    .then(data => {
      this.recipes = data.body;
    })
  }
}
</script>