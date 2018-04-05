<template>
  <div id="app">
    <header-section/>
    <router-view v-bind:categories="categories"/>
  </div>
</template>

<script>
import headerSection from './components/header-section';
import categories from './data/categories';

export default {
  name: 'App',
  data() {
    return {
      categories,
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


