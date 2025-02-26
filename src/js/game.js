export function mapResult(result) {
  switch (result) {
    case "win":
      return 1
    case "draw":
      return 0.5
    default:
      // Everything else is a loss
      return 0
  }
}

export function getScore(games, state, processedGameUUIDs, scriptStartTime) {
  // Create a copy of the current score
  const newScore = { ...state.modes[state.gameMode].score }
  if (!games || games.length === 0) return newScore
  // Only consider games that ended after the start time and match the current mode, and skip already processed games
  const gamesToCheck = games.filter(
    (game) =>
      game.end_time > scriptStartTime &&
      game.time_class === state.gameMode &&
      !processedGameUUIDs.has(game.uuid)
  )
  gamesToCheck.forEach((game) => {
    let userResult = null
    if (game.white.username.toLowerCase() === state.username.toLowerCase()) {
      userResult = mapResult(game.white.result)
    } else if (
      game.black.username.toLowerCase() === state.username.toLowerCase()
    ) {
      userResult = mapResult(game.black.result)
    }
    if (userResult === 1) newScore.wins += 1
    else if (userResult === 0) newScore.losses += 1
    else if (userResult === 0.5) newScore.draws += 1
    // Mark the game as processed
    processedGameUUIDs.add(game.uuid)
  })
  return newScore
}

export function animateEloDiff(newEloDiff, lastRatingDiff, callback) {
  const start = performance.now()
  const initialDiff = lastRatingDiff
  function animate(time) {
    const timeFraction = Math.min((time - start) / ANIMATION_DURATION, 1) // 700ms animation duration
    const ratingDiff = Math.floor(
      initialDiff + timeFraction * (newEloDiff - initialDiff)
    )
    callback(ratingDiff)
    if (timeFraction < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}
