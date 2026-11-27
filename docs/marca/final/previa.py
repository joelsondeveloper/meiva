"""Folha final da marca MEIva: todos os arquivos entregues, em uso."""
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
FUNDOS = [("claro", "#f2f4f2", "Fundo claro"), ("petroleo", "#0d5c57", "Petróleo"), ("escuro", "#131a19", "Escuro"), ("preto", "#ffffff", "1 cor"), ("branco", "#000000", "Negativo")]
CL = ("petroleo", "escuro", "branco")


def fundos(tipo, h):
    return "".join(
        f'<div class="fundo" style="background:{bg}"><img src="svg/{tipo}/meiva-{tipo}-{t}.svg" height="{h}" alt=""><span class="{"cl" if t in CL else ""}">{r}</span></div>'
        for t, bg, r in FUNDOS
    )


def fig(src, w, leg, estilo=""):
    return f'<figure><img src="{src}" width="{w}" style="{estilo}" alt=""><figcaption>{leg}</figcaption></figure>'


def secao(t, sub, corpo):
    return f'<section><h2>{t}</h2><p class="sub">{sub}</p>{corpo}</section>'


s = []
s.append(secao("Nome (logo principal)", "svg/logo/meiva-logo-*.svg · PNG de 1200 px em png/logo/", f'<div class="logos">{fundos("logo", 64)}</div>'
               + '<div class="linha" style="margin-top:14px">' + "".join(
                   f'<div class="tam"><img src="svg/logo/meiva-logo-claro.svg" height="{h}" alt=""><span>{h} px</span></div>' for h in (72, 40, 28, 18)) + "</div>"))
s.append(secao("Símbolo", "svg/simbolo/meiva-simbolo-*.svg · PNG de 512 px em png/simbolo/. Use o nome ou o símbolo, nunca os dois lado a lado.", f'<div class="logos">{fundos("simbolo", 80)}</div>'))
s.append(secao(
    "Ícone do app",
    "svg/icone/ · web/icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png, apple-touch-icon.png (180)",
    '<div class="linha">'
    + fig("svg/icone/meiva-icone.svg", 128, "ícone (any)")
    + fig("svg/icone/meiva-icone-escuro.svg", 128, "escuro")
    + fig("svg/icone/meiva-icone-1cor.svg", 128, "1 cor")
    + '<figure class="seguro"><img src="svg/icone/meiva-icone-maskable.svg" width="128" alt=""><i></i><figcaption>maskable + círculo seguro</figcaption></figure>'
    + fig("svg/icone/meiva-icone-maskable.svg", 128, "maskable recortado", "border-radius:50%")
    + fig("web/apple-touch-icon.png", 128, "apple-touch-icon 180", "border-radius:28px")
    + fig("web/icon-192.png", 96, "icon-192")
    + fig("web/icon-maskable-192.png", 96, "maskable-192", "border-radius:22px")
    + "</div>",
))
s.append(secao(
    "Favicon",
    "web/favicon.svg (grade de 16 px), web/favicon.ico (16, 32 e 48 px). Corte próprio: hastes de 2 px e traço de 10 × 2 px no pixel inteiro.",
    '<div class="linha">'
    + "".join(fig("web/favicon.svg", w, f"{w} px", "image-rendering:pixelated") for w in (16, 32, 48))
    + fig("web/favicon.ico", 16, ".ico 16")
    + fig("web/favicon-16-ampliado-10x.png", 160, "16 px ampliado 10×, sem suavizar", "image-rendering:pixelated")
    + fig("web/favicon-1cor.svg", 160, "1 cor (grade)", "image-rendering:pixelated")
    + "</div>"
    + '<div class="abas"><div class="aba"><img src="web/favicon.svg" width="16" height="16" alt=""><span>MEIva · Conversa</span><em>×</em></div><div class="aba off"><b></b><span>Outra aba</span></div></div>'
    + '<div class="abas esc"><div class="aba"><img src="web/favicon.svg" width="16" height="16" alt=""><span>MEIva · Conversa</span><em>×</em></div><div class="aba off"><b></b><span>Outra aba</span></div></div>',
))
s.append(secao(
    "Compartilhamento e redes",
    "social/og-image-1200x630.png (também em public/og-image.png) · social/instagram-avatar-400.png",
    '<div class="linha">'
    + fig("social/og-image-1200x630.png", 600, "imagem de compartilhamento 1200 × 630")
    + fig("social/instagram-avatar-400.png", 200, "avatar 400 × 400")
    + fig("social/instagram-avatar-400.png", 200, "como o Instagram recorta", "border-radius:50%")
    + "</div>",
))
apps = "".join(
    ('<div class="app-i"><img src="svg/icone/meiva-icone.svg" width="60" alt=""><span>MEIva</span></div>' if c == "M" else f'<div class="app-i"><b style="background:{c}"></b><span>App</span></div>')
    for c in ["#4a6fa5", "#c8553d", "#6b8f71", "M", "#8e6c8a", "#d1a054", "#3d5a80", "#7a7a7a"]
)
lat = lambda t, bg, tx, at, att, pg: (
    f'<div class="app" style="background:{pg}"><aside style="background:{bg};color:{tx}"><img src="svg/logo/meiva-logo-{t}.svg" height="30" alt="">'
    f'<ul><li style="background:{at};color:{att};font-weight:700">Conversa</li><li>Resumo</li><li>Fiados</li></ul></aside>'
    f'<main style="color:{tx}"><p class="h">Conversa</p><p>Escreva do jeito que você fala.</p></main></div>'
)
s.append(secao(
    "Em uso",
    "Lateral do computador (claro e escuro) e tela inicial do celular. Ícones vizinhos genéricos.",
    '<div class="usos">' + lat("claro", "#fdfdfb", "#1b2422", "#e1eeec", "#0d5c57", "#f2f4f2") + lat("escuro", "#1b2422", "#edf0ee", "#21403c", "#5cc2b7", "#131a19")
    + f'<div class="home">{apps}</div></div>',
))
cores = [("#0d5c57", "Petróleo", "letras no claro, fundo do ícone"), ("#8f5d00", "Âmbar-tinta", "I no fundo claro"), ("#f5c04f", "Âmbar-claro", "I e traço sobre petróleo"),
         ("#f2b134", "Âmbar", "botão; I e traço no escuro"), ("#fdfdfb", "Folha", "letras sobre petróleo"), ("#131a19", "Escuro", "fundo escuro")]
s.append(secao("Cores da marca", "Regra do âmbar: botão principal + I do nome + traço do ícone. Detalhes em docs/marca/guia.md.",
               '<div class="linha">' + "".join(f'<div class="cor"><b style="background:{h}"></b><strong>{n}</strong><code>{h}</code><span>{u}</span></div>' for h, n, u in cores) + "</div>"))

html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>MEIva · arquivos finais</title><style>
body {{ margin:0; padding:40px; width:1640px; background:#e6e9e7; color:#1b2422; font:16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size:30px; margin:0 0 4px; }} .intro {{ margin:0 0 24px; color:#4a5552; }}
section {{ background:#fdfdfb; border-radius:20px; padding:22px 28px; margin-bottom:20px; }} h2 {{ font-size:22px; margin:0; }} .sub {{ margin:4px 0 14px; color:#4a5552; font-size:14px; }}
.logos {{ display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }}
.fundo {{ border-radius:14px; height:132px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; border:1px solid #0001; }}
.fundo img {{ max-width:82%; height:auto; max-height:64px; }} .fundo span {{ font-size:12px; color:#4a5552; }} .cl {{ color:#ffffffb0 !important; }}
.linha {{ display:flex; gap:22px; align-items:flex-end; flex-wrap:wrap; }}
.tam {{ background:#f2f4f2; border-radius:12px; padding:12px 16px; display:flex; flex-direction:column; gap:6px; }} .tam span, figcaption {{ font-size:12px; color:#4a5552; }}
figure {{ margin:0; text-align:center; position:relative; }}
.seguro i {{ position:absolute; left:12.8px; top:12.8px; width:102.4px; height:102.4px; border:1.5px dashed #f5c04f; border-radius:50%; box-sizing:border-box; }}
.abas {{ display:flex; gap:2px; padding:8px 8px 0; background:#dee1e6; border-radius:10px 10px 0 0; width:420px; margin-top:16px; }}
.abas.esc {{ background:#202124; margin-top:8px; }} .abas.esc .aba {{ background:#35363a; color:#e8eaed; }} .abas.esc .aba.off {{ background:none; }}
.aba {{ display:flex; gap:8px; align-items:center; padding:8px 12px; border-radius:8px 8px 0 0; font:12px system-ui; width:190px; background:#fff; }}
.aba em {{ margin-left:auto; font-style:normal; opacity:.6; }} .aba.off {{ background:none; opacity:.7; }} .aba b {{ width:16px; height:16px; border-radius:4px; background:#8a8f98; }}
.usos {{ display:grid; grid-template-columns:1fr 1fr 0.8fr; gap:16px; }}
.app {{ display:flex; height:230px; border-radius:14px; overflow:hidden; border:1px solid #0002; }} .app aside {{ width:200px; padding:22px 14px; box-sizing:border-box; }}
.app ul {{ list-style:none; padding:0; margin:22px 0 0; font-size:17px; }} .app li {{ padding:9px 12px; border-radius:12px; margin-bottom:4px; }}
.app main {{ padding:24px; }} .app .h {{ font-size:26px; font-weight:700; margin:0 0 4px; }}
.home {{ background:linear-gradient(#e8e2d8,#d9d2c6); border-radius:18px; padding:16px; display:grid; grid-template-columns:repeat(4,1fr); gap:12px 8px; }}
.app-i {{ display:flex; flex-direction:column; align-items:center; font-size:11px; }} .app-i b {{ width:60px; height:60px; border-radius:14px; }} .app-i img {{ border-radius:14px; }} .app-i span {{ margin-top:4px; }}
.cor {{ display:flex; flex-direction:column; gap:2px; width:200px; font-size:13px; }} .cor b {{ height:64px; border-radius:12px; border:1px solid #0002; margin-bottom:6px; }} .cor code {{ color:#4a5552; }} .cor span {{ color:#4a5552; }}
</style></head><body>
<h1>MEIva · arquivos finais</h1>
<p class="intro">Nome com o I de cursor (serifa curta) + ícone G3b. Aprovado em 27/11/2026. Guia: docs/marca/guia.md. A aplicação no app é a Fase 5.</p>
{"".join(s)}
</body></html>"""
open(os.path.join(AQUI, "previa.html"), "w", encoding="utf-8").write(html)
print("previa ok")
