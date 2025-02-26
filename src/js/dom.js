import { COLOR_GREEN, COLOR_RED, COLOR_WHITE } from "./constants.js"

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

export function updateWld(wins, losses, draws, domElements) {
  domElements.wld.innerHTML = `${wins} / ${losses} / ${draws}`
}

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
