import { worldCupTeams, setGroups, groupsName, playOffTeams } from './teams.js';
import WorldCupGroupStage from './classes/PointsBasedLeague.js';
// import WorldCupPlayOffs, {ROUND_OF_16, QUARTER_FINAL, SEMI_FINAL, FINAL} from './classes/WorldCupPlayOffs.js';
import WorldCupPlayOffs from './classes/WorldCupPlayOffs.js';


const dev = true;
console.clear();

if (dev) {
    // Shuffle teams for a new run
    worldCupTeams.sort ((a,b) => 0.5 - Math.random());

    // Set 8 groups of 4 teams each
    const config = { rounds: 1 };
    const groups = [];
    setGroups(worldCupTeams, 8, 4).forEach((group, index) => {
        groups.push(new WorldCupGroupStage('Grupo '+groupsName[index], group, config));
    })

    groups.forEach((group, index) => { 
        group.scheduleMatchDays();

        // TODO: Parar aquí para mostrar el calendario??

        group.start();
        // mostrar por pantalla los resultados de cada jornada y la clasificación
        let i = 1;
        group.summaries.forEach(summary => {
            console.log(`GRUPO ${groupsName[index]} - RESUMEN JORNADA ${i}`);
            summary.results.forEach(result => {
                console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam}`);
            })
            console.table(summary.standings.map(team => {
                return {
                    Team: team.name,
                    Points: team.points,
                    PlayedMatches: team.matchesWon + team.matchesDrawn + team.matchesLost,
                    Won: team.matchesWon,
                    Drawn: team.matchesDrawn,
                    Lost: team.matchesLost,
                    GoalsFor: team.goalsFor,
                    GoalsAgainst: team.goalsAgainst,
                    GoalsDiff: team.goalsFor - team.goalsAgainst
                }
            }))
            i++;
        })

        // Mostramos el total de goles y el total de puntos
        const initialAccumulator = { totalGoals: 0, totalPoints: 0 }
        const totals = group.teams.reduce(function(accumulator, team) {
            accumulator.totalGoals += team.goalsFor
            accumulator.totalPoints += team.points
            return accumulator
        }, initialAccumulator)

        console.log('TOTALS', totals)
        console.log('---------------')
    })

    //TODO: Implementar el código para extraer los dos mejores equipos de cada grupo. 
    // Ahora mismo estos equipos están hardcodeados

    // --- PLAYOFFS ---
    console.log('===============================================');
    console.log('==== COMIENZO DE LA FASE DE ELIMINATORIAS =====');

    const worldCupPlayOffs = new WorldCupPlayOffs('World Cup PlayOffs', playOffTeams);
    const playOffs = worldCupPlayOffs.getPlayOffRoundsInfo();
    let winners = worldCupPlayOffs.teams;

    for (let playOff of playOffs) {
        let currentRoundDraw;
        currentRoundDraw = worldCupPlayOffs.RoundDraw(winners, playOff.numberOfTeams);

        console.log('===============================================');
        console.log(`===== ${playOff.name} =====`);
        console.log('===============================================');

        winners = worldCupPlayOffs.playRound(currentRoundDraw);
        if (winners.length === 1){
            console.log(`===== WORLD CUP CHAMPION ---> ${winners.map(team => team.toUpperCase())} ======`);
            console.log('===============================================');
        }
    }

}









