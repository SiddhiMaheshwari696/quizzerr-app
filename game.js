const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const game = document.getElementById("game");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

// CONSTANTS
const CORRECT_BONUS = 10;   // 10 points per correct answer
const MAX_QUESTIONS = 3;   // total questions per quiz

// FETCH QUESTIONS
fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple")
    .then(res => res.json())
    .then(data => {
        questions = data.results.map(q => {
            const formattedQuestion = {
                question: q.question
            };

            const answerChoices = [...q.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;

            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                q.correct_answer
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion["choice" + (index + 1)] = choice;
            });

            return formattedQuestion;
        });

        startGame();
    })
    .catch(err => console.error(err));

// START GAME
const startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    scoreText.innerText = score;

    getNewQuestion();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

// GET NEW QUESTION
const getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem("mostRecentScore", score);

        progressBarFull.style.width = "100%";

        setTimeout(() => {
            window.location.assign("end.html");
        }, 800);

        return;
    }

    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset["number"];
        choice.innerText = currentQuestion["choice" + number];
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

// ANSWER CLICK HANDLING
choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply =
            selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

        if (classToApply === "correct") {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});

// SCORE CALCULATOR
const incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};
