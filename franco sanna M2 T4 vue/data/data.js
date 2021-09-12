const app = Vue.createApp({
    data() {
        return {
            miembros: [],
            checkedPartys: ["D", "R", "ID"],
            selectedState: `all`,
            states: [],
            jsonEntero: {},
            statistics:
            {
                democrats: [],
                republicans: [],
                independants: [],
                democratsVotesWithParty: 0,
                republicansVotesWithParty: 0,
                totalVotesWithParty: 0,
                mostLoyalt: [],
                lessLoyalt: [],
                leastEngages: [], //mas inasistencias
                mostEngages: [] //menos inasistencias
            },
        }
    },
    created() {
        let Chamber = document.title.includes(`Senate`) ? `senate` : `house`
        let endpoint = `https://api.propublica.org/congress/v1/113/${Chamber}/members.json`
        let init = {
            headers: {
                'X-API-Key': 'eObmd0hjXfacZmdqvTlfLNE1iyVFB4jp8yxtLqDP'
            }
        }
        fetch(endpoint, init)
            .then(res => res.json(console.log(res)))
            .then(json => {
                this.miembros = json.results[0].members;
                /*       console.log(this.miembros) */
                this.states = this.miembros.map(member => member.state);
                /*   console.log(this.states); */
                this.calcularEstadisticas(this.miembros);
            })
            .catch(err => console.error(err.message))
    },
    methods: {
        calcularEstadisticas(array) {
            this.statistics.democrats = array.filter(member => member.party == "D");
            this.statistics.republicans = array.filter(member => member.party == "R");
            this.statistics.independants = array.filter(member => member.party == "ID");

            this.calculandoVotos(this.statistics.democrats, this.statistics.republicans, this.miembros)
            /* console.log(this.statistics.democratsVotesWithParty)
            console.log(this.statistics.republicansVotesWithParty)
            console.log(this.statistics.totalVotesWithParty) */

          /*   this.ordenarAscendentesOdescendentes(this.) */
          this.ordenarAscendentesOdescendentes(this.miembros, "descendente", "party");
          this.ordenarAscendentesOdescendentes(this.miembros, "ascendente",  "party");
          this.ordenarAscendentesOdescendentes(this.miembros, "descendente", "engage");
          this.ordenarAscendentesOdescendentes(this.miembros, "ascendente",  "engage");

        },
        //cuando termine tengo que rehacer esta funcion
        calculandoVotos(democrats, republicans, total) {
            democrats.forEach(array => { this.statistics.democratsVotesWithParty = this.statistics.democratsVotesWithParty + array.votes_with_party_pct })
            this.statistics.democratsVotesWithParty = (this.statistics.democratsVotesWithParty / democrats.length).toFixed(2)
            republicans.forEach(array => { this.statistics.republicansVotesWithParty = this.statistics.republicansVotesWithParty + array.votes_with_party_pct })
            this.statistics.republicansVotesWithParty = (this.statistics.republicansVotesWithParty / republicans.length).toFixed(2)
            total.forEach(array => { this.statistics.totalVotesWithParty = this.statistics.totalVotesWithParty + array.votes_with_party_pct })
            this.statistics.totalVotesWithParty = (this.statistics.totalVotesWithParty / total.length).toFixed(2)
        },
        ordenarAscendentesOdescendentes(array, aOd, pOe) {
            let cantidadCortar = Math.round(array.length / 10);
            /* console.log(cantidadCortar); */
            let ordenados = array.sort(function compare(a, b) {
                let key= pOe==="party"? "votes_with_party_pct" : "missed_votes_pct"

                if(a[key]< b[key]){return aOd=="ascendente"? 1 : -1}
                if(a[key]> b[key]){return aOd=="ascendente"? -1 : 1}
                return 0;
            })
           /*  console.log(ordenados) */
            let sinRegistro = 0;
            let cortandoDatos = ordenados.slice(0, cantidadCortar)
            /* console.table(cortandoDatos) */
            cortandoDatos.forEach(member => { if (member.total_votes == 0) sinRegistro++ })
           /*  console.log(sinRegistro) */
            if (sinRegistro > 0) {
                ordenados = ordenados.slice(sinRegistro)
                cortandoDatos = ordenados.slice(0, cantidadCortar)
            }
            ordenados = ordenados.slice(cantidadCortar)
            /* console.log(ordenados) */
            let miembroExtremo = cortandoDatos[cantidadCortar - 1];
            //calculamos la cantidad de votos con sus respectivos partidos de cada uno de los miembros de el array ya ordenado y cortado
            //para despues asignarlo
            cortandoDatos.forEach(miembro =>{
                miembro.votosConParty=  Math.round(miembro.votes_with_party_pct*miembro.total_votes/100)
                })
            //ahora tenemos que tomar el dato extremo de cada tabla para poder comparar con el resto del array para poder
            //ver quienes más tienen exactamente el mismo promedio
            pOe=="engage"? (aOd=="ascendente"? this.statistics.leastEngages = cortandoDatos : this.statistics.mostEngages = cortandoDatos)
                :(aOd=="ascendente"?  this.statistics.mostLoyalt = cortandoDatos : this.statistics.lessLoyalt = cortandoDatos )
            ordenados.forEach(miembro => {
                if (miembro != miembroExtremo) {
                   if (aOd == "ascendente") {
                        if (pOe == "party") {
                            if (miembro.votes_with_party_pct == miembroExtremo.votes_with_party_pct) { this.statistics.lessLoyalt.push(miembro) }
                        }
                        else{
                            if (miembro.missed_votes_pct == miembroExtremo.missed_votes_pct) { this.statistics.leastEngages.push(miembro) }
                        }
                    }
                    else{
                        if (pOe == "party") {
                            if (miembro.votes_with_party_pct == miembroExtremo.votes_with_party_pct) { this.statistics.mostLoyalt.push(miembro) }
                        }
                        else{
                            if (miembro.missed_votes_pct == miembroExtremo.missed_votes_pct) { this.statistics.mostEngages.push(miembro) }
                        }
                    }
                }
            })
        }
    },
    computed: {
        // a computed getter
        uniqueStates() {
            let statesUnicos = [];
            this.states.forEach(element => {
                if (!statesUnicos.includes(element)) { statesUnicos.push(element) }
            })
            statesUnicos.sort();
            /*  console.log(statesUnicos) */
            return statesUnicos;
        },
        filtrarPersonajes() {
            let filtrar = [];
            if (this.selectedState == `all`) {
                filtrar = this.miembros.filter(miembro => this.checkedPartys.includes(miembro.party))
            }
            else {
                filtrar = this.miembros.filter(miembro => this.checkedPartys.includes(miembro.party) && miembro.state == this.selectedState)
            }
            return filtrar;

        }
    }
});
app.mount("#app")