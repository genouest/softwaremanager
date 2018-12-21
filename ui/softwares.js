
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
                    this.softwares = resp.body.software;
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
            $('#softwaresTable').DataTable({
                "pageLength": 20,
                "lengthMenu": [ 10, 20, 30, 50, 75, 100, 200 ]
            });
          })
    }

};

Vue.component('softwares', Softwares);
