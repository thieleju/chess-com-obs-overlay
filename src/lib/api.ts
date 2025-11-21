import { DateTime } from "luxon"
import {
  CHESS_API_URL,
  CHESS_COM_PLAYER_API_URL,
  FETCH_HARD_TIMEOUT,
  CHESS_COM_TIMEZONE,
  REPO_URL,
  REPO_MAINTAINER
} from "./constants"

export async function fetchData<T>(url: string, username: string): Promise<T> {
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

export async function fetchAllCurrentRatings(
  username: string
): Promise<Ratings> {
  const statsUrl = `${CHESS_COM_PLAYER_API_URL}/${username.toLowerCase()}/stats`
  const data = await fetchData<PlayerStatsResponse>(statsUrl, username)
  return {
    rapid: data?.chess_rapid?.last?.rating || 0,
    blitz: data?.chess_blitz?.last?.rating || 0,
    bullet: data?.chess_bullet?.last?.rating || 0
  }
}

export async function fetchGames(username: string): Promise<ChessGame[]> {
  const url = `${CHESS_API_URL}?locale=en&username=${username.toLowerCase()}&page=1&rated=rated&timeSort=desc&location=live`
  const data = await fetchData<ChessGamesResponse>(url, username)
  return data?.data || []
}

function getUserAgent(username: string): string {
  return `chess-com-obs-overlay (username: ${username}; contact: ${REPO_MAINTAINER} (repository maintainer); github: ${REPO_URL})`
}
