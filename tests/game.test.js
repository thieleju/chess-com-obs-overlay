import { mapResult, getScore } from "../src/js/game.js"

describe("mapResult", () => {
  test("returns 1 for 'win'", () => {
    expect(mapResult("win")).toBe(1)
  })
  test("returns 0.5 for 'draw'", () => {
    expect(mapResult("draw")).toBe(0.5)
  })
  test("returns 0 for other values", () => {
    expect(mapResult("loss")).toBe(0)
    expect(mapResult("anything")).toBe(0)
  })
})

describe("getScore", () => {
  test("calculates the score correctly", () => {
    const state = {
      gameMode: "rapid",
      modes: {
        rapid: { score: { wins: 0, losses: 0, draws: 0 } }
      },
      username: "testuser"
    }
    const processedGameUUIDs = new Set()
    const scriptStartTime = 0
    const games = [
      {
        end_time: 100,
        time_class: "rapid",
        uuid: "1",
        white: { username: "testuser", result: "win" },
        black: { username: "other", result: "loss" }
      },
      {
        end_time: 200,
        time_class: "rapid",
        uuid: "2",
        white: { username: "other", result: "loss" },
        black: { username: "testuser", result: "draw" }
      },
      {
        end_time: 300,
        time_class: "blitz",
        uuid: "3",
        white: { username: "testuser", result: "win" },
        black: { username: "other", result: "loss" }
      }
    ]
    // Only the first two rapid games should count.
    const score = getScore(games, state, processedGameUUIDs, scriptStartTime)
    expect(score).toEqual({ wins: 1, losses: 0, draws: 1 })
  })
})
