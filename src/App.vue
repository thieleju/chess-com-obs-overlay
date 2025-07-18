<template>
  <v-container
    fluid
    class="pa-0 ma-0"
    @click="toggleEditMode"
  >
    <!-- Snackbar for success and error messages -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarMessageColor"
      :location="state.centerElements ? 'top' : 'top'"
      :timeout="snackbarMessageColor === 'error' ? 3000 : 1000"
      variant="flat"
      rounded
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- WLD Score Display -->
    <v-row class="pa-0 ma-0 pointer">
      <v-col
        cols="12"
        class="pa-0 ma-0"
      >
        <div
          :class="{
            'text-center': state.centerElements,
            wld: true
          }"
          :style="textStyle"
        >
          {{ displayScore }}
        </div>
      </v-col>
    </v-row>

    <!-- Elo Difference Display -->
    <v-row
      v-if="state.showEloDiff"
      class="pa-0 ma-0 pointer"
    >
      <v-col
        cols="12"
        class="pa-0 ma-0"
      >
        <div
          :class="{
            'text-center': state.centerElements,
            rating: true
          }"
          :style="textStyle"
        >
          <span>Elo:&nbsp;</span>
          <span :style="{ color: ratingDiffColor }">
            {{ formattedRatingDiff }}
          </span>
        </div>
      </v-col>
    </v-row>

    <!-- Edit Mode Section -->
    <v-card
      v-show="state.editMode"
      class="dont-toggle"
    >
      <v-row class="pa-0 ma-0">
        <v-col
          cols="12"
          sm="4"
        >
          <v-btn-toggle
            v-model="state.gameMode"
            variant="outlined"
            dense
            mandatory
            @change="
              (event) =>
                showSnackbarMessage('success', 'Game mode set to ' + event)
            "
          >
            <v-btn
              value="rapid"
              hide-details
            >
              Rapid
            </v-btn>
            <v-btn
              value="blitz"
              hide-details
            >
              Blitz
            </v-btn>
            <v-btn
              value="bullet"
              hide-details
            >
              Bullet
            </v-btn>
          </v-btn-toggle>
        </v-col>

        <v-col
          cols="12"
          sm="4"
        >
          <v-btn-toggle
            v-model="state.scoreFormat"
            variant="outlined"
            class="mx-2"
          >
            <v-btn value="wld">
              W/L/D
            </v-btn>
            <v-btn value="wdl">
              W/D/L
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-btn
            variant="outlined"
            color="secondary"
            size="large"
            block
            :disabled="isResetting"
            prepend-icon="mdi-refresh"
            @click="resetStats"
          >
            Reset Stats
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="pa-0 ma-0">
        <v-col cols="12">
          <v-text-field
            v-model="state.username"
            dense
            hide-details
            label="Chess.com Username"
            variant="outlined"
            :rules="[(v) => !!v || 'Username is required']"
            @change="onUsernameChange"
          />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-select
            v-model="state.fontFamily"
            :items="fontFamilies"
            dense
            hide-details
            variant="outlined"
            label="Font Family"
          />
        </v-col>

        <v-col
          cols="12"
          sm="3"
        >
          <v-number-input
            :model-value="state.lineHeight"
            :min="0.8"
            :max="2"
            :step="0.1"
            :precision="1"
            label="Line Height"
            variant="outlined"
            hide-details
            @update:model-value="
              (value) => {
                state.lineHeight = value
              }
            "
          />
        </v-col>
        <v-col
          cols="12"
          sm="3"
        >
          <v-number-input
            :model-value="state.wordSpacing"
            :min="-20"
            :max="20"
            :step="1"
            label="Word Spacing"
            variant="outlined"
            hide-details
            @update:model-value="
              (value) => {
                state.wordSpacing = value
              }
            "
          />
        </v-col>

        <v-col
          cols="12"
          sm="2"
        >
          <v-btn-toggle
            v-model="activeStyles"
            variant="outlined"
            dense
            multiple
            class="d-flex justify-start"
          >
            <v-btn
              value="bold"
              icon="mdi-format-bold"
              size="x-large"
            />
            <v-btn
              value="italic"
              icon="mdi-format-italic"
              size="x-large"
            />
          </v-btn-toggle>
        </v-col>
      </v-row>

      <v-row
        class="pa-0 ma-0"
        align="center"
      >
        <v-col
          cols="12"
          sm="4"
        >
          <v-checkbox
            v-model="state.resetOnRestart"
            dense
            label="Reset Score on Restart"
            hide-details
          />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-checkbox
            v-model="state.showEloDiff"
            dense
            label="Show Elo ±"
            hide-details
          />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-checkbox
            v-model="state.centerElements"
            dense
            label="Centered"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>
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
const isResetting = ref(false)
const currentRatingDiff = ref(0)
const snackbar = ref(false)
const snackbarMessage = ref("")
const snackbarMessageColor = ref("success")
const activeStyles = ref<string[]>([])

const fontFamilies = [
  "Roboto",
  "Nunito",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "cursive",
  "fantasy"
]

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

const textStyle = computed(() => ({
  fontFamily: state.fontFamily,
  // height of the text elements
  lineHeight: state.lineHeight,
  // space between words
  wordSpacing: `${state.wordSpacing}px`,
  // font weight
  fontWeight: state.fontWeight,
  // font style
  fontStyle: state.fontStyle,
}))

let intervalId: ReturnType<typeof setInterval> | undefined
let isRunning: boolean = false

// Show success message
function showSnackbarMessage(type: "success" | "error", msg: string) {
  snackbarMessage.value = ""
  snackbarMessageColor.value = type
  snackbar.value = true
  snackbarMessage.value = msg
}

// Show error message
function showError(msg: string) {
  snackbarMessage.value = ""
  snackbarMessageColor.value = "error"
  snackbar.value = true
  snackbarMessage.value = msg
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
    } else {
      // If the rating difference is the same, just set it directly to handle mode changes
      currentRatingDiff.value = ratingDiff
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
    if (!s) throw new Error("No saved state found")

    const parsed = JSON.parse(s)

    // quick fix for backwards compatibility
    if (!Array.isArray(parsed.processedGameUUIDs))
      parsed.processedGameUUIDs = []
    if (!parsed.scoreFormat) parsed.scoreFormat = "wld"
    if (!parsed.fontFamily) parsed.fontFamily = "Roboto"
    if (!parsed.lineHeight) parsed.lineHeight = 1.5
    if (!parsed.wordSpacing) parsed.wordSpacing = 0
    if (!parsed.gameMode) parsed.gameMode = "rapid"
    if (!parsed.fontWeight) parsed.fontWeight = "normal"
    if (!parsed.fontStyle) parsed.fontStyle = "normal"

    // set font styles
    const stylesArray = [].concat(
      parsed.fontWeight === "bold" ? "bold" : "",
      parsed.fontStyle === "italic" ? "italic" : ""
    ).filter(Boolean)
    activeStyles.value = stylesArray

    Object.assign(state, parsed)

    console.log("Loaded state:", state)
  } catch (error: unknown) {
    console.error("Failed to load state:", error)
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
  if (target.closest(".dont-toggle")) return
  state.editMode = !state.editMode

  // hide scrollbar globally if edit mode is false
  if (!state.editMode) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = "auto"
  }
}

// Reset stats and update UI
async function resetStats() {
  isResetting.value = true
  showSnackbarMessage("success", "Resetting stats...")
  state.modes = JSON.parse(JSON.stringify(STATE_DEFAULT.modes))
  state.processedGameUUIDs = []
  state.scriptStartTime = Math.floor(Date.now() / 1000)
  currentRatingDiff.value = 0
  await init()
  isResetting.value = false
}

function handleError(err: unknown) {
  console.log(err)
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
  showSnackbarMessage("success", `Username set to ${state.username}`)
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
}

// Start periodic UI updates
function startInterval() {
  intervalId = setInterval(() => {
    // Skip if username is empty, in edit mode or currently updating
    if (!state.username || state.editMode || isRunning) return

    updateUi()
  }, INTERVAL_MS)
}

async function init(loadSettings = false) {
  try {
    if (loadSettings) {
      loadState()
    }
    state.editMode = false

    // Reset stats of all modes if reset on restart is enabled
    if (state.resetOnRestart) {
      // Only reset script start time if reset on restart is enabled to catch up on games played during the downtime
      state.scriptStartTime = Math.floor(Date.now() / 1000)
      state.processedGameUUIDs = []
      for (const mode in state.modes) {
        state.modes[mode].lastRatingDiff = 0
        state.modes[mode].score = { wins: 0, losses: 0, draws: 0 }
      }
    }

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
  } catch (error: unknown) {
    handleError(error)
  }
}

// watch for changes in state and save to localStorage
watch(
  () => state,
  () => saveState(),
  { deep: true }
)
// watch for changes in game mode show success message
watch(
  () => state.gameMode,
  (newMode) => {
    showSnackbarMessage("success", `Game mode set to ${newMode}`)
    updateUi()
  }
)
// watch for changes in wld/wdl format show success message
watch(
  () => state.scoreFormat,
  (newFormat) => {
    showSnackbarMessage("success", `Score format set to ${newFormat}`)
  }
)
// watch for changes in active styles and update state
watch(
  () => activeStyles.value,
  (newStyles) => {
    state.fontWeight = newStyles.includes("bold") ? "bold" : "normal"
    state.fontStyle = newStyles.includes("italic") ? "italic" : "normal"
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
html,
body {
  overflow: hidden;
}

.wld {
  font-size: 100px;
}

.rating {
  font-size: 50px;
}

.pointer {
  cursor: pointer;
}
</style>
