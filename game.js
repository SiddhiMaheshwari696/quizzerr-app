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

fetch(
    "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple"
)
    .then(res => {
        return res.json();
    })
    .then(loadedQuestions => {
        console.log(loadedQuestions);
        questions = loadedQuestions.results.map(loadedQuestions => {
            const formattedQuestion = {
                question: loadedQuestions.question
            };  

            const answerChoices = [...loadedQuestions.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            answerChoices.splice(formattedQuestion.answer - 1, 0, loadedQuestions.correct_answer);
            
            
            answerChoices.forEach((choice, index) =>{
                formattedQuestion["choice" + (index+1)] = choice;
            })

            return formattedQuestion;
        });
        startGame();
    })
    .catch(err => {
        console.error(err);
    });

//CONSTANTS
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    console.log(availableQuestions);
    getNewQuestions();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

const getNewQuestions = () => {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        //Fill the bar coompletely before leaving
        progressBarFull.style.width = "100%";

        //small delay so user can see full bar
        setTimeout(() => {
             // Quiz over, redirect to results page
        window.location.assign("end.html"); // correct usage
        }, 800);
        return;
       
    }
    
    //Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuestions.splice(questionIndex, 1);

    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if(!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer =  selectedChoice.dataset["number"];

        const classToApply = 
            selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

            if(classToApply === 'correct') {
                incrementScore(CORRECT_BONUS);
            }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout( () => {
             selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestions();
        }, 1000);
 
    });
});

incrementScore = num => {
    score += num;
    scoreText.innerText = score;
}