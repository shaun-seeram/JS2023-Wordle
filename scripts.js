let game;
const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];

class Wordle {
    constructor(word) {
        this.word = word;
        this.wordArr = [...word];
        this.guess = [];
        // this.guessed = [];
        this.round = 1;
        this.letter = 1;
        this.status = "playing"
    }

    guessLetter(letter) {
        if (this.guess.length < 5) {
            this.guess.push(letter);
            document.querySelector(`.word${this.round} .letter${this.letter}`).textContent = letter;
            if (this.letter !== 5) {
                this.letter++;
            }
        }
    }

    async submitWord() {
        if (this.guess.join("") === this.word) {
            document.querySelectorAll(`.word${this.round} .letterContainer`).forEach((block) => block.classList.add("green"));
            this.status = "win";
        } else if (this.guess.length === 5) {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.guess.join("")}`);
    
            if (res.status === 200) {
                document.querySelectorAll(`.word${this.round} .letterContainer`).forEach((block, i) => {
                    if (this.guess[i] === this.wordArr[i]) {
                        block.classList.add("green");
                    } else if (this.wordArr.includes(this.guess[i])) {
                        block.classList.add("yellow");
                    } else {
                        block.classList.add("red")
                    }
                });
                this.round++;
                this.letter = 1;
                this.guess = [];
                if (this.round === 7) {
                    this.status = "lose";
                }
            } else {
                document.querySelectorAll(`.word${this.round} .letterContainer`).forEach((block) => block.classList.add("red"));
            }    
        }
    }
}

const getWord = async () => {
    const res = await fetch("https://random-word-api.vercel.app/api?words=1&length=5");
    if (res.status !== 200) {
        throw new Error("Could not fetch word");
    }
    const word = await res.json();
    return word;
}

const setUI = () => {
    for (let i = 1; i <= 6; i++) {
        const wordContainer = document.createElement("div");
        wordContainer.classList.add("wordContainer", `word${i}`);

        for (let j = 1; j <= 5; j++) {
            const letterContainer = document.createElement("div");
            letterContainer.classList.add("letterContainer", `letter${j}`);
            wordContainer.appendChild(letterContainer);
        }

        document.querySelector(".gameContainer").appendChild(wordContainer);
    }
}

const newGame = async () => { 
    const word = await getWord();
    game = new Wordle(word[0]);
    setUI();
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        game.submitWord();
    }

    if (e.key === "Backspace") {
        document.querySelector(`.word${game.round} .letter${game.letter}`).textContent = "";
        game.guess.pop();
        if (game.letter > 1) {
            game.letter--;
        }

        // Issues deleting when not full word, due to increasing letter count after guess...
    }

    if (game.status === "playing" && alphabet.includes(e.key.toLowerCase())) {
        game.guessLetter(e.key.toLowerCase());
    }
})

newGame();