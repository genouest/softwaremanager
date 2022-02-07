
var Softwares = {
    template: '#softwares',
    data: function() {
        return {
            softwares: [],
        }
    },
    methods: {
        getSoftwares: function() {
            fetch('/soft').then(resp => {return resp.json()}).then(s => {this.softwares = s.software;}).catch(err => {console.error(err); this.softwares = []});
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
