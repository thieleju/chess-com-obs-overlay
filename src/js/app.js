import { STATE_DEFAULT, INTERVAL_MS } from "./constants.js"
import { fetchGames, fetchAllCurrentRatings } from "./api.js"
import { getScore, animateEloDiff } from "./game.js"
import {
  getDomElements,
  updateWld,
  updateRatingDiff,
  setGameModeButtonActive
} from "./dom.js"

let state = JSON.parse(JSON.stringify(STATE_DEFAULT))
const processedGameUUIDs = new Set()
let scriptStartTime = Math.floor(Date.now() / 1000)
let interval = null
let isRunning = false
let elements = getDomElements()

/**
 * Update the UI with the latest stats
 */
async function updateUI() {
  try {
    const games = await fetchGames(state.username)
    const score = getScore(games, state, processedGameUUIDs, scriptStartTime)

    updateWld(score.wins, score.losses, score.draws, elements)

    const allCurrentRatings = await fetchAllCurrentRatings(state.username)
    if (!allCurrentRatings) return

    const ratingDiff =
      allCurrentRatings[state.gameMode] -
      state.modes[state.gameMode].initialRating

    // Prevent NaN and duplicate animations
    if (
      Number.isNaN(ratingDiff) ||
      ratingDiff === state.modes[state.gameMode].lastRatingDiff
    )
      return

    animateEloDiff(
      ratingDiff,
      state.modes[state.gameMode].lastRatingDiff,
      elements,
      updateRatingDiff
    )
    state.modes[state.gameMode].lastRatingDiff = ratingDiff
  } catch (error) {
    handleFetchError(error)
  }
}

/**
 * Initialize by fetching the current ratings and updating the UI
 */
async function init() {
  try {
    const allCurrentRatings = await fetchAllCurrentRatings(state.username)

    // Set the initial rating for each mode
    for (const mode in state.modes) {
      state.modes[mode].initialRating = allCurrentRatings
        ? allCurrentRatings[mode]
        : null
    }
    await updateUI()
    elements.errorMessage.innerHTML = ""
    console.log("Initialized State", state)
  } catch (error) {
    handleFetchError(error)
  }
}

/**
 * Start the interval to update the UI
 */
function startInterval() {
  interval = setInterval(async () => {
    // Skip iteration if username is not set
    if (!state.username) return

    // Skip iteration if edit mode is active or another iteration is running
    if (state.editMode || isRunning) return

    isRunning = true
    try {
      await updateUI()
    } finally {
      isRunning = false
    }
  }, INTERVAL_MS)
}

/**
 * Start the app
 */
async function start() {
  await init()

  // Event listeners
  elements.reset.addEventListener("click", async () => handleResetClick())
  elements.usernameInput.addEventListener("change", () =>
    handleUsernameChange()
  )
  elements.global.addEventListener("click", () =>
    switchEditMode(!state.editMode)
  )
  for (const mode of Object.keys(elements.modes)) {
    elements.modes[mode].addEventListener("click", () => {
      handleGameModeChange(mode)
    })
  }

  startInterval()
}

/**
 * Switch edit mode
 * @param {boolean} newMode - The new edit mode
 */
function switchEditMode(newMode) {
  state.editMode = newMode
  elements.editMode.style.display = state.editMode ? "block" : "none"
}

/**
 * Show a success message
 * @param {string} message - The message to show
 */
function showSuccessMessage(message) {
  elements.successMessage.innerHTML = message
  setTimeout(() => {
    elements.successMessage.innerHTML = ""
  }, 1000)
}

/**
 * Reset all stats
 */
function resetAllStats() {
  switchEditMode(false)

  elements.errorMessage.innerHTML = ""
  elements.successMessage.innerHTML = ""

  state = JSON.parse(JSON.stringify(STATE_DEFAULT))
  elements = getDomElements()

  updateWld(0, 0, 0, elements)
  updateRatingDiff(0, elements)

  scriptStartTime = Math.floor(Date.now() / 1000)
  processedGameUUIDs.clear()

  for (const mode of Object.keys(elements.modes)) {
    elements.modes[mode].classList.remove("active")
  }

  elements.modes[state.gameMode].classList.add("active")
}

/**
 * Handle fetch errors
 * @param {Error} err - The error to handle
 */
function handleFetchError(err) {
  if (err.name === "AbortError") {
    console.error("Fetch timeout:", err)
  } else if (err.message.includes("HTTP Error: 404")) {
    elements.errorMessage.innerHTML =
      state.username === ""
        ? "Enter your chess.com username"
        : `User '${state.username}' not found`
  } else {
    throw err
  }
}

/**
 * Handle reset button click
 */
async function handleResetClick() {
  console.log("Resetting stats")

  showSuccessMessage("Resetting stats...")

  // Disable reset button while reinitialization is running (to prevent double clicks)
  elements.reset.disabled = true

  resetAllStats()
  state.username = elements.usernameInput.value

  await init()
  elements.reset.disabled = false
}

/**
 * Handle game mode change
 * @param {string} mode - The new game mode
 */
function handleGameModeChange(mode) {
  console.log("Setting game mode to", mode)

  state.gameMode = mode

  switchEditMode(false)
  updateRatingDiff(state.modes[state.gameMode].lastRatingDiff, elements)

  const score = state.modes[state.gameMode].score
  updateWld(score.wins, score.losses, score.draws, elements)

  for (const m of Object.keys(elements.modes)) {
    elements.modes[m].classList.remove("active")
  }

  elements.modes[mode].classList.add("active")

  showSuccessMessage(`Switched to ${mode} mode`)
}

/**
 * Handle username change
 */
function handleUsernameChange() {
  console.log("Setting username to", elements.usernameInput.value)

  // Keep the current game mode and reset the rest
  const tempGameMode = state.gameMode
  resetAllStats()
  state.gameMode = tempGameMode
  setGameModeButtonActive(elements, state.gameMode)

  state.username = elements.usernameInput.value
  showSuccessMessage(`Set username to ${state.username}`)

  init()
}

// Global error handling
globalThis.addEventListener("error", async (event) => {
  console.error("Unhandled error:", event.error || event.reason || event)

  elements.errorMessage.innerHTML =
    "Something bad happened, retrying after 5s..."

  await new Promise((resolve) => setTimeout(resolve, 5000))

  elements.reset.disabled = false

  for (const mode of Object.keys(elements.modes)) {
    elements.modes[mode].removeEventListener("click", () => {})
  }

  if (interval) clearInterval(interval)
  resetAllStats()

  state.username = elements.usernameInput.value

  await start()
})

// Clear interval on page unload
window.addEventListener("beforeunload", () => {
  console.log("Unloading page and clearing interval...")
  clearInterval(interval)
})

start()
