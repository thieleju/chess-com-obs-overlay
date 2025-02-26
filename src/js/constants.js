export const COLOR_GREEN = "#4caf50"
export const COLOR_RED = "#f44336"
export const COLOR_WHITE = "#ffffff"
export const ANIMATION_DURATION = 700
export const CHESS_COM_TIMEZONE = "America/Los_Angeles"
export const CHESS_API_URL = "https://api.chess.com/pub/player"
// A shortened User-Agent – update if necessary
export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ..."
export const INTERVAL_MS = 6000
export const FETCH_HARD_TIMEOUT = 3000
export const STATE_DEFAULT = {
  username: "",
  gameMode: "rapid",
  editMode: false,
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
