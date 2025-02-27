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
    body: document.body,
    wld: document.getElementById("wld"),
    ratingDiff: document.getElementById("ratingDiff"),
    rating: document.querySelector(".rating"),
    editMode: document.getElementById("editMode"),
    reset: document.getElementById("reset"),
    errorMessage: document.getElementById("errorMessage"),
    successMessage: document.getElementById("successMessage"),
    usernameInput: document.getElementById("usernameInput"),
    toggleElo: document.getElementById("toggleElo"),
    eloDiffContainer: document.getElementById("eloDiffContainer"),
    modes: {
      rapid: document.getElementById("rapid"),
      blitz: document.getElementById("blitz"),
      bullet: document.getElementById("bullet")
    }
  }
}

/**
 * Update the rating
 * @param {object} domElements - The DOM elements
 * @param {number} wins - The number of wins
 * @param {number} losses - The number of losses
 * @param {number} draws - The number of draws
 */
export function setWld(domElements, wins, losses, draws) {
  domElements.wld.innerHTML = `${wins ?? 0} / ${losses ?? 0} / ${draws ?? 0}`
}

/**
 * Update the rating difference
 * @param {object} domElements - The DOM elements
 * @param {number} ratingDiff - The rating difference
 */
export function setRatingDiff(domElements, ratingDiff) {
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
 * Show or hide the rating difference
 * @param {object} domElements - The DOM elements
 * @param {boolean} showEloDiff - The show rating difference
 */
export function setShowRatingDiff(domElements, showEloDiff) {
  domElements.toggleElo.checked = showEloDiff
  domElements.eloDiffContainer.style.display = showEloDiff ? "block" : "none"
}

/**
 * Set the edit mode
 * @param {object} domElements - The DOM elements
 * @param {boolean} editMode - The edit mode
 */
export function setEditMode(domElements, editMode) {
  domElements.editMode.style.display = editMode ? "block" : "none"
}

/**
 * Set the username input
 * @param {object} domElements - The DOM elements
 * @param {string} username - The username
 */
export function setUserNameInput(domElements, username) {
  domElements.usernameInput.value = username
}

/**
 * Show a success message (bit hacky I know)
 * @param {object} elements - The DOM elements
 * @param {string} message - The message to show
 */
export function showSuccessMessage(elements, message) {
  // Delete the old timeout if it exists
  if (elements.successMessage.dataset.timeoutId) {
    clearTimeout(elements.successMessage.dataset.timeoutId)
  }

  elements.successMessage.innerHTML = message

  // Set a new timeout to remove the message after 1 second
  const timeoutId = setTimeout(() => {
    elements.successMessage.innerHTML = ""
    delete elements.successMessage.dataset.timeoutId
  }, 1000)

  elements.successMessage.dataset.timeoutId = timeoutId
}

/**
 * Show an error message
 * @param {object} elements - The DOM elements
 * @param {string} message - The message to show
 */
export function showErrorMessage(elements, message) {
  elements.errorMessage.innerHTML = message
}

/**
 * Animate the difference in Elo ratings
 * @param {object} elements - The DOM elements
 * @param {number} newEloDiff - The new Elo difference
 * @param {number} lastRatingDiff - The last rating difference
 * @param {Function} callback - The callback function to update the rating difference
 */
export function animateEloDiff(elements, newEloDiff, lastRatingDiff, callback) {
  const start = performance.now()
  const initialDiff = lastRatingDiff

  requestAnimationFrame(function animate(time) {
    const timeFraction = Math.min((time - start) / ANIMATION_DURATION, 1)
    const ratingDiff = Math.floor(
      initialDiff + timeFraction * (newEloDiff - initialDiff)
    )

    callback(elements, ratingDiff)

    if (timeFraction < 1) requestAnimationFrame(animate)
  })
}
