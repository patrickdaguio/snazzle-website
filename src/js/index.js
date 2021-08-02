import Highway from '@dogstudio/highway'
import Slide from './transition'
import { QuizMaker, QuizBank } from './renderer'

// ===============
// LOGO ANIMATION
// ===============
const textWrapper = document.querySelector('.header__logo .header__letters');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='header__letter'>$&</span>");

anime.timeline({loop: false})
  .add({
    targets: '.header__logo .header__letter',
    scale: [0.3,1],
    opacity: [0,1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i) => 70 * (i+1)
  }).add({
    targets: '.header__logo .header__line',
    scaleX: [0,1],
    opacity: [0.5,1],
    easing: "easeOutExpo",
    duration: 1000,
    offset: '-=875',
    delay: (el, i, l) => 80 * (l - i)
  }).add({
    targets: '.header__logo',
    opacity: 1,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000
  });

// ===============
// PAGE ANIMATION
// ==============

const H = new Highway.Core({
  renderers: {
    maker: QuizMaker,
    bank: QuizBank
  },
  transitions: {
    default: Slide
  }
})