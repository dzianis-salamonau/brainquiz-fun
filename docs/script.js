// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const categoryBtns = document.querySelectorAll('.category-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const questionElement = document.getElementById('question');
const answersContainer = document.getElementById('answers');
const progressBar = document.getElementById('progress-bar');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const correctAnswersElement = document.getElementById('correct-answers');
const totalQuestionsElement = document.getElementById('total-questions');
const playAgainBtn = document.getElementById('play-again-btn');
const shareBtn = document.getElementById('share-btn');

// Game Variables
let currentQuestion = 0;
let score = 0;
let selectedCategory = 'general';
let correctAnswers = 0;
let questions = [];
let difficulty = 'medium'; // Default difficulty

// API Category mapping
const apiCategories = {
    'general': 9,    // General Knowledge
    'science': 17,   // Science & Nature
    'history': 23,   // History
    'geography': 22  // Geography
};

// Event Listeners
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', restartGame);
shareBtn.addEventListener('click', shareScore);

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedCategory = btn.dataset.category;
    });
});

// Add event listeners for difficulty buttons
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        difficulty = btn.dataset.difficulty;
    });
});

// Initialize the first category as selected
categoryBtns[0].classList.add('selected');

// Questions Database
const questionsDB = {
    general: [
        {
            question: "What is the capital of France?",
            answers: ["Berlin", "London", "Paris", "Madrid"],
            correct: 2
        },
        {
            question: "Which planet is known as the Red Planet?",
            answers: ["Earth", "Mars", "Jupiter", "Venus"],
            correct: 1
        },
        {
            question: "Who painted the Mona Lisa?",
            answers: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
            correct: 2
        },
        {
            question: "What is the largest ocean on Earth?",
            answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
            correct: 3
        },
        {
            question: "How many sides does a hexagon have?",
            answers: ["5", "6", "7", "8"],
            correct: 1
        }
    ],
    science: [
        {
            question: "What is the chemical symbol for gold?",
            answers: ["Go", "Gd", "Au", "Ag"],
            correct: 2
        },
        {
            question: "What is the closest star to Earth?",
            answers: ["Proxima Centauri", "The Sun", "Polaris", "Alpha Centauri"],
            correct: 1
        },
        {
            question: "Which of these is NOT a primary color of light?",
            answers: ["Red", "Green", "Blue", "Yellow"],
            correct: 3
        },
        {
            question: "What part of the plant conducts photosynthesis?",
            answers: ["Roots", "Stem", "Leaves", "Flowers"],
            correct: 2
        },
        {
            question: "What is the hardest natural substance on Earth?",
            answers: ["Gold", "Iron", "Diamond", "Platinum"],
            correct: 2
        }
    ],
    history: [
        {
            question: "In which year did World War II end?",
            answers: ["1943", "1945", "1947", "1950"],
            correct: 1
        },
        {
            question: "Who was the first President of the United States?",
            answers: ["Thomas Jefferson", "John Adams", "George Washington", "Abraham Lincoln"],
            correct: 2
        },
        {
            question: "Which ancient civilization built the Machu Picchu?",
            answers: ["Incas", "Aztecs", "Mayans", "Romans"],
            correct: 0
        },
        {
            question: "In which year did the Berlin Wall fall?",
            answers: ["1987", "1989", "1991", "1993"],
            correct: 1
        },
        {
            question: "Which famous speech included the line 'I have a dream'?",
            answers: ["Gettysburg Address", "John F. Kennedy's Inaugural Address", "Martin Luther King Jr.'s speech", "Winston Churchill's 'We Shall Fight on the Beaches'"],
            correct: 2
        }
    ],
    geography: [
        {
            question: "Which is the largest continent by land area?",
            answers: ["North America", "Africa", "Europe", "Asia"],
            correct: 3
        },
        {
            question: "Which is the longest river in the world?",
            answers: ["Amazon", "Nile", "Mississippi", "Yangtze"],
            correct: 1
        },
        {
            question: "Which country has the largest population?",
            answers: ["India", "United States", "China", "Russia"],
            correct: 2
        },
        {
            question: "What is the capital of Australia?",
            answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
            correct: 2
        },
        {
            question: "Which desert is the largest in the world?",
            answers: ["Gobi", "Kalahari", "Sahara", "Antarctic"],
            correct: 3
        }
    ]
};

// Functions to fetch questions from API
async function fetchQuestionsFromAPI(amount = 5) {
    const categoryId = apiCategories[selectedCategory];
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.response_code === 0) {
            // Process the API response properly
            return data.results.map(q => {
                // Create an array with all answers
                const allAnswers = [...q.incorrect_answers.map(a => decodeHTML(a))];
                // Add the correct answer
                const correctAnswer = decodeHTML(q.correct_answer);
                allAnswers.push(correctAnswer);
                
                // Shuffle the answers
                const shuffledAnswers = shuffleArray(allAnswers);
                
                // Find where the correct answer is now
                const correctIndex = shuffledAnswers.indexOf(correctAnswer);
                
                return {
                    question: decodeHTML(q.question),
                    answers: shuffledAnswers,
                    correct: correctIndex
                };
            });
        } else {
            throw new Error('Failed to load questions');
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to local questions if API fails
        return questionsDB[selectedCategory];
    }
}

// Helper function to decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Helper function to shuffle array
function shuffleArray(array) {
    // Create a copy of the array to shuffle
    const shuffled = [...array];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

async function startGame() {
    // Reset game variables
    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    
    // Show loading state
    welcomeScreen.classList.remove('active');
    quizScreen.classList.add('active');
    questionElement.textContent = "Loading questions...";
    answersContainer.innerHTML = '<div class="loading">Please wait...</div>';
    
    try {
        // Get questions from API
        questions = await fetchQuestionsFromAPI(10); // Fetch 10 questions
        
        // If no questions from API, fallback to local questions
        if (!questions || questions.length === 0) {
            questions = questionsDB[selectedCategory];
        }
        
        // Update total questions in the result screen
        totalQuestionsElement.textContent = questions.length;
        
        // Track game start
        trackGameStart();
        
        // Load first question
        loadQuestion();
    } catch (error) {
        console.error('Error starting game:', error);
        // Fallback to local questions
        questions = questionsDB[selectedCategory];
        totalQuestionsElement.textContent = questions.length;
        loadQuestion();
    }
}

function loadQuestion() {
    const question = questions[currentQuestion];
    questionElement.textContent = question.question;
    
    // Clear previous answers
    answersContainer.innerHTML = '';
    
    // Create answer buttons
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.classList.add('answer-btn');
        button.textContent = answer;
        button.dataset.index = index;
        
        button.addEventListener('click', () => selectAnswer(index));
        
        answersContainer.appendChild(button);
    });
    
    // Update progress bar
    const progressPercentage = (currentQuestion / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function selectAnswer(answerIndex) {
    const question = questions[currentQuestion];
    const answerButtons = document.querySelectorAll('.answer-btn');
    
    // Disable all answer buttons after selection
    answerButtons.forEach(btn => {
        btn.disabled = true;
        
        // Highlight correct answer
        if (parseInt(btn.dataset.index) === question.correct) {
            btn.classList.add('correct');
        }
    });
    
    // Check if answer is correct
    if (answerIndex === question.correct) {
        score += 10;
        correctAnswers++;
        scoreElement.textContent = score;
    } else {
        // Highlight selected wrong answer
        answerButtons[answerIndex].classList.add('incorrect');
    }
    
    // Wait 1 second before moving to next question
    setTimeout(() => {
        currentQuestion++;
        
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 1000);
}

function endGame() {
    // Update result screen
    finalScoreElement.textContent = score;
    correctAnswersElement.textContent = correctAnswers;
    
    // Track game end
    trackGameEnd();
    
    // Hide quiz screen, show result screen
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
}

function restartGame() {
    // Hide result screen, show welcome screen
    resultScreen.classList.remove('active');
    welcomeScreen.classList.add('active');
    
    // Reset score display
    scoreElement.textContent = "0";
}

// Share score function
function shareScore() {
    const score = finalScoreElement.textContent;
    const total = totalQuestionsElement.textContent;
    const correct = correctAnswersElement.textContent;
    const category = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    
    const shareTitle = `My BrainQuiz.fun Score: ${score} points!`;
    const shareText = `I scored ${score} points (${correct} correct answers) in the ${category} category on BrainQuiz.fun! Can you beat my score? Test your knowledge now!`;
    const shareUrl = 'https://brainquiz.fun';
    
    // Try using the Web Share API first (mobile-friendly)
    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
        })
        .catch(error => {
            console.log('Error sharing:', error);
            fallbackShare(shareTitle, shareText, shareUrl);
        });
    } else {
        fallbackShare(shareTitle, shareText, shareUrl);
    }
    
    // Track share event in analytics
    if (typeof gtag === 'function') {
        gtag('event', 'share', {
            'event_category': 'engagement',
            'event_label': selectedCategory,
            'value': parseInt(score)
        });
    }
}

// Fallback sharing options when Web Share API is not available
function fallbackShare(title, text, url) {
    // Create the sharing overlay
    const overlay = document.createElement('div');
    overlay.className = 'share-overlay';
    overlay.innerHTML = `
        <div class="share-container">
            <h3>Share Your Score</h3>
            <p>${text}</p>
            <div class="share-buttons">
                <button class="share-btn twitter" data-platform="twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                    Twitter
                </button>
                <button class="share-btn facebook" data-platform="facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                    </svg>
                    Facebook
                </button>
                <button class="share-btn copy" data-platform="copy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy Link
                </button>
                <button class="close-share">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Add event listeners to the share buttons
    overlay.querySelector('.twitter').addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    });
    
    overlay.querySelector('.facebook').addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    });
    
    overlay.querySelector('.copy').addEventListener('click', () => {
        const fullText = `${text} ${url}`;
        navigator.clipboard.writeText(fullText).then(() => {
            const copyBtn = overlay.querySelector('.copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg> Copy Link`;
            }, 2000);
        });
    });
    
    overlay.querySelector('.close-share').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // Close when clicking outside the share container
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

// Track game events for analytics
function trackGameStart() {
    if (typeof gtag === 'function') {
        gtag('event', 'game_start', {
            'event_category': 'game',
            'event_label': selectedCategory,
            'difficulty': difficulty
        });
    }
}

function trackGameEnd() {
    if (typeof gtag === 'function') {
        gtag('event', 'game_end', {
            'event_category': 'game',
            'event_label': selectedCategory,
            'difficulty': difficulty,
            'score': score,
            'correct_answers': correctAnswers
        });
    }
} 