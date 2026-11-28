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
    "khalaIn": (3150, "اللهم إني أعوذ", "والخبائث"),
    "khalaOut": (10046, "غفرانك", "غفرانك"),
    "wuduEnd": (8388, "أشهد أن لا إله", "عبد الله ورسوله"),
    "shahada": (6272, "أشهد أن لا إله", "عبده ورسوله"),
    "raditu": (6272, "رضيت بالله", "وبالإسلام دينا"),
    "tahlil": (5517, "لا إله إلا الله", "شيء قدير"),
    "tamjid": (10915, "سبحان الله", "العلي العظيم"),
    "iman": (4563, "أن تؤمن بالله", "خيره وشره"),
    "azanTakbir": (65086, "الله أكبر", "الله أكبر الله أكبر"),
    "azanTawhid": (65086, "أشهد أن لا إله", "إلا الله"),
    "azanRisalat": (65086, "أشهد أن محمدا", "رسول الله"),
    "azanSalah": (65086, "حي على الصلاة", "حي على الصلاة"),
    "azanFalah": (65086, "حي على الفلاح", "حي على الفلاح"),
    "azanFajr": (10616, "الصلاة خير", "من النوم"),
    "azanLast": (65086, "ثم قال: لا إله", "إلا الله"),
    "azanHawqala": (65086, "لا حول ولا قوة", "إلا بالله"),
    "azanDua": (10635, "اللهم رب هذه", "وعدته"),
    "maqaddamtu": (5471, "اللهم اغفر لي ما", "لا إله إلا أنت"),
    "sujudMaghfira": (5470, "اللهم اغفر لي ذنبي", "وسره"),
    "sayyidul": (5503, "اللهم أنت ربي", "فإنه لا يغفر الذنوب إلا أنت"),
    "ziyarat": (10407, "السلام على أهل الديار", "بكم للاحقون"),
    "taziyah": (3290, "إن لله ما أخذ", "بأجل مسمى"),
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
# the narrator gives two alternative phrasings inside the istikhara; keep the first wording and skip the "or he said" asides
out["istikhara"] = {"ar": "، ".join(cut(3293, a, b) for a, b in (("اللهم إني أستخيرك", "وعاقبة أمري"), ("فاقدره لي", "وعاقبة أمري"), ("فاصرفه عني", "ثم أرضني"))), "hadith": 3293}
# the joining "and" belongs to the hadith's list, not to the phrase itself
# the hadith introduces the closing line with "then he said"
out["azanLast"]["ar"] = out["azanLast"]["ar"].split(":", 1)[1].strip()
out["alhamdulillah"]["ar"] = out["alhamdulillah"]["ar"][out["alhamdulillah"]["ar"].index("ا"):]

shared = json.load(open(os.path.join(ROOT, "video/src/data/duas.json")))
for k in ("sana", "ruku", "sujud", "tashahhud", "durud"):
    out[k] = {"ar": shared[k]["ar"], "hadith": int(shared[k]["source"].split()[-1])}
out["janazaDua"] = {"ar": shared["janaza"]["ar"], "hadith": int(shared["janaza"]["source"].split()[-1])}

json.dump(out, open(os.path.join(ROOT, "src/lib/namaz/duas.json"), "w"), ensure_ascii=False, indent=1)
for k, v in out.items():
    print(k, "|", v["ar"])
