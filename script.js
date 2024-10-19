let currentQuiz = '';
let currentQuestionIndex = 0;
let score = 0;
let attempts = 0;
const totalAttempts = 4; // Maximum attempts for TRAT

// Handle login and redirect
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const quizName = document.getElementById('quizSelect').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Selected quiz name:', quizName); // Debug line
    // Validate credentials
    validateCredentials(quizName, username, password);
});

// Validate credentials
function validateCredentials(quizName, username, password) {
    fetch('credentials.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').slice(1);
            const isValid = lines.some(line => {
                const [quiz, user, pass] = line.split(',');
                return quiz === quizName && user === username && pass === password;
            });
            if (isValid) {
                currentQuiz = quizName;

                // Redirect based on the quiz name
                if (quizName.toLowerCase().includes("trat")) {
                    window.location.href = 'trat.html'; // Redirect to TRAT page
                } else if (quizName.toLowerCase().includes("irat")) {
                    window.location.href = 'irat.html'; // Redirect to IRAT page
                } else {
                    alert('Unknown quiz type!');
                }
            } else {
                alert('Invalid credentials!');
            }
        });
}


// Load quizzes from credentials.csv
fetch('https://raw.githubusercontent.com/sredula2/quiz-app/refs/heads/main/credentials.csv')
    .then(response => response.text())
    .then(data => {
        console.log(data); // Add this line to see the output        
        const lines = data.split('\n').slice(1);
        const quizSelect = document.getElementById('quizSelect');
        lines.forEach(line => {
            const [quizName] = line.split(',');
            if (quizName) {
                const option = document.createElement('option');
                option.value = quizName;
                option.textContent = quizName;
                quizSelect.appendChild(option);
            }
        });
    });

// Handle login and redirect
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const quizName = document.getElementById('quizSelect').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    validateCredentials(quizName, username, password);
});

// Validate credentials
function validateCredentials(quizName, username, password) {
    fetch('credentials.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').slice(1);
            const isValid = lines.some(line => {
                const [quiz, user, pass] = line.split(',');
                return quiz === quizName && user === username && pass === password;
            });
            if (isValid) {
                currentQuiz = quizName;
                window.location.href = 'irat.html'; // Redirect to IRAT page
            } else {
                alert('Invalid credentials!');
            }
        });
}

// Load questions for IRAT or TRAT
function loadQuestions(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').slice(1);
            const questions = lines.map(line => {
                const parts = line.split(',');
                return {
                    quizName: parts[0],
                    number: parts[1],
                    question: parts[2],
                    choices: [parts[3], parts[4], parts[5], parts[6]],
                    answer: parts[8], // Updated to the correct index for the answer
                };
            }).filter(q => q.quizName === currentQuiz);
            callback(questions);
        });
}

// Setup IRAT
function setupIrat(questions) {
    displayQuestion(questions[currentQuestionIndex]);
    document.getElementById('nextButton').addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion(questions[currentQuestionIndex]);
        } else {
            alert('IRAT completed!');
            // Redirect or show results
        }
    });
}

function displayQuestion(question) {
    const container = document.getElementById('questionContainer');
    container.innerHTML = `
        <h2>${question.question}</h2>
        ${question.choices.map((choice, index) => `<button onclick="checkIratAnswer('${question.answer}', '${choice}')">${choice}</button>`).join('')}
    `;
}

function checkIratAnswer(correctAnswer, selectedAnswer) {
    if (selectedAnswer === correctAnswer) {
        alert('Correct!');
    } else {
        alert('Wrong answer. Try again!');
    }
}

// Setup TRAT
function setupTrat(questions) {
    displayTratQuestion(questions[currentQuestionIndex]);
    document.getElementById('nextButton').addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayTratQuestion(questions[currentQuestionIndex]);
        } else {
            alert(`TRAT completed! Your score: ${score}`);
            // Redirect or show results
        }
    });
}

function displayTratQuestion(question) {
    const container = document.getElementById('questionContainer');
    container.innerHTML = `
        <h2>${question.question}</h2>
        ${question.choices.map((choice, index) => `<button onclick="checkTratAnswer('${question.answer}', '${choice}', ${index})">${choice}</button>`).join('')}
    `;
    attempts = 0; // Reset attempts for new question
}

function checkTratAnswer(correctAnswer, selectedAnswer, index) {
    if (attempts < totalAttempts) {
        attempts++;
        if (selectedAnswer === correctAnswer) {
            const points = 1 / attempts;
            score += points;
            document.getElementById('scoreDisplay').textContent = `Score: ${score.toFixed(2)}`;
            alert('Correct!');
        } else {
            alert('Wrong answer. Try again!');
        }
    } else {
        alert(`Out of attempts! Correct answer was: ${correctAnswer}`);
    }
}

// Initialize IRAT or TRAT based on the current page
if (document.title === 'IRAT') {
    loadQuestions('questions.csv', setupIrat);
} else if (document.title === 'TRAT') {
    loadQuestions('questions.csv', setupTrat);
}
