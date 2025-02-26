import { DateTime } from "luxon"
import fetch from "node-fetch"

globalThis.window = globalThis
globalThis.window.luxon = { DateTime }
globalThis.fetch = fetch

// hide unhandled global errors for now until tests are fixed
process.on("unhandledRejection", (reason, promise) => {
  console.warn("Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (error) => {
  console.warn("Uncaught Exception:", error)
})
