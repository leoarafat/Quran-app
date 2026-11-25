"""Cuts every Arabic dua out of the verified HadeethEnc file by script, so nothing is retyped.
Two short duas are not in that file; they are listed in SOURCED with where each wording was checked.
Usage: python3 video/scripts/extract-duas.py   → video/src/data/duas.json"""
import json, os, re, sqlite3, tempfile, zipfile

VIDEO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tmp = tempfile.mkdtemp()
z = zipfile.ZipFile(os.path.join(VIDEO, "../data/raw/hadeethenc/hadeethenc-bn-sqlite.zip"))
z.extractall(tmp)
db = sqlite3.connect(os.path.join(tmp, z.namelist()[0]))
MARKS = re.compile(r"[ً-ٰٟ]")


def cut(hadith_id, first, last):
    """The slice of the hadith's Arabic from the words `first` up to the end of `last` (matched ignoring vowel marks)."""
    text = db.execute("select hadeeth_ar from hadeeths where id=?", (hadith_id,)).fetchone()[0]
    bare, where = "", []
    for i, ch in enumerate(text):
        if not MARKS.match(ch):
            bare += {"أ": "ا", "إ": "ا", "آ": "ا"}.get(ch, ch)
            where.append(i)
    norm = lambda s: MARKS.sub("", s).replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    a = bare.index(norm(first))
    b = bare.index(norm(last), a) + len(norm(last))
    end = where[b - 1] + 1
    while end < len(text) and MARKS.match(text[end]):
        end += 1
    return re.sub(r"[«»“”\"]", "", text[where[a]:end]).strip()


duas = {
    "sana": (10905, "سبحانك اللهم", "ولا إله غيرك"),
    "ruku": (3727, "سبحان ربي العظيم", "سبحان ربي العظيم"),
    "sujud": (3727, "سبحان ربي الأعلى", "سبحان ربي الأعلى"),
    "tashahhud": (3096, "التحيات لله", "عبده ورسوله"),
    "durud": (5377, "اللهم صل على محمد", "إنك حميد مجيد، اللهم بارك على محمد وعلى آل محمد، كما باركت على آل إبراهيم، إنك حميد مجيد"),
    "janaza": (5021, "اللهم اغفر", "ولا تفتنا بعده"),
}
out = {k: {"ar": cut(*v), "source": f"HadeethEnc {v[0]}"} for k, v in duas.items()}

SOURCED = {
    "child": ("اللَّهُمَّ اجْعَلْهُ لَنَا فَرَطًا، وَاجْعَلْهُ لَنَا أَجْرًا وَذُخْرًا، وَاجْعَلْهُ لَنَا شَافِعًا وَمُشَفَّعًا",
              "al-Hidaya (Hanafi), checked at https://islamqa.org/hanafi/islamicportal/118111/source-for-duaa-in-childs-janazah-salah/"),
    "eidTakbir": ("اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ",
                  "wording checked at https://islamqa.info/bn/answers/158543"),
}
out.update({k: {"ar": ar, "source": src} for k, (ar, src) in SOURCED.items()})
json.dump(out, open(os.path.join(VIDEO, "src/data/duas.json"), "w"), ensure_ascii=False, indent=1)
for k, v in out.items():
    print(k, "|", v["ar"])
