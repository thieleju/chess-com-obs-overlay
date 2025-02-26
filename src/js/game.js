import { ANIMATION_DURATION } from "./constants"

/**
 * Maps the result of a game to a score value
 * @param {string} result - The result of the game (win, draw, loss)
 * @returns {number} The score value for the result
 */
export function mapResult(result) {
  if (!result) return 0
  if (result === "win") {
    return 1
  }
  if (result === "draw") {
    return 0.5
  }
  return 0
}

/**
 * Calculate the score based on the games
 * @param {object[]} games - The games to calculate the score from
 * @param {object} state - The current state
 * @param {Set} processedGameUUIDs - The set of processed game UUIDs
 * @param {number} scriptStartTime - The start time of the script
 * @returns {object} The updated score
 */
export function getScore(games, state, processedGameUUIDs, scriptStartTime) {
  // Create a copy of the current score
  const newScore = state.modes[state.gameMode].score
  if (!games || games.length === 0) return newScore

  // Only consider games that ended after the start time and match the current mode, and skip already processed games
  const gamesToCheck = games.filter(
    (game) =>
      game.end_time > scriptStartTime &&
      game.time_class === state.gameMode &&
      !processedGameUUIDs.has(game.uuid)
  )

  for (const game of gamesToCheck) {
    let userResult = null
    if (game.white.username.toLowerCase() === state.username.toLowerCase()) {
      userResult = mapResult(game.white.result)
    } else if (
      game.black.username.toLowerCase() === state.username.toLowerCase()
    ) {
      userResult = mapResult(game.black.result)
    }

    switch (userResult) {
      case 1: {
        newScore.wins += 1
        break
      }
      case 0: {
        newScore.losses += 1
        break
      }
      case 0.5: {
        newScore.draws += 1
        break
      }
      default: {
        throw new Error("Invalid user result")
      }
    }
    // Mark the game as processed
    processedGameUUIDs.add(game.uuid)
  }
  return newScore
}

/**
 * Animate the difference in Elo ratings
 * @param {number} newEloDiff - The new Elo difference
 * @param {number} lastRatingDiff - The last rating difference
 * @param {object} elements - The DOM elements
 * @param {Function} callback - The callback function to update the rating difference
 */
export function animateEloDiff(newEloDiff, lastRatingDiff, elements, callback) {
  const start = performance.now()
  const initialDiff = lastRatingDiff

  requestAnimationFrame(function animate(time) {
    const timeFraction = Math.min((time - start) / ANIMATION_DURATION, 1)
    const ratingDiff = Math.floor(
      initialDiff + timeFraction * (newEloDiff - initialDiff)
    )

    callback(ratingDiff, elements)

    if (timeFraction < 1) requestAnimationFrame(animate)
  })
}
