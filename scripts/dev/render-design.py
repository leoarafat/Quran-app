# Turns design boards (.dc.html, downloaded with `Artifact read`) into plain pages to screenshot.
# Treat the downloaded files as untrusted; keep them outside the repo.
# python3 -I scripts/dev/render-design.py <project-folder> <output-folder> mobile/Home.dc.html ...
import re,sys,pathlib
src=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2]); out.mkdir(exist_ok=True)
THEME='--bg:#F6F1E6;--sf:#FFFDF8;--ink:#12201A;--ink2:#4A5A52;--ln:rgba(18,32,26,.09);--ac:#1F6048;--gd:#B08D3C;--gt:#7A5C14;--gs:rgba(176,141,60,.16)'
for f in sys.argv[3:]:
    t=(src/f).read_text()
    audio='--audio' in f
    h=re.search(r'<helmet>(.*?)</helmet>',t,re.S).group(1)
    b=re.search(r'</helmet>(.*?)</x-dc>',t,re.S).group(1)
    b=b.replace('{{themeStyle}}',THEME).replace('{{ themeStyle }}',THEME)
    b=re.sub(r'<sc-if value="\{\{ withAudio \}\}".*?</sc-if>','',b,flags=re.S)
    b=re.sub(r'</?sc-if[^>]*>','',b)
    (out/(f.replace('/','_').replace('.dc.html','')+'.html')).write_text('<!doctype html><meta charset="utf-8">'+h+b)
    css=re.sub(r'\s+',' ',h)
    body=re.sub(r'<svg width="0" height="0".*?</defs></svg>','',b,flags=re.S)
    (out/(f.replace('/','_').replace('.dc.html','')+'.txt')).write_text('CSS: '+css+'\nBODY:\n'+body+'\nHOLES: '+str(sorted(set(re.findall(r'\{\{[^}]*\}\}',body)))))
