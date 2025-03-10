import * as dom from "../src/js/dom.js"

import { updateUi, mapResult, handleError } from "../src/js/app.js"
import * as api from "../src/js/api.js"

process.env.NODE_ENV = "test"

jest.mock("../src/js/dom.js", () => ({
  getDomElements: jest.fn(),
  showErrorMessage: jest.fn(),
  setWld: jest.fn(),
  animateEloDiff: jest.fn(),
  setRatingDiff: jest.fn()
}))

jest.mock("../src/js/api.js", () => ({
  fetchGames: jest.fn(),
  fetchAllCurrentRatings: jest.fn()
}))

// Create a dummy DOM object that includes all properties needed by app.js
const dummyDom = {
  body: document.body,
  wld: { innerHTML: "" },
  ratingDiff: { innerHTML: "", style: {} },
  rating: {},
  editMode: { style: {} },
  reset: { disabled: false },
  errorMessage: { innerHTML: "" },
  successMessage: { innerHTML: "", dataset: {} },
  usernameInput: { value: "" },
  toggleElo: { checked: false },
  eloDiffContainer: { style: { display: "" } },
  toggleResetOnRestart: { checked: false },
  mainContainer: {
    classList: {
      toggle: jest.fn(),
      contains: jest.fn(() => false),
      add: jest.fn(),
      remove: jest.fn()
    }
  },
  selectScoreFormat: Object.assign(document.createElement("select"), {
    value: "wld",
    innerHTML: `<option value="wld">W/L/D</option><option value="wdl">W/D/L</option>`
  }),
  toggleCenter: { checked: false, addEventListener: jest.fn() },
  modes: {
    rapid: {
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false)
      }
    },
    blitz: {
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false)
      }
    },
    bullet: {
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false)
      }
    }
  }
}

// Set the dummy object for getDomElements BEFORE importing app.js so that the module-level variable "elements" is set correctly.
dom.getDomElements.mockReturnValue(dummyDom)

describe("mapResult", () => {
  it('should return 1 for "win"', () => {
    expect(mapResult("win")).toBe(1)
  })

  it("should return 0 for loss variants", () => {
    expect(mapResult("lose")).toBe(0)
    expect(mapResult("checkmated")).toBe(0)
    expect(mapResult("resigned")).toBe(0)
    expect(mapResult("timeout")).toBe(0)
    expect(mapResult("abandoned")).toBe(0)
    expect(mapResult("bughousepartnerlose")).toBe(0)
  })

  it("should return 0.5 for draw cases", () => {
    expect(mapResult("agreed")).toBe(0.5)
    expect(mapResult("timevsinsufficient")).toBe(0.5)
    expect(mapResult("repetition")).toBe(0.5)
    expect(mapResult("stalemate")).toBe(0.5)
    expect(mapResult("insufficient")).toBe(0.5)
    expect(mapResult("50move")).toBe(0.5)
  })

  it("should throw error for an invalid result", () => {
    expect(() => mapResult("invalid")).toThrow("Invalid result")
  })
})

describe("updateUi", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should call fetchGames and fetchAllCurrentRatings", async () => {
    // Setup mocks to return dummy data
    api.fetchGames.mockResolvedValue([])
    api.fetchAllCurrentRatings.mockResolvedValue({
      rapid: 1500,
      blitz: 1400,
      bullet: 1300
    })
    await updateUi()
    expect(api.fetchGames).toHaveBeenCalled()
    expect(api.fetchAllCurrentRatings).toHaveBeenCalled()
  })

  it("should handle errors in updateUi by propagating the error", async () => {
    // Force fetchGames to throw an error
    const error = new Error("Test error")
    api.fetchGames.mockRejectedValue(error)
    // Expect updateUi() to reject with the error (since handleError rethrows non-404 errors)
    await expect(updateUi()).rejects.toThrow("Test error")
  })
})

describe("handleError", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should log fetch timeout error for AbortError", () => {
    const error = new Error("AbortError")
    error.name = "AbortError"
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {})
    handleError(error)
    expect(consoleErrorSpy).toHaveBeenCalledWith("Fetch timeout:", error)
    consoleErrorSpy.mockRestore()
  })

  it("should show an error message for 404 errors", () => {
    // Instead of accessing properties of the element, we override showErrorMessage with a dummy function.
    jest.spyOn(dom, "showErrorMessage").mockImplementation(() => {})
    const error = new Error("HTTP Error: 404 for URL: test")
    handleError(error)
    expect(dom.showErrorMessage).toHaveBeenCalled()
  })
})
