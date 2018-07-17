// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import routes from './routes';

window.endpoint = (window.location.origin.indexOf('http://localhost') > -1) ? 'http://localhost:3000' : 'https://grubster-app.herokuapp.com';

Vue.use(VueResource);
Vue.use(VueRouter);

Vue.http.options.credentials = true;

const router = new VueRouter({
  routes: routes,
  mode: 'history',
});

window.vm = new Vue({
  el: '#app',
  render: h => h(App),
  router: router,
});

