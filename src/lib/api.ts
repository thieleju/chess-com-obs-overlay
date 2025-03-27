import { DateTime } from "luxon"
import {
  CHESS_API_URL,
  FETCH_HARD_TIMEOUT,
  CHESS_COM_TIMEZONE,
  REPO_URL,
  REPO_MAINTAINER
} from "./constants"

export async function fetchData(url: string, username: string): Promise<any> {
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

export async function fetchAllCurrentRatings(username: string): Promise<any> {
  const url = `${CHESS_API_URL}/${username.toLowerCase()}/stats`
  const data = await fetchData(url, username)
  if (!data) return null
  return {
    rapid: data?.chess_rapid?.last?.rating,
    blitz: data?.chess_blitz?.last?.rating,
    bullet: data?.chess_bullet?.last?.rating
  }
}

export function getGamesUrl(username: string): string {
  const date = DateTime.local().setZone(CHESS_COM_TIMEZONE)
  const month = date.month.toString().padStart(2, "0")
  return `${CHESS_API_URL}/${username.toLowerCase()}/games/${date.year}/${month}`
}

export async function fetchGames(username: string): Promise<any[]> {
  const url = getGamesUrl(username)
  const data = await fetchData(url, username)
  if (!data || data.message) return []
  // Sort games by end_time in descending order
  return data?.games?.sort((a: any, b: any) => b.end_time - a.end_time) || []
}

function getUserAgent(username: string): string {
  return `chess-com-obs-overlay (username: ${username}; contact: ${REPO_MAINTAINER} (repository maintainer); github: ${REPO_URL})`
}
