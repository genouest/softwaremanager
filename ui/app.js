// import Softwares from './softwares';
// import Software from './software';
 

const routes = [
    {path: '/', component: Softwares},
    {path: '/:id', component: Software}
]

const router = new VueRouter({
    routes // short for `routes: routes`
});

const app = new Vue({
    router
  }).$mount('#app');

/*
var app = new Vue({
    el: '#app',
    data: {
      currentRoute: window.location.pathname
    },
    computed: {
        ViewComponent () {
          return routes[this.currentRoute]
        }
      },
    render (h) { return h(this.ViewComponent) },
    getSofware: function() {
        this.$http.get('/soft').then(
          resp => {
            console.log('Softwares', resp.body);
            this.data.softwares = resp.body
          },
          err => {
              console.log('Error', err)
            // error callback
          });
    }
  })

*/