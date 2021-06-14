import Highway from '@dogstudio/highway'

// ==========
// QUIZ MAKER
// ==========

export class QuizMaker extends Highway.Renderer {
  onEnterCompleted() {
    // DOM Elemnents
    const quizTitle = document.querySelector('.quiz-create__title')
    const quizQuestion = document.querySelector('.quiz-create__question')
    const quizQuestionTime = document.querySelector('.quiz-create__time')
    const correctAnswer = document.querySelector('.correctAnswer')
    const wrongOneAnswer = document.querySelector('.wrongOneAnswer')
    const wrongTwoAnswer = document.querySelector('.wrongTwoAnswer')
    const wrongThreeAnswer = document.querySelector('.wrongThreeAnswer')
    const addQuestionBtn = document.querySelector('.addBtn')
    const finishQuizBtn = document.querySelector('.finishBtn')
    const endQuiz = document.querySelector('.endQuiz')
    const errorMsgTitle = document.querySelector('.quiz-create__error--title')
    const errorMsgInput= document.querySelector('.quiz-create__error--input')
    const setQuizTitle = document.querySelector('.quiz-create__btn--set')

    // Event listeners
    addQuestionBtn.addEventListener('click', addQuestion)
    setQuizTitle.addEventListener('click', checkTitle)
    quizTitle.addEventListener('change', duplicateQuizWarning)
    finishQuizBtn.addEventListener('click', finishQuiz)

    // Quiz Array Object
    let quiz
    // Fetches quiz array object from localStorage if title is provided
    if (localStorage.getItem('quiz') === null) quiz = []
    else quiz = JSON.parse(localStorage.getItem('quiz'))

    // Checks if quiz already exists
    function duplicateQuizWarning() {
      if (quiz.map(item => item.title).indexOf(quizTitle.value) >= 0) {
        errorMsgTitle.textContent = 'Quiz already exists'
      } 
    }
    
    // Clears inputs
    function clearInputs() {
      quizQuestion.value = ''
      correctAnswer.value = ''
      wrongOneAnswer.value = ''
      wrongTwoAnswer.value = ''
      wrongThreeAnswer.value = ''
      quizQuestionTime.value = ''
    }

    // Checks if title and inputs been filled in before finishing/submitting quiz
    function finishQuiz() {
      let index = quiz.map(item => item.title).indexOf(quizTitle.value)
      if (quiz[index].questions.length === 0) {
        checkInput()
        errorMsgInput.textContent = 'Please add your question and answers'
        endQuiz.setAttribute('href', '#')
      } else {
        endQuiz.setAttribute('href', '/index.html')
      }
    }

    // Checks that each input has a value
    function checkInput() {
      if (quizQuestion.value === '') {
        errorMsgInput.textContent = 'Please provide a question'
      } else if (quizQuestionTime.value === '' || /^\d+$/.test(quizQuestionTime.value) === false) {
        errorMsgInput.textContent = 'Please provide a time'
      } else if (parseInt(quizQuestionTime.value) > 90) {
        errorMsgInput.textContent = 'Time exceeds limit'
      } else if (correctAnswer.value === '') {
        errorMsgInput.textContent = 'Please provide a correct answer'
      } else if (wrongOneAnswer.value === '' && wrongTwoAnswer.value === '' && wrongThreeAnswer.value === '') {
        errorMsgInput.textContent = 'Please provide a wrong answer'
      } else {
        errorMsgInput.textContent = ''
        return true
      }
    }

    function checkTitle() {
      // Check if user provided title
      if (quizTitle.value === '') {
        errorMsgTitle.textContent = 'Please provide a title'
        clearInputs()
      } // Checks if quiz already exists
      else if (quiz.map(item => item.title).indexOf(quizTitle.value) >= 0) {
        errorMsgTitle.textContent = 'Quiz already exists'
      } // Removes error message and sets quiz title to localStorage
      else {
        errorMsgTitle.textContent = ''
        setQuizTitle.style.backgroundColor = '#69699c'
        setQuizTitle.style.color = 'white'
        quiz.push({title: quizTitle.value, questions: []})
        localStorage.setItem('quiz', JSON.stringify(quiz))
        quizTitle.readOnly = true
        endQuiz.setAttribute('href', '/index.html')
      }
    }

    // Adds question when checks are approved
    function addQuestion() {
      if (quizTitle.readOnly === false) {
        errorMsgTitle.textContent = 'Please set a new quiz title'
        clearInputs()
      } else if (checkInput() === true) {
        saveQuestion(quizQuestion.value, correctAnswer.value, wrongOneAnswer.value, wrongTwoAnswer.value, wrongThreeAnswer.value, quizQuestionTime.value)
        clearInputs()
      }
    }

    // Saves question and answers to localStorage
    function saveQuestion(question, correct, wrongOne, wrongTwo, wrongThree, time) {
        let index = quiz.map(item => item.title).indexOf(quizTitle.value)
        quiz[index].questions.push({question: question, time: time, correct: correct, wrongOne: wrongOne, wrongTwo: wrongTwo, wrongThree: wrongThree})
        localStorage.setItem('quiz', JSON.stringify(quiz))
    }
  }
}

// =====================
// QUIZ BANK & QUIZ TIME
// ======================

export class QuizBank extends Highway.Renderer {
  // =========
  // QUIZ BANK
  // =========
  onEnter() {
    // DOM Elements
    const quizBank = document.querySelector('.quiz-bank')
    const quizTime = document.querySelector('.quiz-play')
    const quizBankWrapper = document.querySelector('.quiz-bank__quiz-wrapper')
    const questionTimer = document.querySelector('.quiz-play__time');
    const currentQuestion = document.querySelector('.quiz-play__question')
    const answersTally = document.querySelector('.quiz-play__correct')
    const questionAnswers = document.querySelectorAll('.quiz-play__answer__icon')
    const correctBtn = document.querySelector('.correctBtn')
    const wrongOneBtn = document.querySelector('.wrongOneBtn')
    const wrongTwoBtn = document.querySelector('.wrongTwoBtn')
    const wrongThreeBtn = document.querySelector('.wrongThreeBtn')
    const countdownCircle = document.getElementById('foo')
    const nextBtn = document.querySelector('.quiz-play__btn')
    const header = document.querySelector('.header')

    header.addEventListener('click', () => clearInterval(timerId))

    /* Global Variables */

    // Detects quiz chosen from LocalStorage
    let quizTitleIndex

    // Tracks users correct answers
    let totalAnswersCorrect = 0

    // Stores TimeInterval
    let timerId

    // Tracks where the user is in the quiz
    let questionIndex = 1

    // Detects if user has given an answer or not
    let answerGiven = false

    // Fetches quiz object from LocalStorage
    let quiz
    if (localStorage.getItem('quiz') === null) quiz = []
    else quiz = JSON.parse(localStorage.getItem('quiz'))

    // Fetches Quiz titles from LocalStorage and displays on DOM
    function getQuizTitle() {

      quiz.forEach(title => {
        // Title DIV
        const titleDiv = document.createElement('div')
        titleDiv.classList.add('quiz-bank__quiz')
        // Title LI
        const newTitle = document.createElement('h3')
        newTitle.textContent = title.title
        newTitle.classList.add('quiz-bank__quiz__title')
        titleDiv.appendChild(newTitle)
        // Play Button
        const playButtonContainer = document.createElement('p')
        playButtonContainer.classList.add('quiz-bank__quiz__icon', 'quiz-bank__quiz__icon--play')
        titleDiv.appendChild(playButtonContainer)
        const playButton = document.createElement('i')
        playButton.classList.add('fa-play-circle', 'far')
        playButtonContainer.appendChild(playButton)
        // Trash Button
        const trashButtonContainer = document.createElement('p')
        trashButtonContainer.classList.add('quiz-bank__quiz__icon', 'quiz-bank__quiz__icon--delete')
        titleDiv.appendChild(trashButtonContainer)
        const trashButton = document.createElement('i')
        trashButton.classList.add('fa-trash-alt', 'fas')
        trashButtonContainer.appendChild(trashButton)
        // Appends to Quiz Bank
        quizBankWrapper.appendChild(titleDiv)
      })
    }

    getQuizTitle()

    // Functionality to display chosen Quiz to DOM 
    const selectedQuiz = document.querySelectorAll('.fa-play-circle')
    selectedQuiz.forEach((circle, i) => circle.addEventListener('click', function() {
      quizTitleIndex = i
      quizBank.style.display = 'none'
      quizTime.style.display = 'block'
      startQuiz()
    }))
    // Deletes selected Quiz from DOM 
    const trashQuiz = document.querySelectorAll('.fa-trash-alt')
    trashQuiz.forEach(circle => {
      circle.addEventListener('click', e => {
        const deleteQuiz = e.target.parentElement.parentElement
        const deleteQuizTitle = e.target.parentElement.parentElement.firstChild.textContent
        deleteQuiz.classList.add('fall')
        removeQuiz(deleteQuizTitle)
        deleteQuiz.addEventListener('transitionend', () => deleteQuiz.remove())
      })
    })

    // Removes selected Quiz from LocalStorage
    function removeQuiz(title) {
      quiz.forEach((quizTitle, i) => {
        if (quizTitle.title === title) {
          quiz.splice(i, 1)
        }
      })
      localStorage.setItem('quiz', JSON.stringify(quiz))
    }

    // ==========
    // QUIZ TIME
    // ==========

    nextBtn.addEventListener('click', nxtQuestion)

    // Displays first question of the quiz 
    function startQuiz() {

      // Stores questions of quiz object to array so it can be easily accessed
      let values = []
      for (let i = 0; i < quiz[quizTitleIndex].questions.length; i++) {
        values.push(Object.values(quiz[quizTitleIndex].questions[i]))
      }

      currentQuestion.textContent = values[0][0]
      questionTimer.textContent = values[0][1]
      correctBtn.textContent = values[0][2]
      wrongOneBtn.textContent = values[0][3]
      wrongTwoBtn.textContent = values[0][4]
      wrongThreeBtn.textContent = values[0][5]

      setTimer(parseInt(values[0][1]))
      removeQuestionNumber()
      randomAnswers()
      findCorrectAnswer()
      checkLastQuestion()
    }

    // Adds correct answer to total and displays it
    function displayTotal() {
      totalAnswersCorrect++
      answersTally.textContent = `${totalAnswersCorrect}`
    }

    // Checks if user's answer is right/wrong and displays right answer if wrong is chosen 
    function findCorrectAnswer() {
      answersTally.textContent = `${totalAnswersCorrect}`
      questionAnswers.forEach((answer, i) => {
        answer.addEventListener('click', e => {
          const selectedAnswer = e.target.parentNode.parentNode.children[0]
          const selectedAnswerWrapper = e.target.parentNode.parentNode
          answerGiven = true
          // Right answer chosen - adds to total corect answers
          if (selectedAnswer.classList.contains('correctBtn')) {
            selectedAnswerWrapper.classList.add('correct')
            displayTotal()
          // Wrong answer chosen - finds correct answer and reveal it
          } else if (selectedAnswer.classList.contains('wrongBtn')) {
            selectedAnswerWrapper.classList.add('wrong')
            let itemChildren = document.querySelectorAll('.quiz-play__answer__text')
            for (let i = 0; i < itemChildren.length; i++) {
              if (itemChildren[i].classList.contains('correctBtn')) { 
                 itemChildren[i].parentNode.classList.add('correct')
                }
              }
            }
            // Prevents user from receiving multiple correct answers 
            let itemChildren = document.querySelectorAll('.quiz-play__answer__text')
            for (let i = 0; i < itemChildren.length; i++) {
              itemChildren[i].classList.remove('correctBtn')
              itemChildren[i].classList.remove('wrongBtn')
            }
            // Stops timer
            clearInterval(timerId)
            countdownCircle.classList.remove('resetTimer')
        }) 
      })
    }

    // Randomises location of answers for every question
    function randomAnswers() {
      const cta = document.querySelector('.quiz-play__answers');
      let questionNumber = 10

      for (let j = 0; j <= cta.children.length - 1; j++) {
        if (cta.children[j].children[0].textContent == '') {
          cta.children[j].style.display = 'none'
        } else {
          cta.children[j].style.display = 'flex'
        }
      }

      for (let i = cta.children.length - 1; i >= 0; i--) {
        cta.appendChild(cta.children[Math.random() * i | 0]).classList.add(`quiz-play__answer--${questionNumber}`);        
        questionNumber++
      }

      if (questionNumber === 13) questionNumber = 10
    }

    function removeQuestionNumber () {
      const cta = document.querySelector('.quiz-play__answers');
      let regexHere = /quiz-play__answer--[0-9]+/g

      for (let j = 0; j <= cta.children.length - 1; j++) {
        cta.children[j].className = cta.children[j].className.replace(regexHere, '')
      }
    }

    // Removes background color of right and wrong answer when new question comes
    function removeColor() {
      const quizBoxes = document.querySelectorAll('.quiz-play__answer')
      quizBoxes.forEach(btn => {
        if (btn.classList.contains('correct')) {
          btn.children[0].classList.add('correctBtn')
          btn.classList.remove('correct')
        } else {
          btn.children[0].classList.add('wrongBtn')
          btn.classList.remove('wrong')
        }
      })
    }

    // Countdown which sets timer for each question
    function setTimer(time) {

      countdownCircle.classList.add('resetTimer')

      let countdown = time
      countdownCircle.style.animationDuration = `${countdown}s`
      
      timerId = setInterval(function() {
        countdown = --countdown
        questionTimer.textContent = countdown
        if (countdown === 0) {
          // When timer hits 0, stop timer
          clearInterval(timerId)
          countdownCircle.classList.remove('resetTimer')
          answerGiven = true
          
          // Finds correct wrong for user to see
          let itemChildren = document.querySelectorAll('.quiz-play__answer__text')
          for (let i = 0; i < itemChildren.length; i++) {
            if (itemChildren[i].classList.contains('correctBtn')) { 
              itemChildren[i].parentNode.classList.add('correct')
            }
          }
          // Removes classes that gives user a correct answer
          for (let i = 0; i < itemChildren.length; i++) {
            itemChildren[i].classList.remove('correctBtn')
            itemChildren[i].classList.remove('wrongBtn')
          }
        }
      }, 1000)
    }

    // Shows question/answer/timer for next question
    function nxtQuestion() {

      // Next question will only show if user has chosen an answer or timer hits 0
      if (answerGiven) {
        if (nextBtn.innerText === "FINISH") {
          showResults()
          countdownCircle.classList.remove('resetTimer')
          quizResults.style.display = "flex"
          quizTime.style.display = "none"  
          questionIndex = 0
          totalAnswersCorrect = 0   
        }
        countdownCircle.classList.remove('resetTimer')
        let values = []
        for (let i = 0; i < quiz[quizTitleIndex].questions.length; i++) {
          values.push(Object.values(quiz[quizTitleIndex].questions[i]))
        }
        currentQuestion.textContent = values[questionIndex][0]
        questionTimer.textContent = values[questionIndex][1]
        correctBtn.textContent = values[questionIndex][2]
        wrongOneBtn.textContent = values[questionIndex][3]
        wrongTwoBtn.textContent = values[questionIndex][4]
        wrongThreeBtn.textContent = values[questionIndex][5]

        setTimer(parseInt(values[questionIndex][1]))
        removeQuestionNumber()
        randomAnswers()
        removeColor()
        questionIndex++
      }
      answerGiven = false
      checkLastQuestion()
    }
    
    // Checks if quiz is on last question 
    function checkLastQuestion() {
      if (questionIndex === quiz[quizTitleIndex].questions.length) nextBtn.textContent = 'FINISH'
      else nextBtn.textContent = 'NEXT'
    }

    // ============
    // QUIZ RESULTS
    // ============
    const quizResults = document.querySelector('.quiz-results')
    const quizCorrect = document.querySelector('.quiz-results__text__correct')
    const quizIncorrect = document.querySelector('.quiz-results__text__incorrect')
    const quizScore = document.querySelector('.quiz-results__result__score')
    const quizRestart = document.querySelector('.quiz-results__btn--restart')

    function showResults() {
      let result = Math.round((totalAnswersCorrect/quiz[quizTitleIndex].questions.length) * 100);
      quizCorrect.textContent = totalAnswersCorrect
      quizIncorrect.textContent = quiz[quizTitleIndex].questions.length
      quizScore.textContent = result
    }

    quizRestart.addEventListener('click', restartQuiz)

    function restartQuiz() {
      quizResults.style.display = "none"
      quizTime.style.display = "block"  
      clearInterval(timerId)
      startQuiz()
    }
  }
}