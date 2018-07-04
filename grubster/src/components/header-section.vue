<template>
  <div id="header-section" v-bind:class="{ 'search-open': searchOpen, 'menu-open': menuOpen }">

    <!-- Mobile Header -->
    <div id="mobile-header">
      <a id="burger-button" href="#" v-on:click.prevent="menuOpen = !menuOpen">
        <div id="burger-inner">
          <hr><hr><hr>
        </div>
      </a>
      <router-link class="logo" to="/">
        <h1>grubster</h1>
      </router-link>
      <a id="mobile-search-button" v-on:click.prevent="searchOpen = !searchOpen"><span></span></a>
    </div>

    <!-- Desktop Header -->
    <header>
      <router-link class="logo" to="/">
        <h1>grubster</h1>
      </router-link>

      <div id="header-right">
        <form id="search-form" v-on:submit.prevent="submitSearch">
          <span id="search-icon"></span>
          <input id="search-input" type="text" v-model="term">
          <router-link v-bind:to="urlAction" ref="search-link-proxy" style="display: none;">Search Link Proxy</router-link>
        </form>

        <a id="add-recipe" class="btn btn-orange" href="#">Add Recipe</a>
        <a id="login" class="btn btn-orange" href="#" v-on:click.prevent="login">{{ loginButtonText }}</a>
      </div>
    </header>

    
    <div id="bar-outer">
      <ul id="bar">
        <li id="recent-li"><router-link to="/">Recent</router-link></li>
        <li id="most-popular-li"><router-link to="/most-popular">Most Popular</router-link></li>
        <li id="favorites-li"><router-link to="/favorites">Favorites</router-link></li>
        <li id="categories">
          <a href="#">Categories</a>
          <div id="categories-dropdown">
            <ul class="category-column" id="meal-type-category">
              <li class="category-title">Meal Type</li>
              <li><router-link to="/category/appetizers-snacks">Appetizers &amp; Snacks</router-link></li>
              <li><router-link to="/category/breakfast-brunch">Breakfast &amp; Brunch</router-link></li>
              <li><router-link to="/category/desserts">Desserts</router-link></li>
              <li><router-link to="/category/lunch-dinner">Lunch / Dinner</router-link></li>
              <li><router-link to="/category/drinks">Drinks</router-link></li>
              <li><router-link to="/category/side-dishes">Side Dishes</router-link></li>
            </ul>
            <ul class="category-column" id="food-category">
              <li class="category-title">Food Type</li>
              <li><router-link to="/category/beef">Beef</router-link></li>
              <li><router-link to="/category/bread">Bread</router-link></li>
              <li><router-link to="/category/chicken">Chicken</router-link></li>
              <li><router-link to="/category/eggs">Eggs</router-link></li>
              <li><router-link to="/category/milk-cheese">Milk &amp; Cheese</router-link></li>
              <li><router-link to="/category/pasta">Pasta</router-link></li>
              <li><router-link to="/category/pork">Pork</router-link></li>
              <li><router-link to="/category/salad">Salad</router-link></li>
              <li><router-link to="/category/seafood">Seafood</router-link></li>
              <li><router-link to="/category/soup-stew">Soup / Stew</router-link></li>
            </ul>
            <ul class="category-column" id="diet-category">
              <li class="category-title">Diet</li>
              <li><router-link to="/category/diabetic">Diabetic</router-link></li>
              <li><router-link to="/category/gluten-free">Gluten Free</router-link></li>
              <li><router-link to="/category/low-fat">Low Fat</router-link></li>
              <li><router-link to="/category/paleo">Paleo</router-link></li>
              <li><router-link to="/category/vegan">Vegan</router-link></li>
              <li><router-link to="/category/vegetarian">Vegetarian</router-link></li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>



<script>


export default {
  props: ['userData'],
  methods: {
    login() {
      this.$parent.$emit('login');
    },
    submitSearch() {
      if (!this.term.trim()) return;
      this.$refs['search-link-proxy'].$el.click();
      this.term = '';
    },
    highlightNav() {
      [...document.querySelectorAll('#bar > li')].forEach(li => {
        li.classList.remove('active');
      });

      const navSelectorMap = {
        '': 'recent-li',
        'most-popular': 'most-popular-li',
        'favorites': 'favorites-li',
        'category': 'categories',
      }
      const activeNavID = navSelectorMap[window.location.pathname.split('/')[1]];
      document.querySelector(`#${activeNavID}`).classList.add('active');
    }
  },
  computed: {
    urlAction() {
      return `/search/${this.term}`;
    },
  },
  mounted() {
    this.highlightNav();
  },
  watch: {
    userData(newVal, oldVal) {
      this.loginButtonText = newVal.loginButtonText;
      this.sub = newVal.sub;
    },
    $route() {
      console.log('ruout change!@');
      this.searchOpen = false;
      this.menuOpen = false;
      this.highlightNav();
    }
  },
  data() {
    return {
      loginButtonText: 'Login / Register',
      sub: null,
      favorites: [],
      term: '',
      searchOpen: false,
      menuOpen: false,
    }
  }
}
</script>