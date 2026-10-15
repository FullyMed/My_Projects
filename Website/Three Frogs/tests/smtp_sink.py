"""Minimal SMTP sink for local testing.

Accepts every message PHP's mail() sends and saves it as NNN.eml in the given
folder instead of delivering it, so tests (and you) can read reset links,
verification links and booking emails.

Usage: python tests/smtp_sink.py <port> <output-folder>
"""
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 2525
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tmp", "mail")
os.makedirs(OUT, exist_ok=True)


class Handler(socketserver.StreamRequestHandler):
    def send(self, line):
        self.wfile.write((line + "\r\n").encode())

    def handle(self):
        self.send("220 sink ready")
        data_mode, buf = False, []
        while True:
            raw = self.rfile.readline()
            if not raw:
                return
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if data_mode:
                if line == ".":
                    n = len(os.listdir(OUT)) + 1
                    with open(os.path.join(OUT, f"{n:03d}.eml"), "w", encoding="utf-8") as f:
                        f.write("\n".join(buf))
                    buf, data_mode = [], False
                    self.send("250 OK")
                else:
                    buf.append(line[1:] if line.startswith("..") else line)
                continue
            cmd = line[:4].upper()
            if cmd in ("HELO", "EHLO"):
                self.send("250 sink")
            elif cmd == "DATA":
                data_mode = True
                self.send("354 go ahead")
            elif cmd == "QUIT":
                self.send("221 bye")
                return
            else:
                self.send("250 OK")


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler) as srv:
    print(f"SMTP sink on 127.0.0.1:{PORT}, saving to {OUT}", flush=True)
    srv.serve_forever()
