let game;
let streak = localStorage.getItem("wordleScore") ?? 0;
const streakContainer = document.querySelector("#streak");
const revealContainer = document.querySelector("#wordReveal");
const gameContainer = document.querySelector(".gameContainer");
const keys = document.querySelectorAll(".key");
const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];

class Wordle {
    constructor(word) {
        this.word = word;
        this.wordArr = [...word];
        this.guess = [];
        this.round = 1;
        this.letter = 1;
        this.status = "playing"
    }

    guessLetter(letter) {
        if (this.guess.length < 5) {
            this.guess.push(letter);
            document.querySelector(`.word${this.round} .letter${this.letter}`).textContent = letter;
            this.letter++;
        }
    }

    async submitWord() {
        if (this.guess.join("") === this.word) {
            document.querySelectorAll(`.word${this.round} .letterContainer`).forEach((block) => block.classList.add("green"));
            this.guess.forEach((letter) => {
                document.querySelector(`button[data-key="${letter}"]`).classList.add("green");
            })
            streak++;
            updateStreak();
            this.status = "win";
        } else if (this.guess.length === 5) {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.guess.join("")}`);
    
            if (res.status === 200) {
                document.querySelectorAll(`.word${this.round} .letterContainer`).forEach((block, i) => {
                    if (this.guess[i] === this.wordArr[i]) {
                        block.classList.add("green");
                        document.querySelector(`button[data-key="${this.guess[i]}"]`).classList.add("green");
                    } else if (this.wordArr.includes(this.guess[i])) {
                        block.classList.add("yellow");
                        document.querySelector(`button[data-key="${this.guess[i]}"]`).classList.add("yellow");
                    } else {
                        block.classList.add("gray")
                        document.querySelector(`button[data-key="${this.guess[i]}"]`).classList.add("gray");
                    }
                });
                this.round++;
                this.letter = 1;
                this.guess = [];
                if (this.round === 7) {
                    this.status = "lose";
                    streak = 0;
                    updateStreak();
                    revealWord();
                }
            } else {
                document.querySelectorAll(`.word${this.round} .letterContainer`).forEach((block) => block.classList.add("red"));
            }    
        }
    }
}


// UI
const setUI = () => {
    updateStreak();
    revealContainer.textContent = "";
    revealContainer.classList.remove("visible");
    keys.forEach(key => key.classList.remove("red", "green", "yellow", "gray"));
    gameContainer.innerHTML = "";

    for (let i = 1; i <= 6; i++) {
        const wordContainer = document.createElement("div");
        wordContainer.classList.add("wordContainer", `word${i}`);

        for (let j = 1; j <= 5; j++) {
            const letterContainer = document.createElement("div");
            letterContainer.classList.add("letterContainer", `letter${j}`);
            wordContainer.appendChild(letterContainer);
        }

        gameContainer.appendChild(wordContainer);
    }
}

const updateStreak = () => {
    localStorage.setItem("wordleScore", streak);
    streakContainer.textContent = streak;
}

const revealWord = () => {
    revealContainer.textContent = game.word.toUpperCase();
    revealContainer.classList.add("visible");
}

// Event Listeners
document.querySelector("#newGame").addEventListener("click", () => newGame());

document.addEventListener("keydown", (e) => {
    if (game.status === "playing" && e.key === "Enter") {
        game.submitWord();
    } else if (game.status === "playing" && e.key === "Backspace") {
        document.querySelector(`.word${game.round} .letter${game.letter !== 1 ? game.letter - 1 : game.letter}`).textContent = "";
        game.guess.pop();

        if (game.letter === 6) {
            document.querySelectorAll(`.word${game.round} .letterContainer`).forEach((block) => block.classList.remove("red"));
        }
        if (game.letter > 1) {
            game.letter--;
        }
    } else if (game.status === "playing" && alphabet.includes(e.key.toLowerCase())) {
        game.guessLetter(e.key.toLowerCase());
    }
})

keys.forEach((key) => {
    key.addEventListener("click", _ => {
        switch (key.dataset.key) {
            case "delete":
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Backspace'}));
                break;
            case "enter":
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
                break;
            default:
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': key.dataset.key}));
                break;
        }
    })
})


// Initiate Game
const newGame = async () => { 
    const res = await fetch("https://random-word-api.vercel.app/api?words=1&length=5");
    if (res.status !== 200) {
        throw new Error("Could not fetch word");
    }
    const word = await res.json();
    game = new Wordle(word[0]);
    setUI();
}

newGame();