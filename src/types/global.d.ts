export {};

declare global {
  interface ChessGame {
    url: string;
    pgn: string;
    time_control: string;
    end_time: number;
    rated: boolean;
    accuracies: {
      white: number;
      black: number;
    };
    tcn: string;
    uuid: string;
    initial_setup: string;
    fen: string;
    start_time: number;
    time_class: string;
    rules: string;
    white: Player;
    black: Player;
    eco: string;
  }

  interface Player {
    rating: number;
    result: string;
    "@id": string;
    username: string;
    uuid: string;
  }

  interface ChessGamesResponse {
    games: ChessGame[];
  }

  interface Score {
    wins: number;
    losses: number;
    draws: number;
  }

  interface Ratings {
    rapid: number;
    blitz: number;
    bullet: number;
  }

  interface ModeState {
    score: Score;
    initialRating: number | null;
    lastRatingDiff: number;
  }

  interface State {
    username: string;
    gameMode: "rapid" | "blitz" | "bullet";
    showEloDiff: boolean;
    editMode: boolean;
    resetOnRestart: boolean;
    scriptStartTime: number;
    processedGameUUIDs: string[];
    scoreFormat: "wld" | "wdl";
    centerElements: boolean;
    modes: {
      rapid: ModeState;
      blitz: ModeState;
      bullet: ModeState;
    };
  }

  interface ChessStats {
    chess_daily?: ChessMode;
    chess960_daily?: ChessMode;
    chess_rapid?: ChessMode;
    chess_bullet?: ChessMode;
    chess_blitz?: ChessMode;
    fide?: number;
    tactics?: TacticsStats;
    puzzle_rush?: PuzzleRushStats;
  }

  interface ChessMode {
    last: RatingInfo;
    best: BestRatingInfo;
    record: GameRecord;
  }

  interface RatingInfo {
    rating: number;
    date: number;
    rd: number;
  }

  interface BestRatingInfo {
    rating: number;
    date: number;
    game: string;
  }

  interface GameRecord {
    win: number;
    loss: number;
    draw: number;
    time_per_move?: number;
    timeout_percent?: number;
  }

  interface TacticsStats {
    highest: RatingDate;
    lowest: RatingDate;
  }

  interface RatingDate {
    rating: number;
    date: number;
  }

  interface PuzzleRushStats {
    best: PuzzleRushBest;
  }

  interface PuzzleRushBest {
    total_attempts: number;
    score: number;
  }
}
