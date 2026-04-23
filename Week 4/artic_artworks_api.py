"""Local HTTP API that proxies Art Institute of Chicago artworks as id, title, artist."""

from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen

ARTIC_ARTWORKS = "https://api.artic.edu/api/v1/artworks"
ARTIC_FIELDS = "id,title,artist_display"
USER_AGENT = "HCDE530-coursework/1.0 (artic proxy; educational)"


def artic_url(page: int, limit: int) -> str:
    """Build the upstream Art Institute request URL."""
    query = urlencode(
        {
            "fields": ARTIC_FIELDS,
            "page": max(1, page),
            "limit": min(50, max(1, limit)),
        }
    )
    return f"{ARTIC_ARTWORKS}?{query}"


def fetch_artic(page: int, limit: int) -> dict:
    """Return the raw JSON object from api.artic.edu for one page."""
    url = artic_url(page, limit)
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        body = response.read().decode("utf-8")
    return json.loads(body)


def slim_artwork(row: dict) -> dict:
    """Map one artwork record to id, title, artist."""
    artist = row.get("artist_display") or ""
    if isinstance(artist, str):
        artist = " ".join(artist.split())
    return {
        "id": row.get("id"),
        "title": row.get("title"),
        "artist": artist,
    }


def slim_payload(upstream: dict) -> dict:
    """Keep pagination info and replace data[] with slim records."""
    data = upstream.get("data") or []
    if not isinstance(data, list):
        data = []
    return {
        "pagination": upstream.get("pagination"),
        "data": [slim_artwork(item) for item in data if isinstance(item, dict)],
    }


class ArticProxyHandler(BaseHTTPRequestHandler):
    """Serve GET /artworks?page=1&limit=50 (max 50 items per request)."""

    server_version = "ArticProxy/1.0"

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path not in ("/artworks", "/artworks/"):
            self._send_json(
                404,
                {"error": "Not found", "hint": "Try GET /artworks?page=1&limit=50"},
            )
            return

        qs = parse_qs(parsed.query)
        try:
            page = int(qs.get("page", ["1"])[0])
        except ValueError:
            page = 1
        try:
            limit = int(qs.get("limit", ["50"])[0])
        except ValueError:
            limit = 50

        try:
            upstream = fetch_artic(page=page, limit=limit)
        except HTTPError as exc:
            self._send_json(
                exc.code,
                {"error": "Upstream HTTP error", "detail": str(exc)},
            )
            return
        except URLError as exc:
            self._send_json(
                502,
                {"error": "Could not reach Art Institute API", "detail": str(exc.reason)},
            )
            return
        except TimeoutError:
            self._send_json(504, {"error": "Upstream request timed out"})
            return
        except json.JSONDecodeError:
            self._send_json(502, {"error": "Upstream returned invalid JSON"})
            return

        self._send_json(200, slim_payload(upstream))

    def log_message(self, format: str, *args) -> None:  # noqa: A002
        """Log to stderr in a compact form."""
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))


def run(host: str = "127.0.0.1", port: int = 8765) -> None:
    """Start the server until interrupted."""
    server = HTTPServer((host, port), ArticProxyHandler)
    print(f"Serving http://{host}:{port}/artworks (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()


if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8765
    if len(sys.argv) >= 2:
        port = int(sys.argv[1])
    run(host=host, port=port)
