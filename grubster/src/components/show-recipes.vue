<template>
  <div id="show-recipes">

    <div id="search">
      <form id="search-form" v-on:submit.prevent="search">
        <span id="search-icon"></span>
        <input type="text" id="search-form-input" placeholder="Search Recipes" autocomplete="off">
      </form>
    </div>

    <h2>Recipes</h2>
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
      paginator: this.debounce(this.paginate, 150),
      totalPages: 0,
      pageCounter: 1,
    }
  },
  created() {
    this.$http.get('http://localhost:3000/api/recipes')
    .then(data => {
      this.totalPages = data.body.totalPages;
      this.recipes = data.body.recipes;
    });

    window.addEventListener('scroll', this.paginator);
  },
  destroyed() {
    window.removeEventListener('scroll', this.paginator);
  },
  methods: {
    // search() {
    //   console.log('seraching!');
    //   this.$http.get('http://localhost:3000/api/recipes/search?term=Mexican')
    //   .then(data => {
    //     this.recipes = data.body;
    //   })
    // },
    debounce(fn, wait, leading = false) {
      let timeout;

      return function(...args) {
        function later() {
          timeout = null;
          if (!leading) fn(...args);
        }

        const callNow = leading && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) fn(...args);
      };
    },
    paginate() {
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
        console.log('this.pageCounter', this.pageCounter);
        console.log('this.totalPages', this.totalPages);

        if (this.pageCounter < this.totalPages) {
          this.pageCounter++;
          this.$http.get(`http://localhost:3000/api/recipes?page=${this.pageCounter}`)
          .then(data => {
            this.recipes.push(...data.body.recipes);
          });
        }
      }
    },
  }
}
</script>