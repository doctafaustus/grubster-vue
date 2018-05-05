<template>
  <div id="app">
    <header-section/>
    <router-view v-bind:categories="categories"/>
  </div>
</template>

<script>
import AuthService from './auth/AuthService';
import headerSection from './components/header-section';
import categories from './data/categories';


window.x = new AuthService();
//x.getProfile((err, prof) => { console.log(err, prof) });
// User id is "sub"

export default {
  name: 'App',
  data() {
    return {
      categories
    };
  },
  components: {
    'header-section': headerSection,
  }
}
</script>

<style lang="scss">
  @import '../static/css/root.scss';
</style>


