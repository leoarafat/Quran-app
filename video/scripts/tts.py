"""Voiceover, one clip per sentence, so every subtitle matches its audio exactly.
Bangla: bn-BD-PradeepNeural. Arabic duas: ar-SA-HamedNeural, read slowly so viewers can follow.
Writes public/vo/<hash>.mp3 and src/data/vo.<story>.json. Only changed sentences are made again.
Usage: <venv>/bin/python scripts/tts.py eid janaza"""
import asyncio, hashlib, json, os, re, subprocess, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = {"bn": ("bn-BD-PradeepNeural", "-6%", "+0Hz"), "ar": ("ar-SA-HamedNeural", "-24%", "-2Hz")}


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[।?!])\s+", text) if s.strip()]


def measure(path):
    """Length of the clip, and where the speech really starts and ends (the service pads with silence)."""
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                               capture_output=True, text=True, check=True).stdout)
    log = subprocess.run(["ffmpeg", "-i", path, "-af", "silencedetect=noise=-45dB:d=0.08", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    head = ends[0] if starts and starts[0] <= 0.02 and ends else 0.0
    tail = dur
    if starts and (len(ends) < len(starts) or ends[-1] >= dur - 0.05):
        tail = starts[-1]
    return round(max(0, head - 0.04), 3), round(min(dur, tail + 0.12), 3)


async def clip(lang, text, sem):
    voice, rate, pitch = VOICES[lang]
    key = hashlib.sha1(f"{voice}|{rate}|{pitch}|{text}".encode()).hexdigest()[:14]
    path = os.path.join(ROOT, "public/vo", key + ".mp3")
    async with sem:
        if not os.path.exists(path):
            for attempt in range(5):
                try:
                    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(path + ".part")
                    os.replace(path + ".part", path)
                    break
                except Exception as error:  # the service drops connections now and then
                    if attempt == 4:
                        raise
                    print("  retry", error)
                    await asyncio.sleep(2 + attempt * 2)
    start, end = measure(path)
    return {"lang": lang, "text": text, "file": f"vo/{key}.mp3", "start": start, "end": end}


async def main(story):
    scenes = json.load(open(os.path.join(ROOT, f"src/data/story.{story}.json")))["scenes"]
    os.makedirs(os.path.join(ROOT, "public/vo"), exist_ok=True)
    sem = asyncio.Semaphore(4)
    out, total = {}, 0
    for scene in scenes:
        jobs = []
        for line in scene["say"]:
            if isinstance(line, dict):
                jobs.append(clip("ar", line["ar"], sem))
            else:
                jobs.extend(clip("bn", s, sem) for s in sentences(line))
        out[scene["id"]] = await asyncio.gather(*jobs)
        spoken = sum(c["end"] - c["start"] for c in out[scene["id"]])
        total += spoken
        print(f"  {scene['id']}  {spoken:5.1f}s  {len(out[scene['id']])} clips")
    json.dump(out, open(os.path.join(ROOT, f"src/data/vo.{story}.json"), "w"), ensure_ascii=False, indent=1)
    print(story, "speech", round(total), "s")


for name in sys.argv[1:] or ["eid", "janaza"]:
    asyncio.run(main(name))
