<template>
  <div id="app">
    <header-section/>
    <router-view/>
  </div>
</template>

<script>
import headerSection from './components/header-section';

export default {
  name: 'App',
  components: {
    'header-section': headerSection,
  }
}
</script>

<style lang="scss">
  @import '../static/css/root.scss';
</style>
