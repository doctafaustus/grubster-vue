<template>
  <div id="show-recipes">
    <div id="title-bar">
      <h2 id="recipes-title">{{ categories[this.getCategory()] || this.getSearchTerm() }}</h2><span ref="recipes-num">({{ totalRecipes }})</span>
    </div>
    <div id="title-border"></div>

    <ul class="recipe-list">
      <li class="recipe-card" v-for="recipe in recipes" v-bind:data-recipe-id="recipe._id" ref="recipe-card">
        <div class="recipe-like">
          <span class="recipe-like-count" v-show="recipe.favorites !== 0">{{ recipe.favorites }}</span>
          <svg class="heart" viewBox="0 0 32 32" v-on:click="favorite($event)">
            <path d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454 C30,20.335,16,28.261,16,28.261z"/>
          </svg> 
        </div>
        <div class="link-container">
          <a class="recipe-link" :href="recipe.url" target="_blank">
            <div class="recipe-image"><img v-bind:src="recipe.image"></div>
            <div class="recipe-card-bottom">
              <div class="recipe-title">{{ recipe.title }}</div>
              <div class="recipe-host">{{ recipe.host }}</div>
            </div>
          </a>
          <svg class="flag" v-on:click="flag">
            <path d="M49.1,29.2c-10.4-5.2-18.7-4.5-18.7-4.5v46.6c0,0,3.9,0.7,3.9-1.7c0-2.4,0-19.9,0-19.9c2.2-0.7,6.1-1.4,14.8,4.3  c11.2,6.6,16.4-2,16.4-2V27.2C65.5,27.2,59.6,34.1,49.1,29.2z"/>
          </svg>
        </div>
      </li>
    </ul>

    <a id="show-more" href="#" class="btn btn-orange" v-show="pageCounter < totalPages" v-on:click.prevent="getRecipes">Show More</a>

    <div id="extension-welcome" v-show="extensionModalOpen">
      <div id="extension-welcome-modal" class="modal opened">
        <svg class="close" viewBox="0 0 32 32" v-on:click="hideModal">
          <polygon points="24.485,27.314 27.314,24.485 18.828,16 27.314,7.515 24.485,4.686 16,13.172 7.515,4.686 4.686,7.515 13.172,16 4.686,24.485 7.515,27.314 16,18.828 "></polygon>
        </svg>
        <div class="logo">
          <h1>grubster</h1>
        </div>
        <h2 class="extension-title">Thanks for downloading the grubster extension!</h2>
        <div>
          To save recipes to your favorites please <a id="extension-login" href="#" v-on:click.prevent="extensionLogin">Login</a>. Any recipes you save with the extension will then automatically be saved to your account!
        </div>
      </div>
      <div class="overlay opened" v-on:click.prevent="hideModal"></div>
    </div>


  </div>
</template>



<script>
export default {
  props: ['categories', 'userData', 'barColors'],
  data() {
    return {
      recipes: [],
      pageCounter: 0,
      totalPages: 0,
      totalRecipes: 0,
      recipesTitle: '',
      extensionModalOpen: false,
      category: this.getCategory(),
    }
  },
  created() {
    this.getRecipes();
    window.refreshFavorites = this.refreshFavorites;
    if (window.location.search.indexOf('extension_callback') > -1) {
      this.extensionModalOpen = true;
    }
  },
  mounted() {
    this.updateColor();
  },
  methods: {
    hideModal() {
      document.querySelector('#extension-welcome').setAttribute('style', 'display: none;');
    },
    extensionLogin() {
      this.$parent.$emit('login', 'from_extension');
    },
    getSearchTerm() {
      const term = (window.location.pathname.match(/\/search\/(.+)/) || [])[1];
      const decodedTerm = window.decodeURIComponent(term);
      return `"${decodedTerm}" Results`;
    },
    flag(event) {

      const target = event.target.classList.contains('flag') ? event.target : event.target.parentNode;
      if (target.classList.contains('active')) return;
      const id = target.closest('li').getAttribute('data-recipe-id');

      target.classList.add('active');
      const flaggedMessage = document.createElement('div');
      flaggedMessage.innerHTML = 'Recipe flagged for removal';
      flaggedMessage.classList.add('flagged-message');
      target.parentNode.appendChild(flaggedMessage);

      if (localStorage.getItem(`flag-${id}`)) return console.log('Recipe already flagged');
      
      this.$http.get(`http://localhost:3000/api/flag/${id}`)
      .then(data => {
        console.log('success');
        localStorage.setItem(`flag-${id}`, true);
      });

    },
    updateColor() {
      const color = this.barColors[window.location.pathname] ? this.barColors[window.location.pathname] : this.barColors['/categories'];
      document.querySelector('#title-bar').setAttribute('style', `background-color: ${color};`);
      document.querySelector('#title-border').setAttribute('style', `border-top: solid 2px ${color};`);
    },
    favorite(event) {
      const heartEl = event.currentTarget;
      const recipeCard = heartEl.closest('li');
      const id = recipeCard.getAttribute('data-recipe-id');
      const recipeLikeCountEl = recipeCard.querySelector('.recipe-like-count');
      const recipeLikeCountNum = Number(recipeLikeCountEl.innerHTML);

      if (heartEl.classList.contains('favorited')) {
        recipeLikeCountEl.innerHTML = recipeLikeCountNum - 1;
        heartEl.classList.remove('favorited');

        this.$http.post(`http://localhost:3000/api/favorites/remove/${this.userData.sub}?recipeID=${id}`, {a: 1}, {emulateJSON: true})
        .then(data => {
          window.favorites = JSON.parse(data.bodyText);
          if (window.location.pathname === '/favorites') {
            this.totalRecipes--;
            recipeCard.remove();
          }
        });
      } else {
        recipeLikeCountEl.innerHTML = recipeLikeCountNum + 1;
        heartEl.classList.add('favorited');

        this.$http.post(`http://localhost:3000/api/favorites/add/${this.userData.sub}?recipeID=${id}`, {a: 1}, {emulateJSON: true})
        .then(data => {
          window.favorites = JSON.parse(data.bodyText);
        }).catch(data => {
          this.$parent.$emit('login');
        });
      }
    },
    markFavorites() {
      if (!window.favorites) return;
      const cards = this.$refs['recipe-card'];
      if (!cards) return;

      cards.forEach(card => {
        const recipeID = card.getAttribute('data-recipe-id');
        if (window.favorites.includes(recipeID)) {
          card.querySelector('.heart').classList.add('favorited');
        }
      });
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
      } else if (path === '/favorites') {
        endPoint = 'favorites';
      } else if (/^\/search\//.test(path)) {
        endPoint = `search/${(path.match(/\/search\/(.+)/) || [])[1]}`;
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
      })
      .catch(data => {
        if (window.location.pathname === '/favorites') {
          this.recipes = [];
          this.totalPages = 0;
          this.totalRecipes = 0;
          this.$parent.$emit('login');
        }
      });
    },
    refreshFavorites() {
      console.log('Refreshing favorites!');
      this.$http.get(`http://localhost:3000/api/favorites/refresh/${this.userData.sub}`, {a: 1}, {emulateJSON: true})
      .then(data => {
        console.log('favorites refreshed!');
        window.favorites = JSON.parse(data.bodyText);
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
      this.updateColor();
    }
  },
  updated: function () {
    this.$nextTick(function () {
      this.markFavorites();
    });
  }
}
</script>