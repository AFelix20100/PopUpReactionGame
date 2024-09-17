var maxScoreReached = document.getElementById("game-maxScoreReached");
var currentScore = document.getElementById("game-currentScore");
var time = document.getElementById("game-time");
var popItPanel = document.getElementById("game-popIt-panel");

var score = 0;
var countDown = 5; // Temps initial
var interval;
var gameSeriesCount = 0; // Compteur pour les séries de parties

var clickSound = new Audio("../music/sfx/click/click.mp3");
clickSound.volume = 1;

var series = new Audio("../music/sfx/win/win.mp3");
series.volume = 1;

// Charger le compteur de séries et le score maximum depuis localStorage
// if (!local.getItem("gameSeriesCount")) {
//     localStorage.setItem("gameSeriesCount", 0);
// } else {
//     gameSeriesCount = parseInt(localStorage.getItem("gameSeriesCount"));
// }

if (!localStorage.getItem("maxScoreReached")) {
    localStorage.setItem("maxScoreReached", 0);
}

maxScoreReached.textContent = localStorage.getItem("maxScoreReached");

/**
 * Fonction pour créer les cercles avec des cercles à cliquer.
 */
function createCircles() {
    popItPanel.innerHTML = '';
    
    // Tableau avec l'ordre des chiffres
    let numberOrder = [7, 8, 9, 4, 5, 6, 1, 2, 3];
    
    // Obtenir les numéros cibles aléatoires
    let targetNumbers = getRandomSubset(2, 8);

    // Créer les cercles
    for (let index = 0; index < numberOrder.length; index++) {
        const number = numberOrder[index];
        var circle = document.createElement("div");
        circle.classList.add("game-circle");
        circle.classList.add(`game-pop-${number}`);
        circle.setAttribute("data-key", number);
        circle.innerHTML = number;
        
        // Vérifier si le cercle doit être une cible
        if (targetNumbers.includes(number)) {
            circle.classList.add("game-target"); // Ajouter une classe cible
        }

        popItPanel.appendChild(circle);
    }
}

/**
 * Fonction pour générer des nombres aléatoires.
 * @param {*} minCount 
 * @param {*} maxCount 
 * @returns un tableau de nombre.
 */
function getRandomSubset(minCount, maxCount) {
    // Tableau des nombres possibles
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    // Vérification pour s'assurer que le minimum demandé ne dépasse pas le nombre total de chiffres
    if (minCount > numbers.length) {
        console.error("Le nombre minimum dépasse le nombre total d'éléments disponibles.");
        return [];
    }
    
    // Nombre d'éléments à sélectionner, entre minCount et maxCount
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    
    // Fonction pour mélanger un tableau (Fisher-Yates Shuffle)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Mélanger les nombres
    shuffle(numbers);
    
    // Sélectionner les premiers 'count' éléments du tableau mélangé
    return numbers.slice(0, count);
}

function handleKeyPress(e) {
    const key = parseInt(e.key);

    // Vérifiez si la touche est entre 1 et 9
    if (key >= 1 && key <= 9) {
        clickSound.play();

        // Sélectionne le cercle avec la classe pop et l'attribut data-key correspondant
        const activeCircle = document.querySelector(`.game-pop-${key}`);
        // Vérifiez si un cercle a été trouvé
        if (activeCircle) {
            // Vérifiez si le cercle est une cible (target)
            if (activeCircle.classList.contains('game-target')) {
                // Retirer la classe 'target' après 200ms
                activeCircle.classList.remove('game-target');

                // Incrémenter le score
                score += 100;
                if(score % 10 === 0) {
                    series.play();

                }
                // Mettre à jour l'interface utilisateur
                updateUI();

                // Vérifiez s'il reste des cercles cibles
                let lastCircles = document.getElementsByClassName('game-target');
                if (lastCircles.length === 0) { 
                    gameSeriesCount++;
                    checkMaxScore();
                    resetGame();
                }
            } else {
                // Le joueur a cliqué sur le mauvais cercle, il a perdu
                alert('Game Over! You clicked the wrong circle.');
                checkMaxScore();
                // window.location.href = "lost.html";
                endgame();
                resetGame(true); // Pass the flag to indicate a loss
            }
        }
    }
}

function checkMaxScore() {
    const currentMaxScore = parseInt(localStorage.getItem("maxScoreReached"));
    if (score > currentMaxScore) {
        localStorage.setItem("maxScoreReached", score);
        maxScoreReached.textContent = score;
    }
}

function resetGame(isLoss = false) {
    if (isLoss) {
        score = 0;
        countDown = 5;
    }else{
        countDown = getAdjustedTime(isLoss); // Réglez le temps en fonction des séries de jeux
    }
    console.log("countDown: " + countDown);
    updateUI();
    clearInterval(interval); // Clear the previous interval if it exists
    startGame();
}

function getAdjustedTime() {
    // Ajuste le temps basé sur le nombre de séries jouées
    const seriesThreshold = 5;
    const reductionInterval = 1000; // Réduction en millisecondes par série

    // Nombre de séries de 5 parties jouées
    const seriesCompleted = Math.floor(gameSeriesCount / seriesThreshold);
    // Réduit le temps pour chaque série
    const newTime = Math.max(2, 5 - (seriesCompleted * reductionInterval / 1000));
    return newTime;
}

// Fonction pour mettre à jour l'interface utilisateur
function updateUI() {
    currentScore.textContent = `Score: ${score}`;
    time.textContent = `${countDown}s`;
}

// Démarre le jeu avec le compte à rebours initial
function startGame() {
    createCircles();
    updateUI();
    interval = setInterval(() => {
        countDown--;
        time.textContent = countDown + "s";
        if (countDown <= 0) {
            clearInterval(interval);
            alert('Temps écoulé ! Votre score : ' + score);
            window.location.href = "lost.html";
        }
    }, 1000);
}

document.addEventListener('keydown', handleKeyPress);

// Initialisez le jeu
startGame();
