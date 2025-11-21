export {}

declare global {
  interface ChessGame {
    id: number
    baseTime1: number
    daysPerTurn: number
    timeIncrement: number
    user1Rating: number
    user2Rating: number
    user1Result: number
    user2Result: number
    gameTimeClass: string
    gameType: {
      name: string
      code: string
      isChess960: boolean
      isKingOfTheHill: boolean
      isThreeCheck: boolean
      isBughouse: boolean
      isCrazyHouse: boolean
    }
    user1: NewPlayer
    user2: NewPlayer
    isLive: boolean
    isVsComputer: boolean
    uuid: string
    fen: string
    moves: number
    highlightSquares: string
    gameEndTime: string
    user1Accuracy: number
    user2Accuracy: number
    isTournament: boolean
    isTeamMatch: boolean
    isTimeout: boolean
    isArena: boolean
  }

  interface NewPlayer {
    id: number
    title: string | null
    username: string
    countryId: number
    countryName: string
    membershipLevel: number
    flair: string | null
  }

  interface Player {
    rating: number
    result: string
    "@id": string
    username: string
    uuid: string
  }

  interface ChessGamesResponse {
    data: ChessGame[]
    meta: {
      totalCount: number
      countPerPage: number
      totalPages: number
      currentPage: number
    }
  }

  interface Score {
    wins: number
    losses: number
    draws: number
  }

  interface Ratings {
    rapid: number
    blitz: number
    bullet: number
  }

  interface ModeState {
    score: Score
    initialRating: number | null
    lastRatingDiff: number
  }

  interface State {
    username: string
    gameMode: "rapid" | "blitz" | "bullet"
    showEloDiff: boolean
    editMode: boolean
    resetOnRestart: boolean
    scriptStartId: number | null
    processedGameUUIDs: string[]
    scoreFormat: "wld" | "wdl"
    centerElements: boolean
    fontFamily: string
    lineHeight: number
    wordSpacing: number
    fontWeight: string
    fontStyle: string
    modes: {
      rapid: ModeState
      blitz: ModeState
      bullet: ModeState
    }
  }

  interface ChessStats {
    chess_daily?: ChessMode
    chess960_daily?: ChessMode
    chess_rapid?: ChessMode
    chess_bullet?: ChessMode
    chess_blitz?: ChessMode
    fide?: number
    tactics?: TacticsStats
    puzzle_rush?: PuzzleRushStats
  }

  interface ChessMode {
    last: RatingInfo
    best: BestRatingInfo
    record: GameRecord
  }

  interface RatingInfo {
    rating: number
    date: number
    rd: number
  }

  interface BestRatingInfo {
    rating: number
    date: number
    game: string
  }

  interface GameRecord {
    win: number
    loss: number
    draw: number
    time_per_move?: number
    timeout_percent?: number
  }

  interface TacticsStats {
    highest: RatingDate
    lowest: RatingDate
  }

  interface RatingDate {
    rating: number
    date: number
  }

  interface PuzzleRushStats {
    best: PuzzleRushBest
  }

  interface PuzzleRushBest {
    total_attempts: number
    score: number
  }

  interface PlayerStatsResponse {
    chess_rapid?: ChessMode
    chess_blitz?: ChessMode
    chess_bullet?: ChessMode
    chess_daily?: ChessMode
    chess960_daily?: ChessMode
    fide?: number
    tactics?: TacticsStats
    puzzle_rush?: PuzzleRushStats
  }
}
