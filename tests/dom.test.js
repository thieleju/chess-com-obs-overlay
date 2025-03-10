import {
  getDomElements,
  setWld,
  setRatingDiff,
  setScoreFormat,
  setCentered,
  setGameModeButtonActive,
  setShowRatingDiff,
  setResetOnRestart,
  setEditMode,
  setUserNameInput,
  showSuccessMessage,
  showErrorMessage,
  animateEloDiff
} from "../src/js/dom.js"

describe("DOM functions", () => {
  let elements

  beforeEach(() => {
    // Set up our document body with required elements
    document.body.innerHTML = `
      <div id="mainContainer" class="container"></div>
      <div id="wld"></div>
      <div id="ratingDiff"></div>
      <div class="rating"></div>
      <div id="editMode"></div>
      <button id="reset"></button>
      <div id="errorMessage"></div>
      <div id="successMessage"></div>
      <input id="usernameInput" type="text" />
      <input id="toggleElo" type="checkbox" />
      <div id="eloDiffContainer" style="display: none"></div>
      <input id="toggleResetOnRestart" type="checkbox" />
      <select id="selectScoreFormat">
        <option value="wld" selected>W/L/D</option>
        <option value="wdl">W/D/L</option>
      </select>
      <input id="toggleCenter" type="checkbox" />
      <button id="rapid"></button>
      <button id="blitz"></button>
      <button id="bullet"></button>
    `
    elements = {
      body: document.body,
      wld: document.getElementById("wld"),
      ratingDiff: document.getElementById("ratingDiff"),
      rating: document.querySelector(".rating"),
      editMode: document.getElementById("editMode"),
      reset: document.getElementById("reset"),
      errorMessage: document.getElementById("errorMessage"),
      successMessage: document.getElementById("successMessage"),
      usernameInput: document.getElementById("usernameInput"),
      toggleElo: document.getElementById("toggleElo"),
      eloDiffContainer: document.getElementById("eloDiffContainer"),
      toggleResetOnRestart: document.getElementById("toggleResetOnRestart"),
      mainContainer: document.getElementById("mainContainer"),
      selectScoreFormat: document.getElementById("selectScoreFormat"),
      toggleCenter: document.getElementById("toggleCenter"),
      modes: {
        rapid: document.getElementById("rapid"),
        blitz: document.getElementById("blitz"),
        bullet: document.getElementById("bullet")
      }
    }
  })

  it("getDomElements should return proper elements", () => {
    const domElements = getDomElements()
    expect(domElements).toHaveProperty("wld")
    expect(domElements).toHaveProperty("ratingDiff")
    expect(domElements).toHaveProperty("usernameInput")
  })

  it('setWld should update innerHTML based on scoreFormat "wdl"', () => {
    setWld(elements, 3, 1, 2, "wdl")
    expect(elements.wld.innerHTML).toBe("3 / 2 / 1")
  })

  it('setWld should update innerHTML based on scoreFormat "wld"', () => {
    setWld(elements, 3, 2, 1, "wld")
    expect(elements.wld.innerHTML).toBe("3 / 2 / 1")
  })

  it("setRatingDiff should update innerHTML and color for positive diff", () => {
    setRatingDiff(elements, 10)
    expect(elements.ratingDiff.innerHTML).toBe("+10")
    // The browser may convert hex to rgb; adjust the expected value if needed
    expect(elements.ratingDiff.style.color).toBe("rgb(76, 175, 80)")
  })

  it("setRatingDiff should update innerHTML and color for zero diff", () => {
    setRatingDiff(elements, 0)
    expect(elements.ratingDiff.innerHTML).toBe("+0")
  })

  it("setRatingDiff should update innerHTML and color for negative diff", () => {
    setRatingDiff(elements, -5)
    expect(elements.ratingDiff.innerHTML).toBe("-5")
    expect(elements.ratingDiff.style.color).toBe("rgb(244, 67, 54)")
  })

  it("setScoreFormat should set the value of selectScoreFormat", () => {
    setScoreFormat(elements, "wld")
    expect(elements.selectScoreFormat.value).toBe("wld")
  })

  it("setCentered should toggle classes and checkbox based on isCentered", () => {
    setCentered(elements, true)
    expect(elements.toggleCenter.checked).toBe(true)
    expect(elements.mainContainer.classList.contains("d-flex")).toBe(true)
    expect(elements.mainContainer.classList.contains("flex-column")).toBe(true)
    expect(
      elements.mainContainer.classList.contains("align-items-center")
    ).toBe(true)

    setCentered(elements, false)
    expect(elements.toggleCenter.checked).toBe(false)
  })

  it("setGameModeButtonActive should set active class on the selected mode", () => {
    // Initially add active class to rapid button
    elements.modes.rapid.classList.add("active")
    setGameModeButtonActive(elements, "blitz")
    expect(elements.modes.rapid.classList.contains("active")).toBe(false)
    expect(elements.modes.blitz.classList.contains("active")).toBe(true)
  })

  it("setShowRatingDiff should show or hide eloDiffContainer based on showEloDiff", () => {
    setShowRatingDiff(elements, true)
    expect(elements.toggleElo.checked).toBe(true)
    expect(elements.eloDiffContainer.style.display).toBe("block")

    setShowRatingDiff(elements, false)
    expect(elements.toggleElo.checked).toBe(false)
    expect(elements.eloDiffContainer.style.display).toBe("none")
  })

  it("setResetOnRestart should update the checked state of toggleResetOnRestart", () => {
    setResetOnRestart(elements, true)
    expect(elements.toggleResetOnRestart.checked).toBe(true)
    setResetOnRestart(elements, false)
    expect(elements.toggleResetOnRestart.checked).toBe(false)
  })

  it("setEditMode should update the display property of editMode", () => {
    setEditMode(elements, true)
    expect(elements.editMode.style.display).toBe("block")
    setEditMode(elements, false)
    expect(elements.editMode.style.display).toBe("none")
  })

  it("setUserNameInput should update the value of usernameInput", () => {
    setUserNameInput(elements, "testuser")
    expect(elements.usernameInput.value).toBe("testuser")
  })

  it("showSuccessMessage should display message and clear it after timeout", () => {
    jest.useFakeTimers()
    showSuccessMessage(elements, "Success!")
    expect(elements.successMessage.innerHTML).toBe("Success!")
    jest.advanceTimersByTime(1000)
    expect(elements.successMessage.innerHTML).toBe("")
    jest.useRealTimers()
  })

  it("showErrorMessage should display an error message", () => {
    showErrorMessage(elements, "Error occurred")
    expect(elements.errorMessage.innerHTML).toBe("Error occurred")
  })

  it("animateEloDiff should call callback with updated values", (done) => {
    const callback = jest.fn()
    animateEloDiff(elements, 20, 10, callback)
    // Wait for the animation to complete
    setTimeout(() => {
      expect(callback).toHaveBeenCalled()
      done()
    }, 800)
  })
})
