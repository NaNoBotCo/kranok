#!/usr/bin/env python3
"""build.py — writes docs/index.html (English) and docs/th/index.html (Thai), sitemap.xml,
robots.txt and llms.txt. All copy, both languages, is written by hand in copy_text.py and copy_math.py.

Run:  python3 tools/build.py
"""
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from copy_text import UI, PHOTOS, SOURCES  # noqa: E402

DOCS = os.path.join(HERE, "..", "docs")
BASE = "https://nanobotco.github.io/kranok/"
E = html.escape
CSS = open(os.path.join(HERE, "site.css")).read()
GOOGLE_ESCAPE = '<script>if(/[.]translate[.]goog$/.test(location.hostname))location.replace("https://"+location.hostname.slice(0,-15).replace(/--/g,"~").replace(/-/g,".").replace(/~/g,"-")+location.pathname+location.search.replace(/([?&])_x_tr_[^&]*/g,"$1").replace(/[?&]+$/,"").replace(/[?]&+/,"?")+location.hash)</script>'


def paras(ps):
    return "".join(f"<p>{p}</p>" for p in ps)


def rng(id_, label, lo, hi, step, val, out=None):
    o = f' <b id="{out}"></b>' if out else ""
    return f'<label class="lab" for="{id_}">{E(label)}{o}</label><input id="{id_}" type="range" min="{lo}" max="{hi}" step="{step}" value="{val}">'


def page(lang):
    u = UI[lang]
    root = "" if lang == "en" else "../"
    url = BASE if lang == "en" else BASE + "th/"
    js = {k: u[k] for k in ("same_gap", "changes", "b_axis_y", "b_axis_x", "b_eye", "b_tip", "r_moves", "own_hint", "frieze", "steps", "part_names", "play", "pause")}
    js["lang"] = lang
    nav = "".join(f'<a href="#{a}">{E(b)}</a>' for a, b in u["nav"])
    ol = u["lang_other"]
    head = f'''<!doctype html><html lang="{lang}" translate="no" class="notranslate"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="google" content="notranslate">
{GOOGLE_ESCAPE}
<title>{E(u["title"])} · {E(u["other_title"])}</title>
<meta name="description" content="{E(u["desc"])}">
<meta name="theme-color" content="#120c0a">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{BASE}"><link rel="alternate" hreflang="th" href="{BASE}th/"><link rel="alternate" hreflang="x-default" href="{BASE}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Kranok, Drawn · กนก วาดด้วยคณิต">
<meta property="og:title" content="{E(u["title"])}"><meta property="og:description" content="{E(u["desc"])}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}card.jpg"><meta property="og:image:secure_url" content="{BASE}card.jpg"><meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{E(u["card_alt"])}">
<meta property="og:locale" content="{"en_US" if lang == "en" else "th_TH"}"><meta property="og:locale:alternate" content="{"th_TH" if lang == "en" else "en_US"}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{BASE}card.jpg">
<link rel="icon" href="{root}icon.svg" type="image/svg+xml">
<link rel="alternate" type="text/plain" href="{BASE}llms.txt" title="llms.txt">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Noto+Sans+Thai:wght@400;600;700&family=Noto+Serif+Thai:wght@600;700&display=swap" rel="stylesheet">
<script>if(/[?&]card/.test(location.search))document.documentElement.classList.add("card")</script>
<style>{CSS}</style>
</head><body>
<header class="top"><div class="in"><a class="brand" href="#top"><img src="{root}icon.svg" width="28" height="28" alt=""><span>{E(u["title"])}</span></a>
<nav aria-label="{E(u["nav_label"])}">{nav}</nav>
<span class="lang"><b>{E(u["lang_this"])}</b> | <a href="{ol[0]}" hreflang="{ol[2]}">{E(ol[1])}</a></span></div></header>
'''
    hero = f'''<section id="top" class="hero"><canvas id="scene" role="img" aria-label="{E(u["hero_alt"])}"></canvas>
<div class="hero-t"><p class="kick">{E(u["kicker"])}</p><h1>{E(u["title"])}</h1><p class="lede">{E(u["lede"])}</p><p class="cardline">{E(u["cardline"])}<br><span>nanobotco.github.io/kranok</span></p></div></section>
'''
    what = f'''<section id="kranok" class="sec"><div class="in"><p class="kick">{E(u["what_kick"])}</p><h2>{E(u["what_h"])}</h2>{paras(u["what_p"])}</div></section>
'''
    curl = f'''<section id="curl" class="sec dark"><div class="in two"><div><canvas id="curlcv" class="cv" role="img" aria-label="{E(u["curl_h"])}"></canvas></div>
<div><p class="kick">{E(u["curl_kick"])}</p><h2>{E(u["curl_h"])}</h2>{paras(u["curl_p"])}
<div class="seg" role="group"><button class="pill" type="button" data-curl="log" aria-pressed="true">{E(u["c_log"])}</button><button class="pill" type="button" data-curl="arch" aria-pressed="false">{E(u["c_arch"])}</button></div>
<div id="cbw">{rng("cb", u["c_b"], 0.06, 0.32, 0.005, 0.14)}</div>{rng("ct", u["c_t"], 1, 3.5, 0.05, 2.5)}
<div class="readout"><div><span>{E(u["c_r1"])}</span><b id="cr1">–</b></div><div><span>{E(u["c_r2"])}</span><b id="cr2">–</b></div></div>
<p class="note">{u["curl_note"]}</p></div></div></section>
'''
    bend = f'''<section id="bend" class="sec rock"><div class="in"><p class="kick">{E(u["bend_kick"])}</p><h2>{E(u["bend_h"])}</h2>{paras(u["bend_p"][:1])}
<canvas id="bendcv" class="cv" role="img" aria-label="{E(u["bend_h"])}"></canvas>
<div class="readout" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))"><div>{rng("bturns", u["b_turns"], 0.3, 2.4, 0.05, 1.15)}</div><div>{rng("bflick", u["b_flick"], -4, 16, 0.5, 7)}</div><div>{rng("bteeth", u["b_teeth"], 0, 6, 1, 3)}</div><div>{rng("bdepth", u["b_depth"], 0, 1.2, 0.05, 0.55)}</div></div>
{paras(u["bend_p"][1:])}</div></section>
'''
    three = f'''<section id="three" class="sec"><div class="in two"><div><canvas id="threecv" class="cv" role="img" aria-label="{E(u["three_h"])}"></canvas></div>
<div><p class="kick">{E(u["three_kick"])}</p><h2>{E(u["three_h"])}</h2>{paras(u["three_p"])}
<div class="steps" role="group" aria-label="{E(u["three_h"])}">{"".join(f'<button class="pill" type="button" data-step="{i}" aria-pressed="false">{i + 1}</button>' for i in range(len(u["steps"])))}<button id="tplay" class="pill hot" type="button">{E(u["play"])}</button></div>
<p id="steptext" class="steptext" aria-live="polite"></p><p class="note">{u["three_note"]}</p></div></div></section>
'''
    nest = f'''<section id="nest" class="sec dark"><div class="in two"><div><canvas id="nestcv" class="cv" role="img" aria-label="{E(u["nest_h"])}"></canvas></div>
<div><p class="kick">{E(u["nest_kick"])}</p><h2>{E(u["nest_h"])}</h2>{paras(u["nest_p"])}
{rng("ndepth", u["n_depth"], 0, 4, 1, 2)}{rng("nratio", u["n_ratio"], 0.25, 0.6, 0.01, 0.42)}
<div class="readout"><div><span>{E(u["n_count"])}</span><b id="ncount">–</b></div><div><span>{E(u["n_gold"])}</span><b id="ngold">–</b></div></div>
<p class="note">{u["nest_note"]}</p></div></div></section>
'''
    scroll = f'''<section id="scroll" class="sec rock"><div class="in"><p class="kick">{E(u["scroll_kick"])}</p><h2>{E(u["scroll_h"])}</h2>{paras(u["scroll_p"])}
<canvas id="scrollcv" class="cv" role="img" aria-label="{E(u["scroll_h"])}"></canvas>
<div class="btns"><button id="sgrow" class="pill hot" type="button">{E(u["s_grow"])}</button><button id="sbones" class="pill" type="button" aria-pressed="false">{E(u["s_bones"])}</button></div>
<div class="readout" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))"><div>{rng("swaves", u["s_waves"], 1, 6, 0.5, 3)}</div><div>{rng("sturns", u["s_turns"], 0.5, 2.4, 0.05, 1.3)}</div><div>{rng("sleaves", u["s_leaves"], 0, 8, 1, 5)}</div></div>
<p class="note">{u["scroll_note"]}</p></div></section>
'''
    fb = "".join(f'<button class="pill" type="button" data-f="{k}" aria-pressed="{"true" if k == "p1" else "false"}">{E(u["frieze"][k][0])}</button>' for k in ("p1", "p11g", "p1m1", "p11m", "p2", "p2mg", "p2mm"))
    border = f'''<section id="borders" class="sec dark"><div class="in"><p class="kick">{E(u["bord_kick"])}</p><h2>{E(u["bord_h"])}</h2>{paras(u["bord_p"])}
<canvas id="friezecv" class="cv" role="img" aria-label="{E(u["bord_h"])}"></canvas>
<div class="seg" role="group">{fb}</div><div class="fz"><b id="fname"></b><p id="fdesc"></p></div>
<div class="two" style="margin-top:46px"><div><canvas id="rosecv" class="cv" role="img" aria-label="{E(u["rose_h"])}"></canvas></div>
<div><h3>{E(u["rose_h"])}</h3>{paras(u["rose_p"])}{rng("rn", u["r_n"], 2, 12, 1, 4)}
<div class="btns"><button id="rm" class="pill" type="button" aria-pressed="true">{E(u["r_mirror"])}</button></div>
<div class="readout"><div><span>{E(u["r_sym"])}</span><b id="rsym">–</b></div></div><p class="note">{u["rose_note"]}</p></div></div></div></section>
'''
    own = f'''<section id="draw" class="sec rock"><div class="in"><p class="kick">{E(u["own_kick"])}</p><h2>{E(u["own_h"])}</h2>{paras(u["own_p"])}
<canvas id="owncv" class="cv" role="img" aria-label="{E(u["own_hint"])}"></canvas>
<div class="btns"><button id="oseed" class="pill hot" type="button">{E(u["o_seed"])}</button><button id="oclear" class="pill" type="button">{E(u["o_clear"])}</button><button id="osave" class="pill" type="button">{E(u["o_save"])}</button></div></div></section>
'''
    figs = []
    for p in PHOTOS:
        licl = f'<a href="{p["license_url"]}">{E(p["license"])}</a>' if p.get("license_url") else E(p["license"])
        cap = p["caption_" + lang]
        figs.append(f'<figure><img loading="lazy" src="{root}img/{p["file"]}" width="{p["width"]}" height="{p["height"]}" alt="{E(cap)}"><figcaption>{E(cap)} <a href="{p["commons_page"]}">{E(p["author"])}</a> · {licl}</figcaption></figure>')
    where = f'''<section id="where" class="sec"><div class="in"><p class="kick">{E(u["where_kick"])}</p><h2>{E(u["where_h"])}</h2>{paras(u["where_p"])}
<div class="ph">{"".join(figs)}</div>
<h3 style="margin-top:42px">{E(u["lanna_h"])}</h3>{paras(u["lanna_p"])}</div></section>
'''
    words = "".join(f'<div><b>{E(a)}</b><i>{E(b)}</i><p>{E(c)}</p></div>' for a, b, c in u["words"])
    wd = f'''<section id="words" class="sec"><div class="in"><h2>{E(u["words_h"])}</h2><div class="glos">{words}</div></div></section>
'''
    src = "".join(f'<li><a href="{h}">{E(t)}</a></li>' for t, h in SOURCES)
    so = f'''<section id="sources" class="sec"><div class="in"><h2>{E(u["src_h"])}</h2><p>{E(u["src_p"])}</p><ul class="src">{src}</ul></div></section>
'''
    tail = f'''<footer class="bot"><div class="in">{E(u["foot"])} · <a href="https://github.com/NaNoBotCo/kranok">GitHub</a> · <a href="https://motdang.net/">motdang.net</a> · <a href="https://hongdam.net/">hongdam.net</a></div></footer>
<script>window.UI={json.dumps(js, ensure_ascii=False)};</script>
<script src="{root}kranok.js"></script><script src="{root}three.js"></script><script src="{root}app.js"></script><script src="{root}top.js"></script>
</body></html>
'''
    return head + "<main>" + hero + what + curl + bend + three + nest + scroll + border + own + where + wd + so + "</main>" + tail


def main():
    os.makedirs(os.path.join(DOCS, "th"), exist_ok=True)
    for lang, path in (("en", "index.html"), ("th", "th/index.html")):
        with open(os.path.join(DOCS, path), "w") as f:
            f.write(page(lang))
    with open(os.path.join(DOCS, "sitemap.xml"), "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                f'<url><loc>{BASE}</loc></url>\n<url><loc>{BASE}th/</loc></url>\n</urlset>\n')
    with open(os.path.join(DOCS, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
    u = UI["en"]
    strip = lambda s: html.unescape(__import__("re").sub("<[^>]+>", "", s))
    lines = ["# Kranok, Drawn · กนก วาดด้วยคณิต", "", u["desc"], "", f"English: {BASE}", f"Thai: {BASE}th/", ""]
    for key in ("what", "curl", "bend", "three", "nest", "scroll", "bord", "rose", "own", "where", "lanna"):
        lines += ["## " + strip(u[key + "_h"]), ""] + [strip(p) for p in u[key + "_p"]] + [""]
    lines += ["## Words", ""] + [f"- {a} ({b}): {c}" for a, b, c in u["words"]]
    lines += ["", "## Sources", ""] + [f"- {t}: {h}" for t, h in SOURCES]
    lines += ["", "## Licence", "", "Text CC BY 4.0, NaNoBotCo. Code MIT. Photographs keep their own licences, listed on the page.", ""]
    with open(os.path.join(DOCS, "llms.txt"), "w") as f:
        f.write("\n".join(lines))
    print("built en + th")


if __name__ == "__main__":
    main()
