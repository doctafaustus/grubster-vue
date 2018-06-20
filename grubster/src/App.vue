<template>
  <div id="app">
    <div id="sub" style="display: none;">{{ userData.sub }}</div>
    <header-section v-bind:userData="userData"/>
    <router-view v-if="show" v-bind:categories="categories" v-bind:userData="userData" v-bind:barColors="barColors"/>
  </div>
</template>

<script>
import AuthService from './auth/AuthService';
import poll from './helper-functions/poll';

import headerSection from './components/header-section';
import categories from './data/categories';
import barColors from './data/bar-colors';


const auth = new AuthService();
window.x = auth;

export default {
  name: 'App',
  created() {
    const self = this;
    poll(self.auth.isAuthenticated, () => {
      this.auth.getProfile((err, profile) => {
        console.log('profile', profile);

        this.$http.post(`http://localhost:3000/api/users/${profile.sub}?nickname=${profile.nickname}`, {}, {emulateJSON: true})
        .then(data => {
          console.log('done!', data);
          self.userData = {
            loginButtonText: 'Logout',
            sub: data.body._id,
          };

          window.favorites = data.body.favorites;
          self.$children[1].markFavorites();
        });

      });
    }, 50, 8000);

    this.$on('login', () => {
      if (!localStorage.getItem('expires_at')) {
        console.log('logging in...')
        this.auth.login();
      } else {
        this.auth.logout(() => {
          // Destroy session server-side
          this.$http.get('/api/logout')
          .then(data => {
            console.log('successful logout');
            window.location.pathname = '/';
          });
        });
      }
    });

    if (!window.favoriteListenerAdded) {
      document.addEventListener('favorite_refresh', () => {
        window.favoriteListenerAdded = true;
        console.log('favorite_refresh event dispatched');
        window.refreshFavorites();
        const self = this;
        self.show = false;
        setTimeout(function() {
          self.show = true;
        }, 100);
      });
    }
  },
  data() {
    return {
      categories,
      auth,
      barColors,
      userData: {},
      show: true,
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


