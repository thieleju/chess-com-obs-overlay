import {
  CHESS_API_URL,
  FETCH_HARD_TIMEOUT,
  USER_AGENT,
  CHESS_COM_TIMEZONE
} from "./constants.js"
const { DateTime } = window.luxon

export async function fetchData(url) {
  // Create a controller for aborting fetch requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_HARD_TIMEOUT)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT }
    })
    clearTimeout(timeoutId)
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} for URL: ${url}`)
    }
    const data = await response.json()
    if (!data) throw new Error(`No data received for URL: ${url}`)
    return data
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

export async function fetchAllCurrentRatings(username) {
  const url = `${CHESS_API_URL}/${username}/stats`
  const data = await fetchData(url)
  if (!data) return null
  return {
    rapid: data?.chess_rapid?.last?.rating,
    blitz: data?.chess_blitz?.last?.rating,
    bullet: data?.chess_bullet?.last?.rating
  }
}

export function getGamesUrl(username) {
  const date = DateTime.local().setZone(CHESS_COM_TIMEZONE)
  const month = date.month.toString().padStart(2, "0")
  return `${CHESS_API_URL}/${username}/games/${date.year}/${month}`
}

export async function fetchGames(username) {
  const url = getGamesUrl(username)
  const data = await fetchData(url)
  if (!data || data.message) return null
  // Sort games by end_time in descending order
  return data?.games?.sort((a, b) => b.end_time - a.end_time) || []
}
