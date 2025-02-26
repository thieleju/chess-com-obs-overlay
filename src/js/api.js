import {
  CHESS_API_URL,
  FETCH_HARD_TIMEOUT,
  CHESS_COM_TIMEZONE,
  REPO_URL,
  REPO_MAINTAINER
} from "./constants.js"

const { DateTime } = globalThis.luxon

/**
 * Fetch data
 * @param {string} url - The URL to fetch data from
 * @param {string} username - The username to fetch data for
 * @returns {Promise<object>} The fetched data
 */
export async function fetchData(url, username) {
  // Create a controller for aborting fetch requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_HARD_TIMEOUT)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": getUserAgent(username),
        "Accept-Encoding": "gzip"
      }
    })
    clearTimeout(timeoutId)
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} for URL: ${url}`)
    }
    const data = await response.json()
    if (!data) throw new Error(`No data received for URL: ${url}`)
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Fetch the current ratings
 * @param {string} username - The username to fetch the ratings for
 * @returns {Promise<object>} The current ratings
 */
export async function fetchAllCurrentRatings(username) {
  const url = `${CHESS_API_URL}/${username}/stats`
  const data = await fetchData(url, username)
  if (!data) return null
  return {
    rapid: data?.chess_rapid?.last?.rating,
    blitz: data?.chess_blitz?.last?.rating,
    bullet: data?.chess_bullet?.last?.rating
  }
}

/**
 * Get the URL for fetching the games
 * @param {string} username - The username of the chess.com user
 * @returns {Promise<string>} The URL for fetching the games
 */
export function getGamesUrl(username) {
  const date = DateTime.local().setZone(CHESS_COM_TIMEZONE)
  const month = date.month.toString().padStart(2, "0")
  return `${CHESS_API_URL}/${username}/games/${date.year}/${month}`
}

/**
 * Fetch the games
 * @param {string} username - The username to fetch the games for
 * @returns {Promise<object[]>} The fetched games
 */
export async function fetchGames(username) {
  const url = getGamesUrl(username)
  const data = await fetchData(url, username)
  if (!data || data.message) return null
  // Sort games by end_time in descending order
  return data?.games?.sort((a, b) => b.end_time - a.end_time) || []
}

/**
 * Get the user agent for the fetch requests
 * @param {string} username - The username to fetch data for
 * @returns {string} The user agent
 */
function getUserAgent(username) {
  return `chess-com-obs-overlay (username: ${username}; contact: ${REPO_MAINTAINER} (chess.com username of repository maintainer); github: ${REPO_URL})`
}
