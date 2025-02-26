/* eslint-disable no-undef */
import { fetchData } from "../src/js/api.js"

// Mock the global fetch function
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ test: "data" })
  })
)

describe("fetchData", () => {
  beforeEach(() => {
    fetch.mockClear()
  })
  test("returns data on successful fetch", async () => {
    const data = await fetchData("https://example.com", "testuser")
    expect(data).toEqual({ test: "data" })
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com",
      expect.any(Object)
    )
  })
})
