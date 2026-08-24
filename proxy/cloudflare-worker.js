export default {
    async fetch(request) {
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders()
            })
        }

        const requestUrl = new URL(request.url)
        const upstreamUrl = resolveUpstreamUrl(requestUrl)
        if (!upstreamUrl) {
            return jsonError(404, "Use /callback/* or /pub/* paths")
        }

        const upstreamRequest = new Request(upstreamUrl, {
            method: request.method,
            headers: sanitizeRequestHeaders(request.headers),
            body:
                request.method === "GET" || request.method === "HEAD"
                    ? undefined
                    : request.body,
            redirect: "follow"
        })

        const upstreamResponse = await fetch(upstreamRequest)
        const responseHeaders = new Headers(upstreamResponse.headers)
        responseHeaders.delete("set-cookie")
        applyCorsHeaders(responseHeaders)

        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: responseHeaders
        })
    }
}

function resolveUpstreamUrl(url) {
    if (url.pathname.startsWith("/callback/")) {
        return `https://www.chess.com${url.pathname}${url.search}`
    }
    if (url.pathname.startsWith("/pub/")) {
        return `https://api.chess.com${url.pathname}${url.search}`
    }
    return null
}

function sanitizeRequestHeaders(headers) {
    const out = new Headers(headers)
    out.delete("host")
    out.delete("origin")
    out.delete("referer")
    return out
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400"
    }
}

function applyCorsHeaders(headers) {
    const cors = corsHeaders()
    for (const [key, value] of Object.entries(cors)) {
        headers.set(key, value)
    }
}

function jsonError(status, message) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            ...corsHeaders()
        }
    })
}
