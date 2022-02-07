

var Software = {
    template: '#software',
    data: function() {
        return {
            software: {},
            versions: [],
            bio: null
        }
    },
    methods: {
        getSoftware: function() {
            let soft = this.$route.params.id;
            fetch('/soft/'+soft).then(resp => {return resp.json()}).then(s => {this.versions = s.versions; this.software = s.software;}).catch(err => {
                console.error(err); this.software ={};
            });
        },
        getBioTools: function() {
            let soft = this.software.uid;
            if(this.software.uid) {
                fetch('https://bio.tools/api/' + soft + '/?format=json').then(resp => {return resp.json()}).then(s => {this.bio = s;}).catch(err => {
                    console.error(err);
                });
            }
        }
    },
    beforeMount() {
        this.getSoftware()
    },
    updated: function() {
        this.$nextTick(function () {
            $('#softwareTable').DataTable();
          })
    }
};

Vue.component('software', Software);
