"""Monta previa.html da exploração 3 (última): nome haste x I com serifa reta e ícone G3 refinado."""
import os

AQUI = os.path.dirname(os.path.abspath(__file__))

NOMES = [
    ("haste", "Haste 180 (base)"),
    ("serifa-curta", "I com serifa curta (300)"),
    ("serifa-media", "I com serifa média (370)"),
]
ICONES = [
    ("g3a", "G3a · 702 × 120, a 110 (rodada 2)"),
    ("g3b", "G3b · 702 × 165, a 100"),
    ("g3c", "G3c · 540 × 165, a 100"),
    ("g3d", "G3d · 702 × 200, a 120"),
]
NOME_MOCK = ["haste", "serifa-curta"]
FUNDOS = [
    ("claro", "#f2f4f2", "Fundo claro"),
    ("petroleo", "#0d5c57", "Petróleo"),
    ("escuro", "#131a19", "Escuro"),
    ("preto", "#ffffff", "1 cor"),
    ("branco", "#000000", "Negativo"),
]
FILTROS = [("", "Original"), ("cinza", "Cinza"), ("protan", "Protanopia"), ("deutan", "Deuteranopia"), ("tritan", "Tritanopia")]

REC = ""  # preenchida depois da revisão
p_rec = os.path.join(AQUI, "recomendacao.html")
if os.path.exists(p_rec):
    REC = open(p_rec, encoding="utf-8").read()


def img(src, h=None, w=None, extra=""):
    t = f' height="{h}"' if h else ""
    t += f' width="{w}"' if w else ""
    if not src.startswith("../") and not src.startswith("png/"):
        src = f"svg/{src}"
    return f'<img src="{src}"{t} alt="" {extra}>'


def secao(titulo, sub, corpo):
    return f'<section><h2>{titulo}</h2><p class="sub">{sub}</p>{corpo}</section>'


partes = []
if REC:
    partes.append(secao("Recomendação", "", REC))

# 1. lado a lado
linhas = [("../exploracao-2/svg/ref-l700-logo-claro.svg", 'Referência: "MElva" com l da Lexend 700')]
linhas += [(f"{n}-logo-claro.svg", r) for n, r in NOMES]
tab = "".join(
    f"<tr><th>{r}</th>"
    + "".join(f'<td class="t">{img(s, h)}</td>' for h in (72, 28, 18))
    + f'<td class="t">{img(s, 28, extra="class=cinza")}</td><td class="t">{img(s, 18, extra="class=cinza")}</td></tr>'
    for s, r in linhas
)
partes.append(
    secao(
        "1 · Nome lado a lado",
        "72, 28 (lateral) e 18 px, depois 28 e 18 px em cinza. A primeira linha é a ambiguidade que o I com serifa quer resolver.",
        f'<table class="lado"><tr><th></th><th>72 px</th><th>28 px</th><th>18 px</th><th>28 cinza</th><th>18 cinza</th></tr>{tab}</table>',
    )
)

# 2. detalhe do espaçamento
partes.append(
    secao(
        "2 · Espaçamento de perto",
        "Do E para o I com serifa, o espaço sobe de 100 para 128–132: o braço do E e a serifa ficam frente a frente na mesma altura e, perto demais, viram uma barra só. Do I para o v, 66–70 (a serifa de baixo entra sob o braço do v). A Lexend usa I com serifa reta no próprio alfabeto: o I curto pertence à família.",
        "".join(f'<div class="perto"><span>{r}</span>{img(f"{n}-logo-claro.svg", 150)}</div>' for n, r in NOMES),
    )
)

# 3. nos 5 fundos
def fundos(nome, h=60):
    return "".join(
        f'<div class="fundo" style="background:{bg}">{img(f"{nome}-logo-{t}.svg", h)}<span class="{"cl" if t in ("petroleo", "escuro", "branco") else ""}">{rot}</span></div>'
        for t, bg, rot in FUNDOS
    )


partes.append(
    secao(
        "3 · Nome nos 5 fundos",
        "Âmbar-tinta #8f5d00 no claro, âmbar-claro #f5c04f no petróleo, âmbar #f2b134 no escuro.",
        "".join(f'<h3>{r}</h3><div class="logos">{fundos(n)}</div>' for n, r in NOMES),
    )
)

# 4. ícone G3
def bloco_icone(nome, rot):
    tams = "".join(
        f'<figure>{img(f"{nome}-icone-petroleo.svg", s, s, f"style=border-radius:{s * 0.22:.0f}px")}<figcaption>{s}</figcaption></figure>'
        for s in (16, 24, 32, 48, 64)
    )
    fav = "".join(f'<figure>{img(f"{nome}-favicon-petroleo.svg", s, s)}<figcaption>fav {s}</figcaption></figure>' for s in (16, 32))
    seg = (
        f'<figure class="seguro">{img(f"{nome}-icone-petroleo.svg", 112, 112)}<i></i><figcaption>zona segura</figcaption></figure>'
        f'<figure>{img(f"{nome}-icone-petroleo.svg", 112, 112, "style=border-radius:50%")}<figcaption>redondo</figcaption></figure>'
        f'<figure>{img(f"{nome}-icone-escuro.svg", 112, 112, "style=border-radius:26px")}<figcaption>escuro</figcaption></figure>'
        f'<figure>{img(f"{nome}-icone-preto.svg", 112, 112, "style=border-radius:26px")}<figcaption>1 cor</figcaption></figure>'
    )
    pix = "".join(
        f'<figure>{img(f"png/{nome}-{tipo}-{cor}-16x12.png", 96, 96, "class=pix")}<figcaption>{leg}</figcaption></figure>'
        for tipo, cor, leg in (
            ("icone", "petroleo", "ícone 16 px"),
            ("icone", "preto", "ícone 1 cor 16 px"),
            ("favicon", "petroleo", "favicon 16 px"),
            ("favicon", "preto", "favicon 1 cor 16 px"),
        )
    )
    return f'<div class="ic"><h3>{rot}</h3><div class="tams">{tams}{fav}</div><div class="tams">{seg}</div><p class="mini">Pixels de verdade em 16 px (ampliados 6×, sem suavizar):</p><div class="tams">{pix}</div></div>'


partes.append(
    secao(
        "4 · Ícone G3: proporção do traço",
        "O traço âmbar é o cursor sublinhado. Medidas em unidades do desenho (o M tem 702 × 700). O favicon usa o símbolo maior (78% do quadrado), sem a margem do ícone de app.",
        '<div class="ics">' + "".join(bloco_icone(n, r) for n, r in ICONES) + "</div>",
    )
)

# 5. bateria de cor
def linha_filtros(src, h, rot, bg="#f2f4f2"):
    return f"<tr><th>{rot}</th>" + "".join(
        f'<td style="background:{bg}">{img(src, h, extra=f"class={f}" if f else "")}</td>' for f, _ in FILTROS
    ) + "</tr>"


bat = []
for n, r in NOMES[:2]:
    bat.append(linha_filtros(f"{n}-logo-claro.svg", 40, f"{r} · claro"))
    bat.append(linha_filtros(f"{n}-logo-petroleo.svg", 40, f"{r} · petróleo", "#0d5c57"))
    bat.append(linha_filtros(f"{n}-logo-escuro.svg", 40, f"{r} · escuro", "#131a19"))
bat += [linha_filtros(f"{n}-icone-petroleo.svg", 56, r, "#fdfdfb") for n, r in ICONES]
partes.append(
    secao(
        "5 · Escala de cinza e daltonismo",
        "Matrizes de Machado et al. (2009), severidade total, em RGB linear. Aproximação de tela; não substitui testar com pessoas.",
        f'<table class="bat"><tr><th></th>{"".join(f"<th>{r}</th>" for _, r in FILTROS)}</tr>{"".join(bat)}</table>',
    )
)

# 6. simulações
def lateral(nome, tema):
    escuro = tema == "escuro"
    bg, tx, ativo, at_tx = ("#1b2422", "#edf0ee", "#21403c", "#5cc2b7") if escuro else ("#fdfdfb", "#1b2422", "#e1eeec", "#0d5c57")
    itens = "".join(
        f'<li style="{f"background:{ativo};color:{at_tx};font-weight:700" if i == 0 else ""}"><b class="ico" style="border-color:{at_tx if i == 0 else tx}"></b>{t}</li>'
        for i, t in enumerate(["Conversa", "Resumo", "Fiados"])
    )
    pagina = "#131a19" if escuro else "#f2f4f2"
    return (
        f'<div class="app" style="background:{pagina}"><aside style="background:{bg};color:{tx}">'
        f'{img(f"{nome}-logo-{tema}.svg", 30)}<ul>{itens}</ul></aside>'
        f'<main style="color:{tx}"><p class="h">Conversa</p><p>Escreva do jeito que você fala.</p></main></div>'
    )


def topo(nome, tema):
    escuro = tema == "escuro"
    bg, tx = ("#131a19", "#edf0ee") if escuro else ("#f2f4f2", "#1b2422")
    return (
        f'<div class="cel" style="background:{bg};color:{tx}"><div class="barra">{img(f"{nome}-logo-{tema}.svg", 24)}'
        f'<span>Hoje <b>R$ 320,00</b></span></div><div class="campo" style="border-color:{"#3a4744" if escuro else "#c5ccc9"}">vendi 50 de pudim</div></div>'
    )


def aba(icone, tema):
    escuro = tema == "escuro"
    bg, at, tx = ("#202124", "#35363a", "#e8eaed") if escuro else ("#dee1e6", "#ffffff", "#1f1f1f")
    return (
        f'<div class="abas" style="background:{bg}"><div class="aba" style="background:{at};color:{tx}">'
        f'{img(f"{icone}-favicon-petroleo.svg", 16, 16)}<span>MEIva · Conversa</span><em>×</em></div>'
        f'<div class="aba off" style="color:{tx}"><b class="fav-gen"></b><span>Outra aba</span></div></div>'
    )


def tela_inicial(icone):
    genericos = ["#4a6fa5", "#c8553d", "#6b8f71", "#8e6c8a", "#d1a054", "#3d5a80", "#7a7a7a"]
    apps = []
    for i, cor in enumerate(genericos[:3] + ["MEIVA"] + genericos[3:]):
        if cor == "MEIVA":
            apps.append(f'<div class="app-i">{img(f"{icone}-icone-petroleo.svg", 60, 60, "style=border-radius:14px")}<span>MEIva</span></div>')
        else:
            apps.append(f'<div class="app-i"><b style="background:{cor}"></b><span>App {i + 1}</span></div>')
    return f'<div class="home">{"".join(apps)}</div>'


mocks = ""
for nome in NOME_MOCK:
    rot = dict(NOMES)[nome]
    mocks += (
        f'<h3>{rot}</h3><div class="mocks">'
        f"<div>{lateral(nome, 'claro')}</div><div>{lateral(nome, 'escuro')}</div>"
        f"<div>{topo(nome, 'claro')}{topo(nome, 'escuro')}</div></div>"
    )
mocks += (
    '<h3>Aba do navegador (favicon em 16 px)</h3><div class="grade4">'
    + "".join(f'<div><p class="mini">{r}</p>{aba(n, "claro")}{aba(n, "escuro")}</div>' for n, r in ICONES)
    + '</div><h3>Tela inicial do celular (ícone em 60 px; os outros são genéricos)</h3><div class="grade4">'
    + "".join(f'<div><p class="mini">{r}</p>{tela_inicial(n)}</div>' for n, r in ICONES)
    + "</div>"
)
partes.append(secao("6 · Simulações de uso", "Lateral do computador (claro e escuro), topo do celular, aba do navegador e tela inicial. Texto da interface na fonte do sistema.", mocks))

# 7. contraste
contraste = [
    ("Petróleo #0d5c57 no papel #f2f4f2", "7,1:1", "letras do nome"),
    ("Âmbar-tinta #8f5d00 no papel", "5,1:1", "I/cursor no claro (é letra: precisa de 4,5:1)"),
    ("Âmbar-tinta na folha #fdfdfb", "5,5:1", ""),
    ("Âmbar-claro #f5c04f no petróleo", "4,7:1", "I/cursor no petróleo e traço do ícone"),
    ("Âmbar #f2b134 no escuro #131a19", "9,3:1", "I/cursor no escuro"),
    ("Folha #fdfdfb no petróleo", "7,7:1", "letras no petróleo e M do ícone"),
    ("Texto #edf0ee no escuro", "15,4:1", "letras no escuro"),
]
partes.append(
    secao(
        "7 · Contraste",
        "Mínimo pedido: 4,5:1 onde há texto e 3:1 em elemento gráfico. Todos os pares passam; não há exceção.",
        '<table class="ct">' + "".join(f"<tr><td>{a}</td><td><b>{b}</b></td><td>{c}</td></tr>" for a, b, c in contraste) + "</table>",
    )
)

html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>MEIva · exploração 3</title>
<style>
body {{ margin:0; padding:40px; width:1640px; background:#e6e9e7; color:#1b2422; font:16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size:30px; margin:0 0 4px; }} .intro {{ margin:0 0 24px; color:#4a5552; }}
section {{ background:#fdfdfb; border-radius:20px; padding:24px 28px; margin-bottom:22px; }}
h2 {{ font-size:22px; margin:0; }} h3 {{ font-size:14px; margin:16px 0 8px; color:#4a5552; }} .sub {{ margin:4px 0 12px; color:#4a5552; max-width:1400px; }}
.mini {{ font-size:13px; margin:10px 0 0; color:#4a5552; }}
table {{ border-collapse:separate; border-spacing:8px; }} th {{ text-align:left; font-size:13px; font-weight:600; color:#4a5552; }}
.lado td.t {{ background:#f2f4f2; border-radius:10px; padding:10px 14px; }}
.perto {{ background:#f2f4f2; border-radius:14px; padding:14px 20px; margin-bottom:10px; display:flex; align-items:center; gap:24px; }} .perto span {{ width:220px; font-size:14px; color:#4a5552; }}
.bat td {{ border-radius:10px; padding:10px 14px; text-align:center; }}
.logos {{ display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }}
.fundo {{ border-radius:14px; height:110px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; border:1px solid #0001; }}
.fundo span {{ font-size:12px; color:#4a5552; }} .cl {{ color:#ffffffb0 !important; }}
figure {{ margin:0; text-align:center; position:relative; }} figcaption {{ font-size:11px; color:#4a5552; margin-top:4px; }}
.ics {{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }} .ic {{ background:#f2f4f2; border-radius:14px; padding:4px 16px 14px; }}
.tams {{ display:flex; gap:14px; align-items:flex-end; margin-top:10px; }}
.pix {{ image-rendering:pixelated; border:1px solid #0002; }}
.seguro img {{ border-radius:26px; }} .seguro i {{ position:absolute; left:11.2px; top:11.2px; width:89.6px; height:89.6px; border:1.5px dashed #f2b134; border-radius:50%; box-sizing:border-box; }}
.cinza {{ filter:grayscale(1); }} .protan {{ filter:url(#protan); }} .deutan {{ filter:url(#deutan); }} .tritan {{ filter:url(#tritan); }}
.mocks {{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }}
.app {{ display:flex; height:240px; border-radius:14px; overflow:hidden; border:1px solid #0002; }}
.app aside {{ width:210px; padding:22px 14px; box-sizing:border-box; }} .app ul {{ list-style:none; padding:0; margin:22px 0 0; font-size:17px; }}
.app li {{ display:flex; gap:10px; align-items:center; padding:9px 12px; border-radius:12px; margin-bottom:4px; }}
.ico {{ width:18px; height:18px; border:2px solid; border-radius:5px; box-sizing:border-box; }}
.app main {{ padding:26px; font-size:16px; }} .app .h {{ font-size:26px; font-weight:700; margin:0 0 4px; }}
.cel {{ width:360px; border-radius:14px; border:1px solid #0002; margin-bottom:10px; padding:14px 16px; box-sizing:border-box; }}
.barra {{ display:flex; justify-content:space-between; align-items:center; font-size:16px; }} .campo {{ margin-top:14px; border:2px solid; border-radius:14px; padding:10px 12px; }}
.grade4 {{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }}
.abas {{ display:flex; gap:2px; padding:8px 8px 0; border-radius:10px 10px 0 0; margin-bottom:8px; }}
.aba {{ display:flex; gap:8px; align-items:center; padding:8px 12px; border-radius:8px 8px 0 0; font:12px system-ui; width:170px; }}
.aba em {{ margin-left:auto; font-style:normal; opacity:.6; }} .aba.off {{ opacity:.7; }} .fav-gen {{ width:16px; height:16px; border-radius:4px; background:#8a8f98; }}
.home {{ background:linear-gradient(#e8e2d8,#d9d2c6); border-radius:18px; padding:16px; display:grid; grid-template-columns:repeat(4,1fr); gap:12px 8px; }}
.app-i {{ display:flex; flex-direction:column; align-items:center; font-size:11px; color:#1b2422; }} .app-i b {{ width:60px; height:60px; border-radius:14px; }} .app-i span {{ margin-top:4px; }}
.ct td {{ background:#f2f4f2; padding:6px 10px; border-radius:6px; font-size:14px; }}
.rec li {{ margin-bottom:6px; }}
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>
<filter id="protan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0"/></filter>
<filter id="deutan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0"/></filter>
<filter id="tritan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0"/></filter>
</defs></svg>
<h1>MEIva · exploração 3 (última)</h1>
<p class="intro">Nome B1: haste 180 x I com serifa reta, em âmbar-tinta. Ícone G3: proporção do traço. Letras em curvas a partir da Lexend (OFL); M, I, cursor e ícone desenhados do zero.</p>
{"".join(partes)}
</body></html>"""
open(os.path.join(AQUI, "previa.html"), "w", encoding="utf-8").write(html)
print("previa.html ok")
