"""Places every sentence on the clock. Usage: python3 scripts/timeline.py → src/data/timeline.<story>.json"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
f = lambda seconds: round(seconds * FPS)

for name in ("eid", "janaza"):
    load = lambda kind: json.load(open(os.path.join(ROOT, f"src/data/{kind}.{name}.json")))
    vo, scenes, t, chapters = load("vo"), [], 0, []
    for scene in load("story")["scenes"]:
        clips, at = [], f(1.2 if scene["kind"] == "title" else 0.55)
        for i, clip in enumerate(vo[scene["id"]]):
            if i:
                previous = vo[scene["id"]][i - 1]["lang"]
                # A breath before the Arabic, and room to repeat it afterwards.
                at += f(0.6 if clip["lang"] == "ar" else 1.1 if previous == "ar" else 0.22)
            dur = max(1, f(clip["end"] - clip["start"]))
            clips.append({**clip, "from": at, "dur": dur, "trim": f(clip["start"])})
            at += dur
        tail = 3.5 if scene["kind"] == "end" else 1.6 if scene["kind"] in ("overview", "compare", "dua") else 0.85
        length = at + f(tail)
        if scene["chapter"] and (not chapters or chapters[-1]["title"] != scene["chapter"]):
            chapters.append({"title": scene["chapter"], "from": t})
        scenes.append({**{k: v for k, v in scene.items() if k != "say"}, "from": t, "dur": length, "clips": clips})
        t += length
    json.dump({"fps": FPS, "total": t, "chapters": chapters, "scenes": scenes},
              open(os.path.join(ROOT, f"src/data/timeline.{name}.json"), "w"), ensure_ascii=False, indent=1)
    print(name, f"{t // FPS // 60}:{t // FPS % 60:02d}", [(c["title"], c["from"] // FPS) for c in chapters])
