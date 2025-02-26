import { DateTime } from "luxon"
import fetch from "node-fetch"

globalThis.window = globalThis
globalThis.window.luxon = { DateTime }
globalThis.fetch = fetch
