# A static server with a long queue, for headless screenshots and the offline check (macOS).
# python3 -I scripts/dev/static-server.py "$PWD/out"   ->  http://127.0.0.1:5377
import sys, functools, http.server
class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
Server(("127.0.0.1", 5377), functools.partial(Quiet, directory=sys.argv[1])).serve_forever()
