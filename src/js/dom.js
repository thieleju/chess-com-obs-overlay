import {
  COLOR_GREEN,
  COLOR_RED,
  COLOR_WHITE,
  ANIMATION_DURATION
} from "./constants.js"

/**
 * Get the DOM elements
 * @returns {object} The DOM elements
 */
export function getDomElements() {
  return {
    wld: document.getElementById("wld"),
    ratingDiff: document.getElementById("ratingDiff"),
    rating: document.querySelector(".rating"),
    editMode: document.getElementById("editMode"),
    reset: document.getElementById("reset"),
    global: document.getElementById("global"),
    errorMessage: document.getElementById("errorMessage"),
    successMessage: document.getElementById("successMessage"),
    usernameInput: document.getElementById("usernameInput"),
    modes: {
      rapid: document.getElementById("rapid"),
      blitz: document.getElementById("blitz"),
      bullet: document.getElementById("bullet")
    }
  }
}

/**
 * Update the rating
 * @param {number} wins - The number of wins
 * @param {number} losses - The number of losses
 * @param {number} draws - The number of draws
 * @param {object} domElements - The DOM elements
 */
export function updateWld(wins, losses, draws, domElements) {
  domElements.wld.innerHTML = `${wins} / ${losses} / ${draws}`
}

/**
 * Update the rating difference
 * @param {number} ratingDiff - The rating difference
 * @param {object} domElements - The DOM elements
 */
export function updateRatingDiff(ratingDiff, domElements) {
  if (ratingDiff === 0) {
    domElements.ratingDiff.innerHTML = `+${ratingDiff}`
    domElements.ratingDiff.style.color = COLOR_WHITE
  } else if (ratingDiff > 0) {
    domElements.ratingDiff.innerHTML = `+${ratingDiff}`
    domElements.ratingDiff.style.color = COLOR_GREEN
  } else {
    domElements.ratingDiff.innerHTML = `${ratingDiff}`
    domElements.ratingDiff.style.color = COLOR_RED
  }
}

/**
 * Set active state of the game mode buttons, the active mode is highlighted
 * @param {object} domElements - The DOM elements
 * @param {string} mode - The game mode
 */
export function setGameModeButtonActive(domElements, mode) {
  for (const mode of Object.keys(domElements.modes)) {
    domElements.modes[mode].classList.remove("active")
  }
  domElements.modes[mode].classList.add("active")
}

/**
 * Animate the difference in Elo ratings
 * @param {number} newEloDiff - The new Elo difference
 * @param {number} lastRatingDiff - The last rating difference
 * @param {object} elements - The DOM elements
 * @param {Function} callback - The callback function to update the rating difference
 */
export function animateEloDiff(newEloDiff, lastRatingDiff, elements, callback) {
  const start = performance.now()
  const initialDiff = lastRatingDiff

  requestAnimationFrame(function animate(time) {
    const timeFraction = Math.min((time - start) / ANIMATION_DURATION, 1)
    const ratingDiff = Math.floor(
      initialDiff + timeFraction * (newEloDiff - initialDiff)
    )

    callback(ratingDiff, elements)

    if (timeFraction < 1) requestAnimationFrame(animate)
  })
}
