export const COLOR_GREEN = "#4caf50"
export const COLOR_RED = "#f44336"
export const COLOR_WHITE = "#ffffff"
export const ANIMATION_DURATION = 700
export const CHESS_COM_TIMEZONE = "America/Los_Angeles"
export const CHESS_API_URL = "https://api.chess.com/pub/player"
export const REPO_URL = "https://github.com/thieleju/chess-com-obs-overlay"
export const REPO_MAINTAINER = "thieleju"
export const INTERVAL_MS = 6000
export const FETCH_HARD_TIMEOUT = INTERVAL_MS - 100

export interface Score {
  wins: number
  losses: number
  draws: number
}

export interface ModeState {
  score: Score
  initialRating: number | null
  lastRatingDiff: number
}

export interface State {
  username: string
  gameMode: "rapid" | "blitz" | "bullet"
  showEloDiff: boolean
  editMode: boolean
  resetOnRestart: boolean
  scriptStartTime: number
  processedGameUUIDs: string[]
  scoreFormat: "wld" | "wdl"
  centerElements: boolean
  modes: {
    rapid: ModeState
    blitz: ModeState
    bullet: ModeState
  }
}

export const STATE_DEFAULT: State = {
  username: "",
  gameMode: "rapid",
  showEloDiff: true,
  editMode: false,
  resetOnRestart: true,
  scriptStartTime: Math.floor(Date.now() / 1000),
  processedGameUUIDs: [],
  scoreFormat: "wld",
  centerElements: false,
  modes: {
    rapid: {
      score: { wins: 0, losses: 0, draws: 0 },
      initialRating: null,
      lastRatingDiff: 0
    },
    blitz: {
      score: { wins: 0, losses: 0, draws: 0 },
      initialRating: null,
      lastRatingDiff: 0
    },
    bullet: {
      score: { wins: 0, losses: 0, draws: 0 },
      initialRating: null,
      lastRatingDiff: 0
    }
  }
}
