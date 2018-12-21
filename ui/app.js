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
