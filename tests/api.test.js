/* eslint-disable no-undef */
import {
  fetchData,
  fetchAllCurrentRatings,
  getGamesUrl,
  fetchGames
} from "../src/js/api.js"

import { CHESS_API_URL } from "../src/js/constants.js"

// define fetch globally in tests to avoid ReferenceError: fetch is not defined
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ test: "data" })
  })
)

describe("fetchData", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    globalThis.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
  })

  test("returns data when response is ok", async () => {
    const fakeData = { key: "value" }
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData)
    })

    const url = "http://example.com"
    const username = "testuser"
    const dataPromise = fetchData(url, username)

    // Fast-forward timer so that the timeout does not trigger.
    jest.runAllTimers()

    const data = await dataPromise
    expect(data).toEqual(fakeData)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        signal: expect.any(Object),
        headers: expect.objectContaining({
          "User-Agent": expect.stringContaining(`username: ${username}`),
          "Accept-Encoding": "gzip"
        })
      })
    )
  })

  test("throws error when response is not ok", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({})
    })

    const url = "http://example.com"
    const username = "testuser"

    jest.runAllTimers()

    await expect(fetchData(url, username)).rejects.toThrow(/HTTP Error: 404/)
  })

  test("throws error when no data is returned", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    })

    const url = "http://example.com"
    const username = "testuser"

    jest.runAllTimers()

    await expect(fetchData(url, username)).rejects.toThrow(/No data received/)
  })
})

describe("fetchAllCurrentRatings", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  test("returns ratings correctly", async () => {
    const fakeData = {
      chess_rapid: { last: { rating: 1500 } },
      chess_blitz: { last: { rating: 1600 } },
      chess_bullet: { last: { rating: 1700 } }
    }

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData)
    })

    const username = "testuser"
    const ratings = await fetchAllCurrentRatings(username)
    expect(ratings).toEqual({ rapid: 1500, blitz: 1600, bullet: 1700 })
  })
})

describe("getGamesUrl", () => {
  test("returns a URL with the correct format", () => {
    const username = "testuser"
    const url = getGamesUrl(username)
    // Expected format: {CHESS_API_URL}/{username}/games/{year}/{month}
    const regex = new RegExp(
      `^${CHESS_API_URL}/${username}/games/\\d{4}/\\d{2}$`
    )
    expect(url).toMatch(regex)
  })
})

describe("fetchGames", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  test("returns sorted games array descending by end_time", async () => {
    const fakeGames = [
      { end_time: 100, uuid: "1" },
      { end_time: 300, uuid: "3" },
      { end_time: 200, uuid: "2" }
    ]
    const fakeData = { games: fakeGames }

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData)
    })

    const username = "testuser"
    const games = await fetchGames(username)
    // The games should be sorted in descending order by end_time: [300, 200, 100]
    expect(games).toEqual([
      { end_time: 300, uuid: "3" },
      { end_time: 200, uuid: "2" },
      { end_time: 100, uuid: "1" }
    ])
  })

  test("returns null if data contains a message", async () => {
    const fakeData = { message: "User not found" }

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeData)
    })

    const username = "testuser"
    const games = await fetchGames(username)
    expect(games).toBeNull()
  })
})
