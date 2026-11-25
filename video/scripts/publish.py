"""Uploads the rendered videos and posters to Cloudflare R2, then writes the app's src/lib/videos.json.
Keys come from an env file that stays outside this repository; they are never printed.
Usage: python3 video/scripts/publish.py <env file with R2_*> <public base URL of the bucket>"""
import datetime, hashlib, hmac, json, os, subprocess, sys, urllib.request

VIDEO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = dict(line.strip().split("=", 1) for line in open(sys.argv[1]) if line.startswith("R2_") and "=" in line)
env = {k: v.strip().strip("\"'") for k, v in env.items()}
PUBLIC = sys.argv[2].rstrip("/")


def put(key, data, content_type):
    endpoint = env["R2_ENDPOINT"].rstrip("/")
    host, path = endpoint.split("//", 1)[1], f"/{env['R2_BUCKET_NAME']}/{key}"
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    body = hashlib.sha256(data).hexdigest()
    headers = {"cache-control": "public, max-age=31536000, immutable", "content-type": content_type,
               "host": host, "x-amz-content-sha256": body, "x-amz-date": now}
    signed = ";".join(sorted(headers))
    canonical = "\n".join(["PUT", path, "", "".join(f"{k}:{headers[k]}\n" for k in sorted(headers)), signed, body])
    region = env.get("R2_REGION") or "auto"
    scope = f"{now[:8]}/{region}/s3/aws4_request"
    to_sign = "\n".join(["AWS4-HMAC-SHA256", now, scope, hashlib.sha256(canonical.encode()).hexdigest()])
    secret = ("AWS4" + env["R2_SECRET_ACCESS_KEY"]).encode()
    for piece in scope.split("/"):
        secret = hmac.new(secret, piece.encode(), hashlib.sha256).digest()
    headers["authorization"] = (f"AWS4-HMAC-SHA256 Credential={env['R2_ACCESS_KEY_ID']}/{scope}, SignedHeaders={signed}, "
                                f"Signature={hmac.new(secret, to_sign.encode(), hashlib.sha256).hexdigest()}")
    urllib.request.urlopen(urllib.request.Request(endpoint + path, data=data, headers=headers, method="PUT"), timeout=600).close()
    return f"{PUBLIC}/{key}"


# Which hadith group page of the app each lesson belongs to.
LESSONS = {"eid": (486, "দুই ঈদের নামাজ: নিয়ম ও দোয়া"), "janaza": (495, "জানাজার নামাজ: নিয়ম ও দোয়া")}
out = {}
for name, (category, title) in LESSONS.items():
    timeline = json.load(open(os.path.join(VIDEO, f"src/data/timeline.{name}.json")))
    entry = {"id": name, "category": category, "title": title}
    for field, filename, ext, content_type in (("url", f"{name}.mp4", "mp4", "video/mp4"), ("poster", f"{name}-poster.jpg", "jpg", "image/jpeg")):
        data = open(os.path.join(VIDEO, "out", filename), "rb").read()
        # The content hash in the name lets the file be cached forever; a new render gets a new address.
        entry[field] = put(f"noor-quran/videos/{name}-{hashlib.sha256(data).hexdigest()[:10]}.{ext}", data, content_type)
        if field == "url":
            entry["bytes"] = len(data)
        print(name, field, len(data), entry[field])
    entry["seconds"] = timeline["total"] // timeline["fps"]
    entry["chapters"] = [{"title": c["title"], "at": c["from"] // timeline["fps"]} for c in timeline["chapters"]]
    out[name] = entry
json.dump(list(out.values()), open(os.path.join(VIDEO, "../src/lib/videos.json"), "w"), ensure_ascii=False, indent=1)
