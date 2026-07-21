#!/usr/bin/env python3
"""Generate The Rounds Studio hub (index.html) and sitemap.xml from projects.json.

Re-run after each demo goes live:  python3 build_hub.py
Only projects with "built": true (and a screenshot at assets/shots/<slug>.jpg) render as cards.
Hero = "Vitals": an airy porcelain clinical hero with a living ECG "practice rhythm" monitor
strip as the signature bottom edge. Calm, high-legibility, green accent.
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE = "https://buildpacelabs.github.io/the-rounds-studio"
TODAY = os.environ.get("BUILD_DATE", "2026-07-21")

with open(os.path.join(ROOT, "projects.json"), encoding="utf-8") as f:
    projects = json.load(f)

built = [p for p in projects if p.get("built")]
total = len(projects)

def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))

# ---- marquee specialty tags (dedup, keep order) ----
seen, tags = set(), []
for p in projects:
    c = p["cuisine"]
    if c not in seen:
        seen.add(c); tags.append(c)
marquee = "".join(f'<span>{esc(t)}</span><i aria-hidden="true">&bull;</i>' for t in tags) * 2

# ---- work cards ----
def card(p):
    slug = p["slug"]; shot = f"assets/shots/{slug}.jpg"
    has = os.path.exists(os.path.join(ROOT, shot))
    grad = f"linear-gradient(135deg,{p['from']},{p['to']})"
    if has:
        thumb = (f'<img src="{shot}" width="1440" height="900" loading="lazy" decoding="async" '
                 f'alt="Home page of {esc(p["brand"])}, a {esc(p["cuisine"].lower())} website built by The Rounds Studio">')
    else:
        thumb = f'<div class="thumb-fallback" style="background:{grad}"><span>{esc(p["brand"])}</span></div>'
    return f'''      <a class="card" href="{slug}/" aria-label="View the live {esc(p["brand"])} site">
        <span class="card-accent" style="background:{grad}" aria-hidden="true"></span>
        <div class="card-frame">
          <div class="card-chrome" aria-hidden="true"><span class="card-dots"><i></i><i></i><i></i></span><span class="card-url">{slug}</span></div>
          <div class="card-thumb">{thumb}
            <span class="card-open">View live<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
          </div>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-tag">{esc(p["cuisine"])}</span>
            <span class="card-geo">{esc(p["city"])}</span>
          </div>
          <h3 class="card-name">{esc(p["brand"])}</h3>
          <p class="card-desc">{esc(p.get("tagline",""))}</p>
        </div>
      </a>'''

cards_html = "\n".join(card(p) for p in built) if built else \
    '      <p class="grid-empty">The first practices are coming online now — check back shortly.</p>'

# ---- hero deck: three fanned website plates of the first live sites ----
def plate(p, cls, front=False):
    slug = p["slug"]; shot = f"assets/shots/{slug}.jpg"
    eager = 'fetchpriority="high"' if front else 'loading="lazy"'
    return (f'<figure class="plate {cls}">'
            f'<div class="bar" aria-hidden="true"><i></i><i></i><i></i><span class="url">{esc(slug)}</span></div>'
            f'<img src="{shot}" width="1440" height="900" {eager} decoding="async" '
            f'alt="{esc(p["brand"])} — {esc(p["cuisine"].lower())} website built by The Rounds Studio"></figure>')

if len(built) >= 3:
    hero_preview = (plate(built[0], "p-back") + plate(built[1], "p-mid") + plate(built[2], "p-front", front=True))
elif len(built) >= 1:
    hero_preview = plate(built[0], "p-front", front=True)
else:
    hero_preview = ""

og_image = f"{BASE}/assets/shots/{built[0]['slug']}.jpg" if built else f"{BASE}/assets/og-cover.png"

CSS = """
    :root{
      --porcelain:#F5F7F6; --paper:#FFFFFF; --ink:#101815; --slate:#586B63; --slate-2:#7B8B83;
      --pulse:#0B7A57; --pulse-deep:#095F44; --signal:#17B486; --line:#E3EAE6; --line-2:#EDF2EF;
      --shadow:26,40,34;
      --ease:cubic-bezier(.2,.7,.2,1); --sans:'Hanken Grotesk',system-ui,sans-serif;
      --mono:'Space Grotesk',ui-monospace,monospace;
    }
    *{margin:0;padding:0;box-sizing:border-box}
    html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
    body{font-family:var(--sans);background:var(--porcelain);color:var(--ink);line-height:1.6;
      -webkit-font-smoothing:antialiased;overflow-x:clip}
    a{color:inherit;text-decoration:none}
    img{max-width:100%;height:auto;display:block}
    .wrap{max-width:1240px;margin:0 auto;padding:0 clamp(22px,4vw,48px)}
    .mono{font-family:var(--mono)}
    ::selection{background:var(--pulse);color:#fff}
    :focus-visible{outline:2.5px solid var(--pulse);outline-offset:3px;border-radius:4px}

    .btn{display:inline-flex;align-items:center;gap:9px;font-family:var(--sans);font-weight:600;
      font-size:.96rem;padding:13px 22px;border-radius:11px;cursor:pointer;border:1px solid transparent;
      transition:transform .18s var(--ease),box-shadow .22s var(--ease),background .2s var(--ease),border-color .2s var(--ease);white-space:nowrap}
    .btn-primary{background:var(--pulse);color:#fff;box-shadow:0 8px 20px rgba(11,122,87,.26)}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(11,122,87,.32)}
    .btn-ghost{background:var(--paper);color:var(--ink);border-color:var(--line)}
    .btn-ghost:hover{transform:translateY(-2px);border-color:#c9d6cf;box-shadow:0 8px 18px rgba(38,64,52,.08)}

    /* ===== header (sticky, light) ===== */
    header{position:sticky;top:0;z-index:40;background:rgba(245,247,246,.86);
      backdrop-filter:saturate(150%) blur(12px);border-bottom:1px solid var(--line)}
    .nav{display:flex;align-items:center;gap:26px;height:74px}
    .brand{display:flex;align-items:center;gap:12px;font-weight:700}
    .mark{width:38px;height:38px;border-radius:11px;background:linear-gradient(160deg,#0E8A62,#0B6E4E);
      display:grid;place-items:center;flex:none;color:#fff;
      box-shadow:0 6px 16px rgba(11,122,87,.28),inset 0 1px 0 rgba(255,255,255,.22)}
    .mark svg{width:22px;height:22px}
    .brand .name{font-family:var(--mono);font-weight:700;font-size:1.06rem;letter-spacing:-.01em;color:var(--ink);line-height:1}
    .brand .sub{display:block;font-family:var(--mono);font-weight:500;font-size:.6rem;letter-spacing:.16em;
      text-transform:uppercase;color:var(--slate);margin-top:4px}
    .nav-links{display:flex;gap:30px;margin-left:auto;align-items:center}
    .nav-links a{font-size:.94rem;font-weight:500;color:var(--ink);position:relative;padding:4px 2px}
    .nav-links a::after{content:"";position:absolute;left:0;bottom:-2px;height:2px;width:0;background:var(--pulse);transition:width .28s var(--ease)}
    .nav-links a:hover::after{width:100%}
    .nav-cta{padding:11px 18px}
    @media(max-width:820px){.nav-links a:not(.nav-cta){display:none}}
    @media(max-width:620px){.brand .sub{display:none}}

    /* ===== HERO — Vitals ===== */
    .hero{position:relative;background:var(--porcelain);overflow:hidden;isolation:isolate}
    .hero::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
      background:
        radial-gradient(60% 62% at 88% 6%,rgba(23,180,134,.10),rgba(23,180,134,0) 60%),
        linear-gradient(to right,rgba(11,122,87,.045) 1px,transparent 1px),
        linear-gradient(to bottom,rgba(11,122,87,.045) 1px,transparent 1px);
      background-size:auto,26px 26px,26px 26px;
      -webkit-mask-image:linear-gradient(105deg,transparent 44%,#000 78%);mask-image:linear-gradient(105deg,transparent 44%,#000 78%)}
    .stage{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.06fr) minmax(0,1fr);
      gap:52px;align-items:center;padding:44px 0 56px}
    .copy{min-width:0}
    .eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-weight:500;
      font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);background:var(--paper);
      border:1px solid var(--line);padding:8px 14px 8px 11px;border-radius:100px;box-shadow:0 2px 8px rgba(38,64,52,.05)}
    .eyebrow .dot{width:9px;height:9px;border-radius:50%;background:var(--pulse);position:relative;flex:none}
    .eyebrow .dot::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--signal);opacity:.7;animation:ping 2.4s cubic-bezier(0,0,.2,1) infinite}
    @keyframes ping{0%{transform:scale(.5);opacity:.8}70%,100%{transform:scale(1.7);opacity:0}}

    .hero h1{font-family:var(--sans);font-weight:800;font-size:clamp(2.35rem,1.5rem+2.7vw,3.85rem);
      line-height:1.03;letter-spacing:-.022em;color:var(--ink);margin:20px 0 0;max-width:15ch;text-wrap:balance}
    .hero h1 .beat{color:var(--pulse);position:relative;white-space:nowrap}
    .hero h1 .beat svg{position:absolute;left:0;right:0;bottom:-.14em;width:100%;height:.34em;overflow:visible}
    .hero h1 .beat svg path{fill:none;stroke:var(--pulse);stroke-width:5;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;opacity:.9}
    .hero .lead{font-size:1.14rem;line-height:1.62;color:var(--slate);margin:22px 0 0;max-width:46ch;font-weight:400}
    .hero .lead strong{color:var(--ink);font-weight:600}
    .cta-row{display:flex;flex-wrap:wrap;gap:14px;margin-top:26px}
    .cta-row .btn{padding:14px 24px;font-size:1rem}

    .readout{display:flex;margin-top:26px;border-top:1px solid var(--line);padding-top:16px;max-width:520px}
    .readout .ch{padding-right:26px;margin-right:26px;position:relative}
    .readout .ch + .ch::before{content:"";position:absolute;left:0;top:2px;bottom:2px;width:1px;background:var(--line);transform:translateX(-26px)}
    .readout .lab{font-family:var(--mono);font-weight:500;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--pulse);display:block;margin-bottom:5px}
    .readout .val{font-size:.94rem;font-weight:600;color:var(--ink);line-height:1.25}

    .deck{position:relative;height:472px;display:flex;align-items:center;justify-content:center;min-width:0}
    .plate{position:absolute;width:376px;background:var(--paper);border:1px solid var(--line);border-radius:14px;
      overflow:hidden;box-shadow:0 22px 48px rgba(38,64,52,.15),0 4px 12px rgba(38,64,52,.08);
      transition:transform .5s var(--ease),box-shadow .5s var(--ease)}
    .plate .bar{height:30px;display:flex;align-items:center;gap:7px;padding:0 12px;border-bottom:1px solid var(--line);background:linear-gradient(var(--paper),#fbfdfc)}
    .plate .bar i{width:9px;height:9px;border-radius:50%;background:#dfe6e2;display:block}
    .plate .bar i:nth-child(1){background:#e7cfc9}.plate .bar i:nth-child(2){background:#ece3cf}.plate .bar i:nth-child(3){background:#cfe6da}
    .plate .bar .url{margin-left:8px;height:16px;flex:1;border-radius:5px;background:var(--porcelain);border:1px solid var(--line);
      display:flex;align-items:center;padding:0 8px;font-family:var(--mono);font-size:.56rem;letter-spacing:.03em;color:#9aa8a1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    .plate img{width:100%;aspect-ratio:1440/900;object-fit:cover;object-position:top center}
    .p-back{transform:translate(-118px,-56px) rotate(-7deg);z-index:1;filter:saturate(.96)}
    .p-mid{transform:translate(64px,-8px) rotate(4.5deg);z-index:2}
    .p-front{transform:translate(-30px,86px) rotate(-2deg);z-index:3;box-shadow:0 34px 66px rgba(38,64,52,.20),0 8px 18px rgba(38,64,52,.10)}
    .deck:hover .p-back{transform:translate(-134px,-64px) rotate(-8.5deg)}
    .deck:hover .p-mid{transform:translate(78px,-14px) rotate(6deg)}
    .deck:hover .p-front{transform:translate(-30px,80px) rotate(-1.5deg)}
    .chip{position:absolute;z-index:4;left:14px;bottom:6px;background:var(--ink);color:#fff;border-radius:12px;
      padding:10px 14px;display:flex;align-items:center;gap:11px;box-shadow:0 16px 30px rgba(38,64,52,.28)}
    .chip .hb{width:8px;height:8px;border-radius:50%;background:var(--signal);flex:none;animation:hb 1.8s ease-out infinite}
    @keyframes hb{0%{box-shadow:0 0 0 0 rgba(23,180,134,.55)}70%{box-shadow:0 0 0 9px rgba(23,180,134,0)}100%{box-shadow:0 0 0 0 rgba(23,180,134,0)}}
    .chip .txt{line-height:1.15}
    .chip .txt b{font-family:var(--mono);font-weight:500;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:#9fe3cc;display:block}
    .chip .txt span{font-size:.86rem;font-weight:600}

    /* SIGNATURE: full-width ECG monitor strip = the clean bottom edge */
    .monitor{position:relative;z-index:2;background:var(--paper);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    .monitor-inner{max-width:1240px;margin:0 auto;padding:0 clamp(22px,4vw,48px);height:80px;display:flex;align-items:center;gap:20px}
    .mon-tag{display:flex;align-items:center;gap:9px;flex:none}
    .mon-tag .lv{width:8px;height:8px;border-radius:50%;background:var(--pulse);position:relative}
    .mon-tag .lv::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid var(--signal);opacity:.7;animation:ping 2.4s cubic-bezier(0,0,.2,1) infinite}
    .mon-tag .t{font-family:var(--mono);font-weight:500;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--slate)}
    .mon-tag .t b{color:var(--ink);font-weight:700}
    .trace{flex:1;height:66px;position:relative;overflow:hidden}
    .trace svg{width:100%;height:100%;display:block}
    .ecg-base{fill:none;stroke:var(--pulse);stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}
    .ecg-glow{fill:none;stroke:var(--signal);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 5px rgba(23,180,134,.85))}
    .trace::before,.trace::after{content:"";position:absolute;top:0;bottom:0;width:56px;z-index:2;pointer-events:none}
    .trace::before{left:0;background:linear-gradient(90deg,var(--paper),transparent)}
    .trace::after{right:0;background:linear-gradient(270deg,var(--paper),transparent)}
    .mon-read{flex:none;text-align:right}
    .mon-read .bpm{font-family:var(--mono);font-weight:700;font-size:1.15rem;color:var(--ink);line-height:1}
    .mon-read .bpm em{font-style:normal;color:var(--pulse)}
    .mon-read .cap{font-family:var(--mono);font-weight:500;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--slate);margin-top:5px}
    .monitor.anim .ecg-base{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:draw 2.2s cubic-bezier(.65,0,.35,1) forwards}
    @keyframes draw{to{stroke-dashoffset:0}}

    @media(max-width:980px){
      .stage{grid-template-columns:1fr;gap:8px;padding:34px 0 56px}
      .hero h1{max-width:20ch}.hero .lead{max-width:54ch}
      .deck{height:412px;margin-top:18px;transform:scale(.94)}
    }
    @media(max-width:620px){
      .deck{display:none}.stage{padding:26px 0 44px}
      .cta-row .btn{flex:1;justify-content:center}
      .mon-read .cap{display:none}.monitor-inner{gap:14px}
      .readout{flex-wrap:wrap;gap:14px 0}
    }

    /* ===== body ===== */
    .marquee{border-bottom:1px solid var(--line);padding:15px 0;overflow:hidden;background:var(--porcelain);
      -webkit-mask:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
    .marquee-track{display:inline-flex;align-items:center;gap:22px;white-space:nowrap;animation:scroll 54s linear infinite;
      font-family:var(--mono);font-weight:500;font-size:.9rem;letter-spacing:.02em;text-transform:uppercase;color:var(--slate)}
    .marquee-track i{color:var(--pulse);font-size:.6rem}
    @keyframes scroll{to{transform:translateX(-50%)}}

    section.block{padding:76px 0}
    .kicker{font-family:var(--mono);font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--pulse)}
    .sec-head{max-width:60ch;margin-bottom:38px}
    .sec-head h2{font-family:var(--sans);font-weight:800;font-size:clamp(1.9rem,1.3rem+2vw,2.9rem);letter-spacing:-.02em;line-height:1.07;margin-top:12px}
    .sec-head p{margin-top:14px;color:var(--slate);font-size:1.08rem}

    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
    @media(max-width:1000px){.grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:660px){.grid{grid-template-columns:1fr;max-width:460px;margin:0 auto}}
    .grid-empty{grid-column:1/-1;color:var(--slate-2);font-style:italic}
    .card{position:relative;background:var(--paper);border:1px solid var(--line);border-radius:16px;overflow:hidden;
      box-shadow:0 1px 2px rgba(38,64,52,.04),0 14px 34px rgba(38,64,52,.06);display:flex;flex-direction:column;
      transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s var(--ease);opacity:0;transform:translateY(22px)}
    .card.in{opacity:1;transform:none}
    .card:hover{transform:translateY(-6px);box-shadow:0 2px 6px rgba(38,64,52,.06),0 30px 60px rgba(38,64,52,.13);border-color:#bfe0d1}
    .card-accent{position:absolute;inset:0 0 auto 0;height:4px;z-index:4}
    .card-frame{position:relative}
    .card-chrome{display:flex;align-items:center;gap:9px;height:33px;padding:0 12px;background:var(--porcelain);border-bottom:1px solid var(--line)}
    .card-dots{display:inline-flex;gap:5px;flex:0 0 auto}
    .card-dots i{width:8px;height:8px;border-radius:50%;background:var(--line);opacity:.95}
    .card-url{font-family:var(--mono);font-size:.66rem;letter-spacing:.02em;color:var(--slate-2);background:var(--paper);
      border:1px solid var(--line);border-radius:999px;padding:2px 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:76%}
    .card-thumb{position:relative;aspect-ratio:16/10;overflow:hidden;background:var(--line-2);border-bottom:1px solid var(--line)}
    .card-thumb img{width:100%;height:100%;object-fit:cover;object-position:top center;transition:transform .6s var(--ease)}
    .card:hover .card-thumb img{transform:scale(1.05)}
    .card-open{position:absolute;bottom:12px;right:12px;z-index:3;display:inline-flex;align-items:center;gap:6px;
      font-family:var(--mono);font-size:.72rem;font-weight:600;color:#fff;background:var(--pulse-deep);padding:7px 13px;border-radius:999px;
      box-shadow:0 8px 20px rgba(9,95,68,.3);opacity:0;transform:translateY(8px);transition:opacity .3s var(--ease),transform .3s var(--ease)}
    .card:hover .card-open,.card:focus-visible .card-open{opacity:1;transform:none}
    .thumb-fallback{width:100%;height:100%;display:grid;place-items:center;padding:20px;text-align:center}
    .thumb-fallback span{font-family:var(--sans);font-weight:800;font-size:1.4rem;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.25)}
    .card-body{padding:20px 22px 22px;display:flex;flex-direction:column;gap:9px;flex:1}
    .card-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .card-tag{font-family:var(--mono);font-size:.64rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
      color:var(--pulse);background:rgba(11,122,87,.09);padding:4px 9px;border-radius:6px}
    .card-geo{font-size:.76rem;color:var(--slate-2)}
    .card-name{font-family:var(--sans);font-weight:700;font-size:1.32rem;letter-spacing:-.01em;margin-top:2px}
    .card-desc{font-size:.95rem;color:var(--slate)}

    .studio{background:var(--paper);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    .services{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:8px}
    @media(max-width:900px){.services{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:520px){.services{grid-template-columns:1fr}}
    .svc{padding:26px 22px;background:var(--porcelain);border:1px solid var(--line);border-radius:16px}
    .svc-n{font-family:var(--mono);font-size:.78rem;color:var(--pulse);font-weight:600}
    .svc h3{font-family:var(--sans);font-weight:700;font-size:1.24rem;margin:12px 0 8px;letter-spacing:-.01em}
    .svc p{font-size:.95rem;color:var(--slate)}

    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center}
    @media(max-width:720px){.stats{grid-template-columns:repeat(2,1fr);gap:34px 20px}}
    .stat .n{font-family:var(--sans);font-weight:800;font-size:clamp(2.4rem,1.6rem+2.4vw,3.5rem);letter-spacing:-.02em;line-height:1;color:var(--pulse)}
    .stat .l{margin-top:8px;font-size:.9rem;color:var(--slate)}

    .cta-band{background:var(--ink);color:#fff;border-radius:24px;padding:62px 48px;text-align:center;position:relative;overflow:hidden}
    .cta-band::after{content:"";position:absolute;inset:0;background:radial-gradient(700px 320px at 50% -20%,rgba(23,180,134,.28),transparent 70%);pointer-events:none}
    .cta-band h2{font-family:var(--sans);font-weight:800;font-size:clamp(2rem,1.4rem+2.4vw,3.2rem);letter-spacing:-.02em;position:relative}
    .cta-band p{margin:16px auto 0;max-width:52ch;color:rgba(255,255,255,.78);position:relative}
    .cta-actions{margin-top:30px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center;position:relative}
    .cta-band .btn-ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.28)}
    .cta-band .btn-ghost:hover{border-color:#fff;background:rgba(255,255,255,.06)}

    footer{padding:50px 0 60px;border-top:1px solid var(--line);margin-top:6px}
    .foot{display:flex;flex-wrap:wrap;gap:22px;align-items:center;justify-content:space-between}
    .foot-brand{font-family:var(--mono);font-weight:700;font-size:1.02rem;display:flex;align-items:center;gap:10px}
    .foot-note{font-size:.86rem;color:var(--slate-2)}
    .foot a.plain{color:var(--slate);font-size:.9rem}
    .foot a.plain:hover{color:var(--pulse)}

    @media(prefers-reduced-motion:reduce){
      *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
      .card{opacity:1;transform:none}.marquee-track{animation:none}.monitor.anim .ecg-base{stroke-dashoffset:0}
    }
"""

# heartbeat / care mark (currentColor)
MARK_SVG = ('<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">'
            '<path d="M2 12.5h4l1.8-5 2.6 9.5 2.4-11 2.2 6.5H22" stroke="currentColor" '
            'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>')

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The Rounds Studio — Websites for Clinics, Hospitals &amp; Healthcare Brands</title>
  <meta name="description" content="The Rounds Studio designs and hand-builds calm, credible, fast websites for clinics, hospitals and healthcare brands — {total} brands built, each its own design world, no templates. A BuildspaceLabs atelier.">
  <link rel="canonical" href="{BASE}/">
  <meta name="robots" content="index,follow">
  <meta name="theme-color" content="#0B7A57">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="The Rounds Studio">
  <meta property="og:title" content="The Rounds Studio — Websites for Clinics &amp; Healthcare Brands">
  <meta property="og:description" content="We hand-build calm, credible, fast websites for clinics and healthcare brands. {total} brands, each its own design world, no templates. A BuildspaceLabs atelier.">
  <meta property="og:url" content="{BASE}/">
  <meta property="og:image" content="{og_image}">
  <meta property="og:image:alt" content="A grid of clinic and healthcare websites built by The Rounds Studio.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="The Rounds Studio — Websites for Clinics &amp; Healthcare Brands">
  <meta name="twitter:description" content="Calm, credible, fast websites for clinics, hospitals and healthcare brands. A BuildspaceLabs atelier.">
  <meta name="twitter:image" content="{og_image}">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230B7A57'/%3E%3Cpath d='M4 16.5h4.5l2.2-6 3.2 11.5 3-13 2.6 7.5H28' stroke='%23fff' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  {{
    "@context":"https://schema.org","@type":"CollectionPage",
    "name":"The Rounds Studio — Healthcare Web Design",
    "description":"A studio that designs and hand-builds websites for clinics, hospitals and healthcare brands.",
    "url":"{BASE}/",
    "publisher":{{"@type":"Organization","name":"BuildspaceLabs","url":"https://buildspacelabs.com",
      "parentOrganization":{{"@type":"Organization","name":"Vruoom"}}}}
  }}
  </script>
  <style>{CSS}</style>
</head>
<body>
  <header>
    <div class="wrap nav">
      <a class="brand" href="./" aria-label="The Rounds Studio home">
        <span class="mark">{MARK_SVG}</span>
        <span><span class="name">The Rounds Studio</span><span class="sub">Healthcare Digital Atelier</span></span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        <a href="#work">Work</a>
        <a href="#studio">Studio</a>
        <a href="#offer">Offer</a>
        <a class="btn btn-primary nav-cta" href="#start">Start a project</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-title">
      <div class="wrap">
        <div class="stage">
          <div class="copy">
            <span class="eyebrow"><span class="dot" aria-hidden="true"></span>Healthcare digital studio &middot; A BuildspaceLabs atelier</span>
            <h1 id="hero-title">We build clinics patients <span class="beat">trust<svg viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 12 H26 l6-9 5 15 5-12 4 7 H120"/></svg></span> &mdash; and actually book.</h1>
            <p class="lead">Great doctors lose patients to confusing, dated websites that hide the one thing people need — <strong>how to be seen.</strong> We rebuild clinics and healthcare brands into calm, credible, fast sites: clear services, real reassurance, and booking that takes seconds.</p>
            <div class="cta-row">
              <a class="btn btn-primary" href="#work">Selected work
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
              <a class="btn btn-ghost" href="#start">Start a project</a>
            </div>
            <div class="readout" role="list" aria-label="What we build for">
              <div class="ch" role="listitem"><span class="lab">Clarity</span><span class="val">Services, spelled out</span></div>
              <div class="ch" role="listitem"><span class="lab">Trust</span><span class="val">Real reassurance</span></div>
              <div class="ch" role="listitem"><span class="lab">Booking</span><span class="val">Done in seconds</span></div>
            </div>
          </div>

          <div class="deck" aria-label="Selected clinic and healthcare websites">{hero_preview}
            <div class="chip" aria-hidden="true"><span class="hb"></span><span class="txt"><b>Appointment</b><span>Booked in 24s</span></span></div>
          </div>
        </div>
      </div>

      <div class="monitor" aria-hidden="true">
        <div class="monitor-inner">
          <div class="mon-tag"><span class="lv"></span><span class="t"><b>LIVE</b> &middot; practice rhythm</span></div>
          <div class="trace"><svg viewBox="0 0 1200 66" preserveAspectRatio="none"><path id="ecgBase" class="ecg-base" d=""/><path id="ecgGlow" class="ecg-glow" d=""/></svg></div>
          <div class="mon-read"><div class="bpm mono">72<em> &hearts;</em></div><div class="cap">steady &middot; seen fast</div></div>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">{marquee}</div></div>

    <section class="block wrap" id="work" aria-labelledby="work-h">
      <div class="sec-head">
        <span class="kicker">Selected work</span>
        <h2 id="work-h">Every practice, its own care.</h2>
        <p>Each site below is hand-built from scratch — its own type, palette and tone, tuned to the practice and the patients it serves. No shared template, no page-builder. Open any one.</p>
      </div>
      <div class="grid">
{cards_html}
      </div>
    </section>

    <section class="block studio" id="studio" aria-labelledby="studio-h">
      <div class="wrap">
        <div class="sec-head">
          <span class="kicker">The studio</span>
          <h2 id="studio-h">Patients decide whether to trust you before they ever call. We make that first impression calm, clear and credible.</h2>
        </div>
        <div class="services">
          <div class="svc"><div class="svc-n">01</div><h3>Brand &amp; Identity</h3><p>A name, mark and voice that put patients at ease before the first visit.</p></div>
          <div class="svc"><div class="svc-n">02</div><h3>Design &amp; Build</h3><p>Bespoke, hand-built sites — services, doctors and patient info structured for clarity. No page-builders.</p></div>
          <div class="svc"><div class="svc-n">03</div><h3>Speed &amp; Trust</h3><p>Sub-second loads, clean SEO and accessible, mobile-first delivery — people search when they're worried.</p></div>
          <div class="svc"><div class="svc-n">04</div><h3>Booking &amp; Growth</h3><p>Conversion-shaped journeys — appointments, callbacks and directions, not dead ends.</p></div>
        </div>
      </div>
    </section>

    <section class="block wrap" id="offer" aria-labelledby="offer-h">
      <div class="sec-head"><span class="kicker">The numbers</span><h2 id="offer-h">Honest stats, no filler.</h2></div>
      <div class="stats">
        <div class="stat"><div class="n">{total}</div><div class="l">Healthcare brands built</div></div>
        <div class="stat"><div class="n">100%</div><div class="l">Hand-built, no templates</div></div>
        <div class="stat"><div class="n">&lt;1s</div><div class="l">Median load time</div></div>
        <div class="stat"><div class="n">0</div><div class="l">Page-builders used</div></div>
      </div>
    </section>

    <section class="block wrap" id="start">
      <div class="cta-band">
        <h2>Let's build yours.</h2>
        <p>Have a clinic or healthcare brand that deserves better than its current site? Tell us where you are and where you want to take it — we reply within two days.</p>
        <div class="cta-actions">
          <a class="btn btn-primary" href="mailto:buildspacelabs@vruoom.com?subject=The%20Rounds%20Studio%20%E2%80%94%20new%20project">Email the studio</a>
          <a class="btn btn-ghost" href="https://wa.me/919315776817?text=Hi%20The%20Rounds%20Studio%2C%20I%27d%20like%20a%20website%20for%20my%20clinic." target="_blank" rel="noopener">WhatsApp us</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap foot">
      <div>
        <div class="foot-brand"><span class="mark">{MARK_SVG}</span> The Rounds Studio</div>
        <p class="foot-note">&copy; {TODAY[:4]} The Rounds Studio &middot; a <a class="plain" href="https://buildspacelabs.com" target="_blank" rel="noopener" style="text-decoration:underline">BuildspaceLabs</a> atelier &middot; Made in India</p>
      </div>
      <div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">
        <a class="plain" href="#work">Work</a>
        <a class="plain" href="#studio">Studio</a>
        <a class="plain" href="mailto:buildspacelabs@vruoom.com">Email</a>
        <a class="plain" href="https://wa.me/919315776817" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </footer>

  <script>
    (function(){{
      var W=1200,BASE=40,BEAT=175;
      function beat(x){{return " L"+(x+30)+" "+BASE+" L"+(x+42)+" "+(BASE-7)+" L"+(x+54)+" "+BASE+" L"+(x+70)+" "+BASE+" L"+(x+76)+" "+(BASE+6)+" L"+(x+86)+" "+8+" L"+(x+96)+" "+(BASE+18)+" L"+(x+104)+" "+BASE+" L"+(x+124)+" "+BASE+" L"+(x+142)+" "+(BASE-11)+" L"+(x+164)+" "+BASE+" L"+(x+BEAT)+" "+BASE;}}
      var d="M0 "+BASE;for(var x=0;x<=W;x+=BEAT){{d+=beat(x);}}
      var base=document.getElementById('ecgBase'),glow=document.getElementById('ecgGlow');
      if(!base)return; base.setAttribute('d',d); glow.setAttribute('d',d);
      var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var len=base.getTotalLength();
      if(reduce){{glow.style.display='none';return;}}
      base.style.setProperty('--len',len); base.closest('.monitor').classList.add('anim');
      glow.style.strokeDasharray=26+' '+len;
      glow.animate([{{strokeDashoffset:len}},{{strokeDashoffset:0}}],{{duration:5200,iterations:Infinity,easing:'linear'}});
    }})();
    (function(){{
      var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var cards=document.querySelectorAll('.card');
      if(reduce||!('IntersectionObserver' in window)){{cards.forEach(function(c){{c.classList.add('in')}});return}}
      var io=new IntersectionObserver(function(es){{es.forEach(function(e){{
        if(e.isIntersecting){{var i=Array.prototype.indexOf.call(cards,e.target);
          e.target.style.transitionDelay=(Math.min(i,8)*70)+'ms';e.target.classList.add('in');io.unobserve(e.target)}}
      }})}},{{threshold:.14}});
      cards.forEach(function(c){{io.observe(c)}});
    }})();
  </script>
</body>
</html>
"""

with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
    f.write(html)

urls = [f"{BASE}/"]
for p in built:
    urls.append(f"{BASE}/{p['slug']}/"); urls.append(f"{BASE}/{p['slug']}/contact.html")
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    pr = "1.0" if u == f"{BASE}/" else ("0.8" if u.endswith("/") else "0.5")
    sm.append(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
sm.append("</urlset>")
with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write("\n".join(sm) + "\n")

print(f"Hub generated: {len(built)}/{total} brands live. Cards: {len(built)}. Sitemap urls: {len(urls)}.")
