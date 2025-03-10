import {
  fetchData,
  fetchAllCurrentRatings,
  getGamesUrl,
  fetchGames
} from "../src/js/api.js"
import { DateTime } from "luxon"

describe("API functions", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("fetchData should return data for a successful fetch", async () => {
    const dummyData = { test: "data" }
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue(dummyData)
    }
    fetch.mockResolvedValue(response)

    const data = await fetchData("https://example.com", "testuser")
    expect(data).toEqual(dummyData)
    expect(fetch).toHaveBeenCalled()
  })

  it("fetchData should throw an error for a non-ok response", async () => {
    const response = {
      ok: false,
      status: 404
    }
    fetch.mockResolvedValue(response)
    await expect(fetchData("https://example.com", "testuser")).rejects.toThrow(
      "HTTP Error: 404"
    )
  })

  it("fetchAllCurrentRatings should return a ratings object", async () => {
    const dummyData = {
      chess_rapid: { last: { rating: 1500 } },
      chess_blitz: { last: { rating: 1400 } },
      chess_bullet: { last: { rating: 1300 } }
    }
    // Mock fetch to return dummyData
    jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(dummyData)
    })
    const ratings = await fetchAllCurrentRatings("TestUser")
    expect(ratings).toEqual({ rapid: 1500, blitz: 1400, bullet: 1300 })
    globalThis.fetch.mockRestore()
  })

  it("getGamesUrl should return the correct URL format", () => {
    const username = "TestUser"
    const url = getGamesUrl(username)
    const date = DateTime.local().setZone("America/Los_Angeles")
    const expectedMonth = date.month.toString().padStart(2, "0")
    const expectedYear = date.year
    expect(url).toContain(username.toLowerCase())
    expect(url).toContain(`${expectedYear}/${expectedMonth}`)
  })

  it("fetchGames should return a sorted games array", async () => {
    const dummyGames = [
      { uuid: "1", end_time: 2000 },
      { uuid: "2", end_time: 3000 },
      { uuid: "3", end_time: 1000 }
    ]
    const dummyData = { games: dummyGames }
    // Mock fetch to return dummyData
    jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(dummyData)
    })
    const games = await fetchGames("testuser")
    // Verify that games are sorted in descending order by end_time
    expect(games[0].end_time).toBe(3000)
    expect(games[1].end_time).toBe(2000)
    expect(games[2].end_time).toBe(1000)
    globalThis.fetch.mockRestore()
  })
})
