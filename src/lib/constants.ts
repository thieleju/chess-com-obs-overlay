export const COLOR_GREEN = "#4caf50"
export const COLOR_RED = "#f44336"
export const COLOR_WHITE = "#ffffff"
export const ANIMATION_DURATION = 700
const CHESS_PROXY_BASE_URL = "https://obs-overlay.thieleju.workers.dev"
const CALLBACK_API_BASE = `${CHESS_PROXY_BASE_URL}/callback`
const PUB_API_BASE = `${CHESS_PROXY_BASE_URL}/pub`

export const CHESS_API_URL = `${CALLBACK_API_BASE}/games/extended-archive`
export const CHESS_COM_PLAYER_API_URL = `${PUB_API_BASE}/player`
export const CHESS_API_LOCALE = "en_US"
export const CHESS_API_DEFAULT_PAGE = 1

export const REPO_URL = "https://github.com/thieleju/chess-com-obs-overlay"
export const REPO_MAINTAINER = "thieleju"
export const INTERVAL_MS = 6000
export const FETCH_HARD_TIMEOUT = INTERVAL_MS - 100

export const STATE_DEFAULT: State = {
  username: "",
  gameMode: "rapid",
  showEloDiff: true,
  editMode: false,
  resetOnRestart: true,
  scriptStartId: null,
  processedGameUUIDs: [],
  scoreFormat: "wld",
  centerElements: false,
  fontFamily: "Nunito",
  fontWeight: "bold",
  fontStyle: "normal",
  lineHeight: 1.0,
  wordSpacing: -9,
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
