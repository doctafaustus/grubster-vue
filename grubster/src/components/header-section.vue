<template>
  <div id="header-section">
    <header>
      <router-link id="logo" to="/">
        <!-- <img src="/images/chef-hat.png"> -->
        <h1>grubster</h1>
      </router-link>

      <div id="header-right">
        <a id="add-recipe" class="btn btn-orange" href="#">Add Recipe</a>
        <a id="login" class="btn btn-orange" href="#" v-on:click.prevent="login">Login / Register</a>
      </div>
    </header>
    
    <div id="bar-outer">
      <ul id="bar">
        <li><router-link to="/">Recent</router-link></li>
        <li><router-link to="/most-popular">Most Popular</router-link></li>
        <li><a href="#">Favorites</a></li>
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
  props: ['auth'],
  created() {
    const isLoggedIn = this.auth.isAuthenticated();
    if (!isLoggedIn) return console.log('User not logged in');
    this.auth.getProfile((err, profile) => {
      console.log('profile', profile);

      // Make ajax request to determine if user is not in DB, if not then add, otherwise just pull favorites
    });
  },
  methods: {
    login() {
      this.auth.login();
    }
  },
  data() {
    return {
    }
  }
}
</script>