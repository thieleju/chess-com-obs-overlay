import { STATE_DEFAULT, INTERVAL_MS } from "./constants.js"
import { getDomElements, updateWld, updateRatingDiff } from "./dom.js"
import { fetchGames, fetchAllCurrentRatings } from "./api.js"
import { getScore, animateEloDiff } from "./game.js"

let state = JSON.parse(JSON.stringify(STATE_DEFAULT))
let processedGameUUIDs = new Set()
let scriptStartTime = Math.floor(Date.now() / 1000)
let interval = null
let isRunning = false
let elements = getDomElements()

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
      isNaN(ratingDiff) ||
      ratingDiff === state.modes[state.gameMode].lastRatingDiff
    )
      return
    animateEloDiff(
      ratingDiff,
      state.modes[state.gameMode].lastRatingDiff,
      updateRatingDiff(ratingDiff, elements)
    )
    state.modes[state.gameMode].lastRatingDiff = ratingDiff
  } catch (err) {
    handleFetchError(err)
  }
}

async function init() {
  try {
    const [games, allCurrentRatings] = await Promise.all([
      fetchGames(state.username),
      fetchAllCurrentRatings(state.username)
    ])
    // Set the initial rating for each mode
    for (const mode in state.modes) {
      state.modes[mode].initialRating = allCurrentRatings
        ? allCurrentRatings[mode]
        : null
    }
    await updateUI()
    elements.errorMessage.innerHTML = ""
    console.log("Initialized State", state)
  } catch (err) {
    handleFetchError(err)
  }
}

function startInterval() {
  interval = setInterval(async () => {
    if (!state.username) return
    if (state.editMode || isRunning) return
    isRunning = true
    try {
      await updateUI()
    } finally {
      isRunning = false
    }
  }, INTERVAL_MS)
}

function switchEditModeTo(newMode) {
  state.editMode = newMode
  elements.editMode.style.display = state.editMode ? "block" : "none"
}

function showSuccessMessage(message) {
  elements.successMessage.innerHTML = message
  setTimeout(() => {
    elements.successMessage.innerHTML = ""
  }, 1000)
}

function resetAllStats() {
  switchEditModeTo(false)
  state = JSON.parse(JSON.stringify(STATE_DEFAULT))
  elements = getDomElements()
  updateWld(0, 0, 0, elements)
  updateRatingDiff(0, elements)
  scriptStartTime = Math.floor(Date.now() / 1000)
  processedGameUUIDs.clear()
  Object.keys(elements.modes).forEach((mode) => {
    elements.modes[mode].classList.remove("active")
  })
  elements.modes[state.gameMode].classList.add("active")
}

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

async function start() {
  await init()

  // Reset button event listener
  elements.reset.addEventListener("click", async () => {
    console.log("Resetting stats")
    showSuccessMessage("Resetting stats...")
    // Disable reset button while reinitialization is running (to prevent double clicks)
    elements.reset.disabled = true
    resetAllStats()
    state.username = elements.usernameInput.value
    await init()
    elements.reset.disabled = false
  })

  // Event listener for game mode change
  Object.keys(elements.modes).forEach((mode) => {
    elements.modes[mode].addEventListener("click", () => {
      console.log("Set game mode to", mode)
      state.gameMode = mode
      switchEditModeTo(false)
      updateRatingDiff(state.modes[state.gameMode].lastRatingDiff, elements)
      const score = state.modes[state.gameMode].score
      updateWld(score.wins, score.losses, score.draws, elements)
      Object.keys(elements.modes).forEach((m) => {
        elements.modes[m].classList.remove("active")
      })
      elements.modes[mode].classList.add("active")
      showSuccessMessage(`Switched to ${mode} mode`)
    })
  })

  // Event listener for username change
  elements.usernameInput.addEventListener("change", () => {
    console.log("Setting username to", elements.usernameInput.value)
    resetAllStats()
    state.username = elements.usernameInput.value
    showSuccessMessage(`Set username to ${state.username}`)
    init()
  })

  // Global event listener to toggle edit mode
  elements.global.addEventListener("click", () =>
    switchEditModeTo(!state.editMode)
  )

  startInterval()
}

window.addEventListener("error", async (event) => {
  console.error("Unhandled error:", event.error || event.reason || event)
  elements.errorMessage.innerHTML =
    "Something bad happened, retrying after 5s..."
  await new Promise((resolve) => setTimeout(resolve, 5000))
  elements.reset.disabled = false
  Object.keys(elements.modes).forEach((mode) => {
    elements.modes[mode].removeEventListener("click", () => {})
  })
  if (interval) clearInterval(interval)
  resetAllStats()
  state.username = elements.usernameInput.value
  await start()
})

window.addEventListener("beforeunload", () => {
  console.log("Unloading page and clearing interval...")
  clearInterval(interval)
})

start()
