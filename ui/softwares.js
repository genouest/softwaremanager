
var Softwares = {
    template: '#softwares',
    data: function() {
        return {
            softwares: [],
        }
    },
    methods: {
        getSoftwares: function() {
            this.$http.get('/soft').then(
                resp => {
                    console.log('Softwares', resp.body.softwares);
                    //this.data.softwares = resp.body
                    this.softwares = resp.body.softwares;
                },
                err => {
                    console.log('Error', err)
                    // error callback
                    this.softwares = [];
            });         
        }
    },
    beforeMount() {
        this.getSoftwares()
    },
    updated: function() {
        this.$nextTick(function () {
            $('#softwaresTable').DataTable();
          })
    }

};

Vue.component('softwares', Softwares);