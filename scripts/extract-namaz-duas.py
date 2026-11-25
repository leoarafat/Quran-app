"""Arabic for the prayer lessons, cut by script from the verified HadeethEnc file so nothing is retyped.
Sana, ruku, sujud, tashahhud and durud are shared with the lesson videos (video/src/data/duas.json).
Usage: python3 scripts/extract-namaz-duas.py   → src/lib/namaz/duas.json"""
import json, os, re, sqlite3, tempfile, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tmp = tempfile.mkdtemp()
z = zipfile.ZipFile(os.path.join(ROOT, "data/raw/hadeethenc/hadeethenc-bn-sqlite.zip"))
z.extractall(tmp)
db = sqlite3.connect(os.path.join(tmp, z.namelist()[0]))
MARKS = re.compile(r"[ً-ٰٟـ]")
ALEF = str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا"})


def cut(hadith_id, first, last):
    """The slice of the hadith's Arabic from the words `first` to the end of `last` (matched ignoring vowel marks)."""
    text = db.execute("select hadeeth_ar from hadeeths where id=?", (hadith_id,)).fetchone()[0]
    bare, where = "", []
    for i, ch in enumerate(text):
        if not MARKS.match(ch):
            bare += ch.translate(ALEF)
            where.append(i)
    norm = lambda s: MARKS.sub("", s).translate(ALEF)
    a = bare.index(norm(first))
    b = bare.index(norm(last), a) + len(norm(last))
    end = where[b - 1] + 1
    while end < len(text) and MARKS.match(text[end]):
        end += 1
    return re.sub(r"[«»()“”\"]", "", text[where[a]:end]).strip()


CUTS = {
    "takbir": (5475, "الله أكبر", "الله أكبر"),
    "taawwuz": (3578, "أعوذ بالله", "من الشيطان"),
    "sami": (3727, "سمع الله", "لمن حمده"),
    "rabbana": (3727, "ربنا لك", "الحمد"),
    "jalsa": (10930, "اللهم اغفر لي", "وارزقني"),
    "jalsaShort": (65104, "رب اغفر لي", "رب اغفر لي، رب اغفر لي"),
    "refuge": (3103, "اللهم إني أعوذ", "المسيح الدجال"),
    "salam": (10945, "السلام عليكم", "ورحمة الله"),
    "istighfar": (10947, "أستغفر الله", "أستغفر الله"),
    "antasSalam": (10947, "اللهم أنت السلام", "والإكرام"),
    "ainni": (3518, "اللهم أعني", "عبادتك"),
    "subhanallah": (5475, "سبحان الله", "سبحان الله"),
    "alhamdulillah": (5475, "والحمد لله", "والحمد لله"),
}
out = {k: {"ar": cut(*v), "hadith": v[0]} for k, v in CUTS.items()}
# the joining "and" belongs to the hadith's list, not to the phrase itself
out["alhamdulillah"]["ar"] = out["alhamdulillah"]["ar"][out["alhamdulillah"]["ar"].index("ا"):]

shared = json.load(open(os.path.join(ROOT, "video/src/data/duas.json")))
for k in ("sana", "ruku", "sujud", "tashahhud", "durud"):
    out[k] = {"ar": shared[k]["ar"], "hadith": int(shared[k]["source"].split()[-1])}

json.dump(out, open(os.path.join(ROOT, "src/lib/namaz/duas.json"), "w"), ensure_ascii=False, indent=1)
for k, v in out.items():
    print(k, "|", v["ar"])
