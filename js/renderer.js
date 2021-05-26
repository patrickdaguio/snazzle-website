import Highway from '@dogstudio/highway'

// ==========
// QUIZ MAKER
// ==========

export class QuizMaker extends Highway.Renderer {
  onEnterCompleted() {
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

    // Checks if title or any has been inputted before finishing quiz
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

// ==========
// QUIZ BANK
// ==========

export class QuizBank extends Highway.Renderer {
  onEnter() {
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

    let quiz
    if (localStorage.getItem('quiz') === null) quiz = []
    else quiz = JSON.parse(localStorage.getItem('quiz'))

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

        quizBankWrapper.appendChild(titleDiv)
      })
    }

    getQuizTitle()

    let quizTitleIndex

    const selectedQuiz = document.querySelectorAll('.fa-play-circle')
    selectedQuiz.forEach((circle, i) => circle.addEventListener('click', function() {
      quizTitleIndex = i
      quizBank.style.display = 'none'
      quizTime.style.display = 'block'
      startQuiz()
    }))
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

    function removeQuiz(title) {
      quiz.forEach((quizTitle, i) => {
        if (quizTitle.title === title) {
          quiz.splice(i, 1)
        }
      })
      localStorage.setItem('quiz', JSON.stringify(quiz))
    }

    // ==========
    // QUIZ PLAY
    // ==========

    nextBtn.addEventListener('click', nxtQuestion)

    let totalAnswersCorrect = 0

    function startQuiz() {

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
      randomAnswers()
      findCorrectAnswer()
    }

    function displayTotal() {
      totalAnswersCorrect++
      answersTally.textContent = `${totalAnswersCorrect}`
    }

    function findCorrectAnswer() {
      answersTally.textContent = `${totalAnswersCorrect}`
      questionAnswers.forEach(answer => {
        answer.addEventListener('click', e => {
          const selectedAnswer = e.target.parentNode.parentNode.children[0]
          const selectedAnswerWrapper = e.target.parentNode.parentNode
          if (selectedAnswer.classList.contains('correctBtn')) {
            selectedAnswerWrapper.classList.add('correct')
            displayTotal()
          } else if (selectedAnswer.classList.contains('wrongBtn')) {
            selectedAnswerWrapper.classList.add('wrong')
            let itemChildren = document.querySelectorAll('.quiz-play__answer__text')
            for (let i = 0; i < itemChildren.length; i++) {
              if (itemChildren[i].classList.contains('correctBtn')) { 
                 itemChildren[i].parentNode.classList.add('correct')
                }
              }
            }
            let itemChildren = document.querySelectorAll('.quiz-play__answer__text')
            for (let i = 0; i < itemChildren.length; i++) {
              itemChildren[i].classList.remove('correctBtn')
              itemChildren[i].classList.remove('wrongBtn')
            }
            clearInterval(timerId)
            countdownCircle.style.animationPlayState = 'paused'
        })
      })
    }
          
    function randomAnswers() {
      const cta = document.querySelector('.quiz-play__answers');
      let number = 9
      for (let i = cta.children.length; i >= 0; i--) {
        cta.appendChild(cta.children[Math.random() * i | 0]).classList.add(`quiz-play__answer--${number}`);
        number++
      }
    }

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

    let timerId

    function setTimer(time) {

      let countdown = time
      countdownCircle.style.animationPlayState = 'play'
      countdownCircle.style.animationDuration = `${countdown}s`
      
      timerId = setInterval(function() {
        countdown = --countdown
        questionTimer.textContent = countdown
        if (countdown === 0) clearInterval(timerId)
        }, 1000);
    }

    let questionIndex = 0

    function nxtQuestion() {
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
      randomAnswers()
      removeColor()

      questionIndex++
    }
  }
}