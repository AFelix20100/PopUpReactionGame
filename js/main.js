document.addEventListener('DOMContentLoaded', () => {
    const startPage = document.getElementById('start-page');
    const gamePage = document.getElementById('game-page');
    const gameOverPage = document.getElementById('game-over-page');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');
    const backToStartBtnOver = document.getElementById('back-to-start-btn-over');
    const finalScore = document.getElementById('finalScore');

    var maxScoreReached = document.getElementById("maxScoreReached");
    var currentScore = document.getElementById("currentScore");
    var time = document.getElementById("time");
    var popItPanel = document.getElementById("popIt-panel");

    var score = 0;
    var countDown = 5; // Temps initial
    var interval;
    var gameSeriesCount = 0; // Compteur pour les séries de parties

    // Charger le compteur de séries et le score maximum depuis localStorage
    if (!localStorage.getItem("maxScoreReached")) {
        localStorage.setItem("maxScoreReached", 0);
    }

    maxScoreReached.textContent = localStorage.getItem("maxScoreReached");

    function createCircles() {
        popItPanel.innerHTML = '';
        
        // Tableau avec l'ordre des chiffres
        let numberOrder = [7, 8, 9, 4, 5, 6, 1, 2, 3];
        
        // Obtenir les numéros cibles aléatoires
        let targetNumbers = getRandomSubset(2, 8);

        // Créer les cercles
        for (let number of numberOrder) {
            var circle = document.createElement("div");
            circle.classList.add("circle");
            circle.classList.add(`pop-${number}`);
            circle.setAttribute("data-key", number);
            circle.innerHTML = number;
            
            // Vérifier si le cercle doit être une cible
            if (targetNumbers.includes(number)) {
                circle.classList.add("target"); // Ajouter une classe cible
            }

            popItPanel.appendChild(circle);
        }
    }

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
            // Sélectionne le cercle avec la classe pop et l'attribut data-key correspondant
            const activeCircle = document.querySelector(`.pop-${key}`);
            if (activeCircle) {
                // Vérifiez si le cercle est une cible (target)
                if (activeCircle.classList.contains('target')) {
                    activeCircle.classList.remove('target');
                    score += 100;
                    updateUI();

                    // Vérifiez s'il reste des cercles cibles
                    let lastCircles = document.getElementsByClassName('target');
                    if (lastCircles.length === 0) { 
                        gameSeriesCount++;
                        checkMaxScore();
                        resetGame();
                    }
                } else {
                    checkMaxScore();
                    showGameOverPage();
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
        } else {
            countDown = getAdjustedTime(); // Réglez le temps en fonction des séries de jeux
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

    function updateUI() {
        currentScore.textContent = `Score: ${score}`;
        time.textContent = `${countDown}s`;
    }

    function startGame() {
        createCircles();
        updateUI();
        interval = setInterval(() => {
            countDown--;
            time.textContent = countDown + "s";
            if (countDown <= 0) {
                clearInterval(interval);
                alert('Temps écoulé ! Votre score : ' + score);
                resetGame(true); // Restart the game when time is up
            }
        }, 1000);
    }

    function showGameOverPage() {
        gamePage.classList.remove('active');
        gameOverPage.classList.add('active');
        finalScore.textContent = score;
    }

    startBtn.addEventListener('click', () => {
        startPage.classList.remove('active');
        gamePage.classList.add('active');
        startGame();
    });

    restartBtn.addEventListener('click', () => {
        gameOverPage.classList.remove('active');
        startPage.classList.add('active');
    });

    backToStartBtn.addEventListener('click', () => {
        gamePage.classList.remove('active');
        startPage.classList.add('active');
    });

    backToStartBtnOver.addEventListener('click', () => {
        gameOverPage.classList.remove('active');
        startPage.classList.add('active');
    });

    document.addEventListener('keydown', handleKeyPress);

    // Initialisez la page de démarrage
    startPage.classList.add('active');
});
