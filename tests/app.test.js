/* eslint-disable no-undef */

import { mapResult, getScore } from "../src/js/app.js"

describe("mapResult", () => {
  test("returns 1 for 'win'", () => {
    expect(mapResult("win")).toBe(1)
  })
  test("returns 0.5 for 'draw'", () => {
    expect(mapResult("draw")).toBe(0.5)
  })
  test("returns 0 for 'loss' and other values", () => {
    expect(mapResult("loss")).toBe(0)
    expect(mapResult("anything")).toBe(0)
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(mapResult(undefined)).toBe(0)
  })
})

describe("getScore", () => {
  let state
  let processedGameUUIDs
  let scriptStartTime

  beforeEach(() => {
    state = {
      username: "testuser",
      gameMode: "rapid",
      modes: {
        rapid: { score: { wins: 0, losses: 0, draws: 0 } }
      }
    }
    processedGameUUIDs = new Set()
    scriptStartTime = 0
  })

  test("calculates score correctly", () => {
    const games = [
      {
        end_time: 100,
        time_class: "rapid",
        uuid: "game1",
        white: { username: "testuser", result: "win" },
        black: { username: "other", result: "loss" }
      },
      {
        end_time: 200,
        time_class: "rapid",
        uuid: "game2",
        white: { username: "other", result: "loss" },
        black: { username: "testuser", result: "draw" }
      },
      {
        end_time: 300,
        time_class: "blitz", // Wrong mode – should be ignored
        uuid: "game3",
        white: { username: "testuser", result: "win" },
        black: { username: "other", result: "loss" }
      }
    ]
    const score = getScore(games, state, processedGameUUIDs, scriptStartTime)
    expect(score).toEqual({ wins: 1, losses: 0, draws: 1 })
  })
})

// TODO test updateUi
