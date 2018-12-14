

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
            this.$http.get('/soft/' + soft).then(
                resp => {
                    this.versions = resp.body.versions;
                    this.software = resp.body.software;
                    this.getBioTools();
                },
                err => {
                    console.log('Error', err)
                    // error callback
                    this.software = {};
            });         
        },
        getBioTools: function() {
            let soft = this.software.uid;
            soft = 'SODa';
            if(this.software.uid) {
                this.$http.get('https://bio.tools/api/' + soft + '/?format=json').then(
                    resp => {
                        this.bio = resp.body;
                    },
                    err => {
                        console.log('no biotools', err)
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