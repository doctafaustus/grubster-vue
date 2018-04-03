<template>
  <div id="header-section">
    <header>
      <router-link id="logo" to="/">
        <!-- <img src="/images/chef-hat.png"> -->
        <h1>grubster</h1>
      </router-link>

      <div id="header-right">
        <a id="add-recipe" class="btn" href="#">Add Recipe</a>
        <a id="login" class="btn" href="#">Login</a>
      </div>
    </header>
    
    <div id="bar-outer">
      <ul id="bar">
        <li><router-link to="/recent">Recent</router-link></li>
        <li><router-link to="/most-popular">Most Popular</router-link></li>
        <li id="categories">
          <a href="#">Categories</a>
          <div id="categories-dropdown">
            <ul class="category-column" id="meal-type-category">
              <li class="category-title">Meal Type</li>
              <li><a href="#">Appetizers &amp; Snacks</a></li>
              <li><a href="#">Breakfast &amp; Brunch</a></li>
              <li><a href="#">Desserts</a></li>
              <li><router-link to="/category?category=lunch-dinner">Lunch / Dinner</router-link></li>
              <li><a href="#">Drinks</a></li>
              <li><a href="#">Side Dishes</a></li>
            </ul>
            <ul class="category-column" id="food-category">
              <li class="category-title">Food Type</li>
              <li><a href="#">Beef</a></li>
              <li><a href="#">Bread</a></li>
              <li><a href="#">Chicken</a></li>
              <li><a href="#">Eggs</a></li>
              <li><a href="#">Milk &amp; Cheese</a></li>
              <li><a href="#">Pasta</a></li>
              <li><a href="#">Pork</a></li>
              <li><a href="#">Salad</a></li>
              <li><a href="#">Seafood</a></li>
              <li><a href="#">Soup / Stew</a></li>
            </ul>
            <ul class="category-column" id="diet-category">
              <li class="category-title">Diet</li>
              <li><a href="#">Diabetic</a></li>
              <li><a href="#">Gluten Free</a></li>
              <li><a href="#">Low Fat</a></li>
              <li><a href="#">Paleo</a></li>
              <li><a href="#">Vegan</a></li>
              <li><a href="#">Vegetarian</a></li>
            </ul>
          </div>
        </li>
        <li><a href="#">Favorites</a></li>
      </ul>
    </div>
  </div>
</template>



<script>
export default {
  data() {
    return {
    }
  },
}
</script>