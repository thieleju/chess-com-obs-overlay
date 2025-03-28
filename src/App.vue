<template>
  <v-container fluid class="pa-0 ma-0" @click="toggleEditMode">
    <!-- WLD Score Display -->
    <v-row class="pa-0 ma-0">
      <v-col cols="12" class="pa-0 ma-0">
        <div
          :class="{
            'text-center': state.centerElements,
            wld: true
          }"
        >
          {{ displayScore }}
        </div>
      </v-col>
    </v-row>

    <!-- Elo Difference Display -->
    <v-row v-if="state.showEloDiff" class="pa-0 ma-0">
      <v-col cols="12" class="pa-0 ma-0">
        <div
          :class="{
            'text-center': state.centerElements,
            rating: true
          }"
        >
          <span>Elo:</span>
          <span :style="{ color: ratingDiffColor }">
            {{ formattedRatingDiff }}
          </span>
        </div>
      </v-col>
    </v-row>

    <!-- Alert Messages -->
    <v-row class="pa-0 ma-0">
      <v-col cols="12">
        <v-alert
          v-if="errorMessage"
          dense
          hide-details
          variant="outlined"
          type="error"
        >
          {{ errorMessage }}
        </v-alert>
        <v-alert
          v-if="successMessage"
          dense
          hide-details
          variant="outlined"
          type="success"
        >
          {{ successMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Edit Mode Section -->
    <v-row v-show="state.editMode" class="pa-0 ma-0">
      <v-col cols="12" md="8">
        <v-btn-toggle
          v-model="state.gameMode"
          variant="outlined"
          dense
          mandatory
          @change="showSuccess('Game mode changed to ')"
        >
          <v-btn value="rapid" hide-details> Rapid </v-btn>
          <v-btn value="blitz" hide-details> Blitz </v-btn>
          <v-btn value="bullet" hide-details> Bullet </v-btn>
        </v-btn-toggle>
        <v-btn
          variant="outlined"
          color="secondary"
          :disabled="isResetting"
          class="mx-2"
          @click="resetStats"
        >
          Reset Stats
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-show="state.editMode" class="pa-0 ma-0">
      <v-col cols="12">
        <v-text-field
          v-model="state.username"
          dense
          hide-details
          label="Chess.com Username"
          variant="outlined"
          @change="onUsernameChange"
        />
      </v-col>
    </v-row>

    <v-row v-show="state.editMode" class="pa-0 ma-0">
      <v-col cols="12">
        <v-checkbox
          v-model="state.resetOnRestart"
          dense
          label="Reset Score on Restart"
          hide-details
        />
        <v-checkbox
          v-model="state.showEloDiff"
          dense
          label="Show Elo ±"
          hide-details
        />
        <v-checkbox
          v-model="state.centerElements"
          dense
          label="Centered"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row v-show="state.editMode" class="pa-0 ma-0">
      <v-col cols="12">
        <v-btn-toggle
          v-model="state.scoreFormat"
          variant="outlined"
          dense
          mandatory
        >
          <v-btn value="wld"> W/L/D </v-btn>
          <v-btn value="wdl"> W/D/L </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {
  STATE_DEFAULT,
  COLOR_GREEN,
  COLOR_RED,
  COLOR_WHITE,
  ANIMATION_DURATION,
  INTERVAL_MS
} from "./lib/constants"

import { reactive, ref, computed, onMounted, watch, onBeforeUnmount } from "vue"
import { fetchGames, fetchAllCurrentRatings } from "./lib/api"

// Reactive state from default settings
const state = reactive<State>({ ...STATE_DEFAULT })
const errorMessage = ref("")
const successMessage = ref("")
const isResetting = ref(false)
const currentRatingDiff = ref(0)

// Computed property for score display
const displayScore = computed(() => {
  const mode = state.modes[state.gameMode]
  return state.scoreFormat === "wdl"
    ? `${mode.score.wins} / ${mode.score.draws} / ${mode.score.losses}`
    : `${mode.score.wins} / ${mode.score.losses} / ${mode.score.draws}`
})

const formattedRatingDiff = computed(() => {
  return currentRatingDiff.value >= 0
    ? `+${currentRatingDiff.value}`
    : `${currentRatingDiff.value}`
})

const ratingDiffColor = computed(() => {
  if (currentRatingDiff.value === 0) return COLOR_WHITE
  return currentRatingDiff.value > 0 ? COLOR_GREEN : COLOR_RED
})

let intervalId: number | undefined
let isRunning: boolean = false

// Show success message for 1 second
function showSuccess(msg: string) {
  successMessage.value = msg
  setTimeout(() => (successMessage.value = ""), 1000)
}

function showError(msg: string) {
  errorMessage.value = msg
}

// Update UI by fetching game data and ratings
async function updateUi() {
  try {
    const games: ChessGame[] = (await fetchGames(state.username)) as ChessGame[]
    const score: Score = getScore(games)
    state.modes[state.gameMode].score = score

    const allCurrentRatings = await fetchAllCurrentRatings(state.username)
    if (!allCurrentRatings) return
    const ratingDiff =
      allCurrentRatings[state.gameMode] -
      (state.modes[state.gameMode].initialRating || 0)

    if (
      !isNaN(ratingDiff) &&
      ratingDiff !== state.modes[state.gameMode].lastRatingDiff
    ) {
      animateEloDiff(
        state.modes[state.gameMode].lastRatingDiff,
        ratingDiff,
        (value) => {
          currentRatingDiff.value = value
        }
      )
      state.modes[state.gameMode].lastRatingDiff = ratingDiff
      saveState()
    }
  } catch (error: unknown) {
    handleError(error)
  }
}

// Calculate score from fetched games
function getScore(games: ChessGame[]): Score {
  const modeScore = state.modes[state.gameMode].score
  const newScore = {
    wins: modeScore.wins,
    losses: modeScore.losses,
    draws: modeScore.draws
  }
  if (!games || games.length === 0) return newScore
  const filteredGames = games.filter(
    (game: ChessGame) =>
      game.end_time > state.scriptStartTime &&
      game.time_class === state.gameMode &&
      !state.processedGameUUIDs.includes(game.uuid)
  )
  filteredGames.forEach((game: ChessGame) => {
    let userResult: number | null = null
    if (game.white.username.toLowerCase() === state.username.toLowerCase()) {
      userResult = mapResult(game.white.result)
    } else if (
      game.black.username.toLowerCase() === state.username.toLowerCase()
    ) {
      userResult = mapResult(game.black.result)
    }
    if (userResult === 1) {
      newScore.wins += 1
    } else if (userResult === 0) {
      newScore.losses += 1
    } else if (userResult === 0.5) {
      newScore.draws += 1
    }
    if (!state.processedGameUUIDs.includes(game.uuid)) {
      state.processedGameUUIDs.push(game.uuid)
    }
  })
  return newScore
}

// Map game result to score value
function mapResult(result: string): number {
  switch (result) {
    case "win":
      return 1
    case "lose":
    case "checkmated":
    case "resigned":
    case "timeout":
    case "abandoned":
    case "bughousepartnerlose":
      return 0
    case "agreed":
    case "timevsinsufficient":
    case "repetition":
    case "stalemate":
    case "insufficient":
    case "50move":
      return 0.5
    default:
      throw new Error("Invalid result: " + result)
  }
}

// Save current state to localStorage
function saveState() {
  localStorage.setItem("state", JSON.stringify(state))
}

// Load state from localStorage if available
function loadState() {
  try {
    const s = localStorage.getItem("state")
    if (s) {
      const parsed = JSON.parse(s)
      Object.assign(state, parsed)
    }
  } catch {
    // Use default state on error
    Object.assign(state, STATE_DEFAULT)
  }
}

function animateEloDiff(
  initialDiff: number,
  newEloDiff: number,
  callback: (value: number) => void
) {
  const start = performance.now()

  function animate(time: number) {
    const timeFraction = Math.min((time - start) / ANIMATION_DURATION, 1)
    const ratingDiff = Math.floor(
      initialDiff + timeFraction * (newEloDiff - initialDiff)
    )
    callback(ratingDiff)
    if (timeFraction < 1) requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

function toggleEditMode(event: MouseEvent) {
  const target = event.target as HTMLElement
  const interactiveElements = ["BUTTON", "INPUT", "TEXTAREA", "SELECT", "LABEL"]

  if (!interactiveElements.includes(target.tagName)) {
    state.editMode = !state.editMode
  }
}

// Reset stats and update UI
async function resetStats() {
  isResetting.value = true
  showSuccess("Resetting stats...")
  state.modes = JSON.parse(JSON.stringify(STATE_DEFAULT.modes))
  state.processedGameUUIDs = []
  state.scriptStartTime = Math.floor(Date.now() / 1000)
  await init()
  isResetting.value = false
  saveState()
}

function handleError(err: unknown) {
  if (err instanceof Error && err.name === "AbortError") {
    console.error("Fetch timeout:", err)
  } else if (err instanceof Error && err.message.includes("HTTP Error: 404")) {
    showError(
      state.username === ""
        ? "Enter your chess.com username"
        : `User '${state.username}' not found`
    )
  } else {
    throw err
  }
}

// Handle username change event
function onUsernameChange() {
  showSuccess(`Set username to ${state.username}`)
  for (const mode in state.modes) {
    state.modes[mode].lastRatingDiff = 0
    state.modes[mode].initialRating = null
    state.modes[mode].score = {
      wins: 0,
      losses: 0,
      draws: 0
    }
  }
  state.processedGameUUIDs = []
  state.scriptStartTime = Math.floor(Date.now() / 1000)
  init()
  saveState()
}

// Start periodic UI updates
function startInterval() {
  intervalId = setInterval(() => {
    // Skip if username is empty, in edit mode or currently updating
    if (!state.username || state.editMode || isRunning) return

    updateUi()
  }, INTERVAL_MS)
}

async function fetchAndUpdateRatings() {
  const ratings = await fetchAllCurrentRatings(state.username)
  if (ratings) {
    for (const mode in state.modes) {
      if (!state.modes[mode].initialRating || state.resetOnRestart) {
        state.modes[mode].initialRating = ratings[mode]
      }
    }
  }
  isRunning = true
  await updateUi()
  isRunning = false
}

async function init(loadSettings = false) {
  if (loadSettings) {
    loadState()
  }
  // Setze den Edit-Modus zurück
  state.editMode = false

  // Wenn Reset on Restart aktiv ist, werden Statistiken zurückgesetzt
  if (state.resetOnRestart) {
    state.scriptStartTime = Math.floor(Date.now() / 1000)
    state.processedGameUUIDs = []
    for (const mode in state.modes) {
      state.modes[mode].lastRatingDiff = 0
      state.modes[mode].score = { wins: 0, losses: 0, draws: 0 }
    }
  }

  // Initiale Bewertungen laden und setzen
  const ratings = await fetchAllCurrentRatings(state.username)
  if (ratings) {
    for (const mode in state.modes) {
      if (!state.modes[mode].initialRating || state.resetOnRestart) {
        state.modes[mode].initialRating = ratings[mode]
      }
    }
  }

  // UI-Update durchführen und Zustand speichern
  await updateUi()
  saveState()
}

// watch for changes in game mode
watch(
  () => state.gameMode,
  (newMode) => {
    showSuccess(`Game mode changed to ${newMode}`)
    updateUi()
  }
)

onMounted(() => {
  init(true)
  startInterval()
})

// Cleanup interval on component unmount
onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.wld {
  font-size: 2.5rem;
  letter-spacing: 0.1rem;
}

.rating {
  font-size: 2rem;
}
</style>
