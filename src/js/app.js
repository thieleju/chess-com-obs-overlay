import { STATE_DEFAULT, INTERVAL_MS } from "./constants.js"
import { fetchGames, fetchAllCurrentRatings } from "./api.js"
import {
  getDomElements,
  setGameModeButtonActive,
  setWld,
  setRatingDiff,
  setEditMode,
  setShowRatingDiff,
  showSuccessMessage,
  showErrorMessage,
  setUserNameInput,
  animateEloDiff
} from "./dom.js"

let state = JSON.parse(JSON.stringify(STATE_DEFAULT))
let interval = null
let isRunning = false
let elements = getDomElements()

/**
 * Update the UI with the latest stats
 */
export async function updateUi() {
  try {
    const games = await fetchGames(state.username)
    const score = getScore(games)

    setWld(elements, score.wins, score.losses, score.draws)

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
      elements,
      ratingDiff,
      state.modes[state.gameMode].lastRatingDiff,
      setRatingDiff
    )
    state.modes[state.gameMode].lastRatingDiff = ratingDiff

    saveStateToLocalStorage(state)
  } catch (error) {
    handleError(error)
  }
}

/**
 * Initialize by fetching the current ratings and updating the UI
 */
export async function init() {
  try {
    showSuccessMessage(elements, "Initializing...")

    // Read state from local storage and initialize or use default state
    state = readStateFromLocalStorage() || STATE_DEFAULT
    state.processedGameUUIDs = new Set()
    state.editMode = false
    state.scriptStartTime = Math.floor(Date.now() / 1000)
    const mode = state.modes[state.gameMode]

    setUserNameInput(elements, state.username)
    setShowRatingDiff(elements, state.showEloDiff)
    setEditMode(elements, false)
    setWld(elements, mode.score.wins, mode.score.losses, mode.score.draws)
    setRatingDiff(elements, mode.lastRatingDiff ?? 0)
    setGameModeButtonActive(elements, state.gameMode)

    const allCurrentRatings = await fetchAllCurrentRatings(state.username)
    for (const mode in state.modes) {
      // Only set initial rating if it is undefined, otherwise use from saved settings
      if (state.modes[mode].initialRating) continue

      state.modes[mode].initialRating = allCurrentRatings
        ? allCurrentRatings[mode]
        : null
    }

    await updateUi()

    showErrorMessage(elements, "")

    console.log("Initialized State")
  } catch (error) {
    handleError(error)
  }
}

/**
 * Start the interval to update the UI
 */
export function startInterval() {
  interval = setInterval(async () => {
    // Skip iteration if username is not set
    if (!state.username) return

    // Skip iteration if edit mode is active or another iteration is running
    if (state.editMode || isRunning) return

    isRunning = true
    try {
      await updateUi()
    } finally {
      isRunning = false
    }
  }, INTERVAL_MS)
}

/**
 * Start the app
 */
export async function start() {
  await init()

  // ###### On username input change ######
  elements.usernameInput.addEventListener("change", (event) => {
    showSuccessMessage(
      elements,
      `Set username to ${elements.usernameInput.value}`
    )

    // Reset rating diff and wld
    for (const mode in state.modes) {
      state.modes[mode].lastRatingDiff = 0
      state.modes[mode].initialRating = null
      state.modes[mode].score = { wins: 0, losses: 0, draws: 0 }
    }
    state.processedGameUUIDs = new Set()
    state.username = elements.usernameInput.value
    setUserNameInput(elements, event.target.value)

    saveStateToLocalStorage(state)

    init()
  })

  // ###### Click reset all button ######
  elements.reset.addEventListener("click", async () => {
    showSuccessMessage(elements, "Resetting stats...")

    // Disable reset button while reinitialization is running (to prevent double clicks)
    elements.reset.disabled = true
    resetState()

    // Reinitialize the app
    await init()

    state.editMode = false
    setEditMode(elements, false)

    elements.reset.disabled = false

    saveStateToLocalStorage(state)
  })

  // ###### Click show elo button ######
  elements.toggleElo.addEventListener("click", (event) => {
    state.showEloDiff = event.target.checked
    setShowRatingDiff(elements, state.showEloDiff)

    saveStateToLocalStorage(state)
  })

  // ###### Click one of modes buttons ######
  for (const mode of Object.keys(elements.modes)) {
    elements.modes[mode].addEventListener("click", () => {
      showSuccessMessage(elements, `Switched to ${mode} mode`)

      state.gameMode = mode

      const modeObj = state.modes[mode]
      setGameModeButtonActive(elements, mode)
      setRatingDiff(elements, modeObj.lastRatingDiff)
      setWld(
        elements,
        modeObj.score.wins,
        modeObj.score.losses,
        modeObj.score.draws
      )

      saveStateToLocalStorage(state)
    })
  }

  // ###### Click body element, switching edit mode ######
  elements.body.addEventListener("click", () => {
    // skip if text input is clicked
    if (document.activeElement === elements.usernameInput) return

    const newMode = !state.editMode
    state.editMode = newMode
    setEditMode(elements, newMode)
  })

  // ###### Start main loop ######
  startInterval()
}

/**
 * Maps the result of a game to a score value
 * @param {string} result - The result of the game (win, draw, loss)
 * @returns {number} The score value for the result
 */
export function mapResult(result) {
  if (!result) throw new Error("Invalid result: " + result)
  if (result === "win") return 1
  if (result === "draw") return 0.5
  return 0
}

/**
 * Calculate the score based on the games
 * @param {object[]} games - The games to calculate the score from
 * @returns {object} The updated score
 */
export function getScore(games) {
  // Create a copy of the current score
  const newScore = state.modes[state.gameMode].score
  if (!games || games.length === 0) return newScore

  // Only consider games that ended after the start time and match the current mode, and skip already processed games
  const gamesToCheck = games.filter(
    (game) =>
      game.end_time > state.scriptStartTime &&
      game.time_class === state.gameMode &&
      !state.processedGameUUIDs.has(game.uuid)
  )

  for (const game of gamesToCheck) {
    let userResult = null
    if (game.white.username.toLowerCase() === state.username.toLowerCase()) {
      userResult = mapResult(game.white.result)
    } else if (
      game.black.username.toLowerCase() === state.username.toLowerCase()
    ) {
      userResult = mapResult(game.black.result)
    }

    switch (userResult) {
      case 1: {
        newScore.wins += 1
        break
      }
      case 0: {
        newScore.losses += 1
        break
      }
      case 0.5: {
        newScore.draws += 1
        break
      }
      default: {
        throw new Error("Invalid user result")
      }
    }
    // Mark the game as processed
    state.processedGameUUIDs.add(game.uuid)
  }
  return newScore
}

/**
 * Reset the state to the default state and ui elements
 */
export function resetState() {
  console.log("Resetting state...")

  state = JSON.parse(JSON.stringify(STATE_DEFAULT))
  state.processedGameUUIDs = new Set()
  state.scriptStartTime = Math.floor(Date.now() / 1000)
  state.username = elements.usernameInput.value

  saveStateToLocalStorage(state)

  // reset ui elements
  elements = getDomElements()
  setUserNameInput(elements, state.username)
  setShowRatingDiff(elements, state.showEloDiff)
  setEditMode(elements, state.editMode)
  setWld(elements, 0, 0, 0)
  setRatingDiff(elements, 0)
  setGameModeButtonActive(elements, state.gameMode)
}

/**
 * Handle fetch errors and throw others to global error handler
 * @param {Error} err - The error to handle
 */
export function handleError(err) {
  if (err.name === "AbortError") {
    console.error("Fetch timeout:", err)
  } else if (err.message.includes("HTTP Error: 404")) {
    showErrorMessage(
      elements,
      state.username === ""
        ? "Enter your chess.com username"
        : `User '${state.username}' not found`
    )
  } else {
    throw err
  }
}

/**
 * Save the state to local storage.
 * @param {object} state - The state
 */
export function saveStateToLocalStorage(state) {
  console.log("Saving state to local storage")
  localStorage.setItem("state", JSON.stringify(state))
}

/**
 * Read the state from local storage.
 * @returns {object} The state
 */
export function readStateFromLocalStorage() {
  try {
    const s = JSON.parse(localStorage.getItem("state"))
    console.log("Read state from local storage")
    return s
  } catch {
    return STATE_DEFAULT
  }
}

// Global error handling
globalThis.addEventListener("error", async (event) => {
  console.error("Unhandled error:", event.error || event.reason || event)

  showErrorMessage(elements, "Something bad happened, retrying after 5s...")

  await new Promise((resolve) => setTimeout(resolve, 5000))

  elements.reset.disabled = false

  if (interval) clearInterval(interval)

  resetState()

  await start()
})

// Clear interval on page unload
window.addEventListener("beforeunload", () => {
  console.log("Unloading page and clearing interval...")
  clearInterval(interval)
})

start()
