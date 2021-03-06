Array.prototype.shuffle = function()
// desordena los elementos de un array de forma aleatoria.
/* IMPLEMENTACIÖN FUNCIONAL
    * TB Se podría hacer funcionalmente, así: 
    array.sort(function (a,b) {return 0.5 - Math.random()})
    o lo que es lo mismo:
    array.sort ((a,b) => 0.5 - Math.random())
*/
{
	var i = this.length;
	while (i)
	{
		var j = Math.floor(Math.random() * i);
		var t = this[--i];
		this[i] = this[j];
		this[j] = t;
	}
	return this;
}

export const LOCAL_TEAM = 0
export const AWAY_TEAM = 1

export default class League {

    constructor(name, teams=[], config={}) {
        this.name = name
        this.matchDaySchedule = []
        this.setup(config)
        this.setupTeams(teams)
        this.summaries = []
    }

    setup(config) {
        const defaultConfig = { rounds: 1, eresPatriota: true }
        this.config = Object.assign(defaultConfig, config)
    }

    setupTeams(teamNames) {
        this.teams = []
        for (const teamName of teamNames) {
            const team = this.customizeTeam(teamName)
            this.teams.push(team)
        }
        this.teams.shuffle()
    }

    customizeTeam(teamName) {
        return {
            name: teamName,
            matchesWon: 0,
            matchesDrawn: 0,
            matchesLost: 0
        }
    }

    initSchedule(round) {
        const numberOfMatchDays = this.teams.length - 1
        const numberOfMatchesPerMatchDay = this.teams.length / 2
        for (let i = 0; i < numberOfMatchDays; i++) {
            const matchDay = []  // jornada vacía
            for (let j = 0; j < numberOfMatchesPerMatchDay; j++) {
                const match = ['Equipo local', 'Equipo visitante']  // partido
                matchDay.push(match)
            }
            // una vez añadidos todos los partidos a la jornada
            round.push(matchDay)  // añadimos la jornada a la planificación
        }
    }

    getTeamNames() {
        return this.teams.map(team => team.name)
    }
    
    getTeamNamesForSchedule() {
        const teamNames = this.getTeamNames()
        if (teamNames.length % 2 == 0) { // son pares
            return teamNames
        } else {
            return [...teamNames, null]
        }
    }

    setLocalTeams(round) {
        const teamNames = this.getTeamNamesForSchedule()
        const maxHomeTeams = teamNames.length - 2
        let teamIndex = 0
        round.forEach(matchDay => { // por cada jornada
            matchDay.forEach(match => { // por cada partido de cada jornada establecer el equipo local
                match[LOCAL_TEAM] = teamNames[teamIndex]
                teamIndex++
                if (teamIndex > maxHomeTeams) {
                    teamIndex = 0
                }
            })
        })
        /* Este código sería el equivalente al superior usando bucles clásicos
        for (let i = 0; i < this.matchDaySchedule.length; i++) {
            const matchDay = this.matchDaySchedule[i]
            for (let j = 0; j < matchDay.length; j++) {
                const match = matchDay[j]
                // establecer equipo local
            }
        }
        */
    }

    setAwayTeams(round) {
        const teamNames = this.getTeamNamesForSchedule()
        const maxAwayTeams = teamNames.length - 2
        let teamIndex = maxAwayTeams
        round.forEach(matchDay => {
            let firstMatchFound = false
            matchDay.forEach(match => {
                if (!firstMatchFound) {
                    firstMatchFound = true
                } else {
                    match[AWAY_TEAM] = teamNames[teamIndex]
                    teamIndex--
                    if (teamIndex < 0) {
                        teamIndex = maxAwayTeams
                    }
                }
            })
        })
    }

    fixLastTeamSchedule(round) {
        let matchDayNumber = 1
        const teamNames = this.getTeamNamesForSchedule()
        const lastTeamName = teamNames[teamNames.length - 1]
        round.forEach(matchDay => {
            const firstMatch = matchDay[0]
            if (matchDayNumber % 2 == 0) { // si jornada par -> juega en casa
                firstMatch[AWAY_TEAM] = firstMatch[LOCAL_TEAM]
                firstMatch[LOCAL_TEAM] = lastTeamName
            } else { // jornada impar -> juega fuera
                firstMatch[AWAY_TEAM] = lastTeamName
            }
            matchDayNumber++
        })
    }

    scheduleMatchDays() {
        for (let i = 0; i < this.config.rounds; i++) {
            const newRound = this.createRound()
            // si la jornada es par, invertir partidos
            if (i % 2 != 0) {
                for (const matchDay of newRound) {
                    for (const match of matchDay) {
                        const localTEam = match[LOCAL_TEAM]
                        match[LOCAL_TEAM] = match[AWAY_TEAM]
                        match[AWAY_TEAM] = localTEam
                    }
                }
            }
            this.matchDaySchedule = this.matchDaySchedule.concat(newRound)
        }
    }

    createRound() {
        // https://es.wikipedia.org/wiki/Sistema_de_todos_contra_todos
        const newRound = []
        this.initSchedule(newRound)
        this.setLocalTeams(newRound)
        this.setAwayTeams(newRound)
        this.fixLastTeamSchedule(newRound)
        return newRound
    }

    //FIXME: No tiene en cuenta config.round
    scheduleMatchDays2() {
        const newRound = this.createRound()
        const i = 1
        this.matchDaySchedule = this.matchDaySchedule.concat(newRound)
        const secondRound = this.matchDaySchedule.map(matchDay => {
            return matchDay.map(match => {
                const newMatch = [...match]
                if (i % 2 != 0) {
                    const localTEam = newMatch[LOCAL_TEAM]
                    newMatch[LOCAL_TEAM] = newMatch[AWAY_TEAM]
                    newMatch[AWAY_TEAM] = localTEam
                }
                return newMatch
            })
        })
        this.matchDaySchedule = this.matchDaySchedule.concat(secondRound)
    }

    start() {
        for (const matchDay of this.matchDaySchedule) {
            const matchDaySummary = {
                results: [],
                standings: undefined
            }
            for (const match of matchDay) {
                const result = this.play(match)
                this.updateTeams(result)  // actualizamos los equipos con el resultado de partido
                matchDaySummary.results.push(result)
            }
            // Calcular clasificación
            this.getStandings();
            matchDaySummary.standings = this.teams.map(team => Object.assign({}, team))
            // Guardar resumen de la jornada
            this.summaries.push(matchDaySummary);
        }
    }

    getStandings() {
        throw new Error('getStandings not implemented')
    }

    updateTeams(result) {
        throw new Error('updateTeams method not implemented')
    }

    play(match) {
        throw new Error('play method not implented')
    }

    generateGoals() {
        return Math.round(Math.random() * 10)
    }

    getTeamForName() {
        throw new Error('getTeamForName not implemented')
    }

    diffGoalsAndAlphabeticCriteria() {
        throw new Error('diffGoalsAndAlphabeticCriteria not implemented')
    }

    getDirectGame() {
        throw new Error('getDirectGame not implemented')
    }

    getQualifiedTeams() {
        throw new Error('getQualifiedTeams not implemented')
    }

    getPlayOffRoundsInfo() {
        throw new Error('getPlayOffRoundsInfo not implemented')
    }

    roundDraw() {
        throw new Error('roundDraw not implemented')
    }

    playRound() {
        throw new Error('playRound not implemented')
    }

    tercerYcuartoPuesto() {
        throw new Error('tercerYcuartoPuesto not implemented')
    }

    spainWins(match, homeGoals, awayGoals){
        return (match[LOCAL_TEAM] === 'Spain') && (homeGoals > awayGoals)
            || (match[AWAY_TEAM] === 'Spain') && (homeGoals < awayGoals)
    }
}

