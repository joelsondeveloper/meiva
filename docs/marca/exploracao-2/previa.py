"""Monta previa.html da exploração 2: variações, bateria de testes e simulações de uso."""
import os

AQUI = os.path.dirname(os.path.abspath(__file__))

# escolhas que aparecem nas simulações (atualize depois de cada revisão)
NOME = "b1-h-tinta"
ICONES = ["g1", "g2", "g3", "g4"]
ICONE_MOCK = "g3"

B1 = [
    ("b1-h-tinta", "Haste 180 · âmbar-tinta #8f5d00"),
    ("b1-h-cobre", "Haste 180 · âmbar-cobre #a55300"),
    ("b1-l-tinta", "Haste larga 215 · âmbar-tinta"),
    ("b1-l-cobre", "Haste larga 215 · âmbar-cobre"),
]
G = [("g1", "G1 · bloco grande"), ("g2", "G2 · bloco justo"), ("g3", "G3 · sublinhado"), ("g4", "G4 · vazado")]
F = [("f1", "F1 · V no alto"), ("f2", "F2 · M pontudo")]
FUNDOS = [
    ("claro", "#f2f4f2", "Fundo claro"),
    ("petroleo", "#0d5c57", "Petróleo"),
    ("escuro", "#131a19", "Escuro"),
    ("preto", "#ffffff", "1 cor"),
    ("branco", "#000000", "Negativo"),
]
FILTROS = [("", "Original"), ("cinza", "Cinza"), ("protan", "Protanopia"), ("deutan", "Deuteranopia"), ("tritan", "Tritanopia")]


def img(src, h=None, w=None, extra=""):
    t = f' height="{h}"' if h else ""
    t += f' width="{w}"' if w else ""
    return f'<img src="svg/{src}"{t} alt="" {extra}>'


def fundo_logos(nome, altura=64):
    return "".join(
        f'<div class="fundo" style="background:{bg}">{img(f"{nome}-logo-{t}.svg", altura)}<span class="{"cl" if t in ("petroleo","escuro","branco") else ""}">{rot}</span></div>'
        for t, bg, rot in FUNDOS
    )


def secao(titulo, sub, corpo):
    return f'<section><h2>{titulo}</h2><p class="sub">{sub}</p>{corpo}</section>'


CINCO = [
    ("Haste 180 · âmbar-tinta", "\"MEI\" em negrito e \"va\" leve; a barra âmbar é lida como o I de MEI porque tem o peso e a altura das maiúsculas. O l minúsculo seria mais alto e, no \"va\" fino, bem mais magro. Segunda leitura: a barra destoa da cor e lembra o cursor do celular. Leitura esperada: MEIva. Risco: quem lê letra por letra pode hesitar entre I e l por meio segundo, como em qualquer fonte sem serifa."),
    ("Haste 180 · âmbar-cobre", "Mesma leitura, mas o cobre puxa para o laranja e parece uma terceira cor da marca, longe do âmbar do botão. No daltonismo tritan vira vermelho-rosado."),
    ("Haste larga 215 · âmbar-tinta", "A barra larga se afasta mais do l (o l da Lexend 700 tem 160 de haste) e lê como bloco de cursor. Por outro lado, fica mais pesada que o M e o E e parece um destaque colado, não uma letra."),
    ("Haste larga 215 · âmbar-cobre", "A mais chamativa: lê-se \"ME ▮ va\" antes de MEIva. A barra vira o assunto."),
]

REC = """<p><b>Recomendação:</b> nome <b>B1 · haste 180 em âmbar-tinta</b> com ícone <b>G3 · sublinhado</b>.</p>
<ul>
<li><b>Nome:</b> a haste de 180 tem o mesmo peso visual das letras (seção 2) e lê I pelo peso e pela altura. O âmbar-tinta fica no mesmo tom do âmbar do botão, só mais escuro.</li>
<li><b>Ícone:</b> o G3 é o mais longe dos ícones amarelos. O fundo é todo petróleo, o M claro é o assunto e o âmbar vira só o traço do cursor. Em 16 px continua sendo o M do favicon de hoje, com um traço âmbar: muda pouco para quem já conhece. O G2 (bloco justo) é a segunda opção, mais marcante, mas ainda é um quadrado âmbar com letra escura.</li>
<li><b>F:</b> o F1 ainda lembra envelope e o F2 lembra casinha ou coroa. Os dois perdem para o par B1 + G3; sugiro arquivar.</li>
</ul>"""

partes = [secao("Recomendação", "Leia depois de ver as seções 1 a 4.", REC)]

# 1. teste MElva
linhas = []
refs = [("ref-l400", 'Referência: "MElva" com l minúsculo da Lexend 400'), ("ref-l700", 'Referência: "MElva" com l da Lexend 700'), ("ref-I700", 'Referência: "MEIva" com o I serifado da Lexend')]
for nome, rot in refs + B1:
    cel = "".join(f'<td class="t">{img(f"{nome}-logo-claro.svg", h)}</td>' for h in (72, 28, 18))
    cel += f'<td class="t">{img(f"{nome}-logo-claro.svg", 28, extra="class=cinza")}</td>'
    linhas.append(f'<tr><th>{rot}</th>{cel}</tr>')
partes.append(
    secao(
        '1 · Teste "MElva"',
        "<b>Resultado honesto:</b> o que separa o cursor de um l é a altura (700 contra 740) e a cor. Compare com a 2ª linha: em 18 px e em cinza essa diferença quase some. A leitura \"MEIva\" se apoia no contexto (\"MEI\" é palavra conhecida do público) e no peso igual ao de \"ME\". Nenhuma das quatro elimina o risco por completo; a haste larga reduz um pouco. O cursor tem a altura exata das maiúsculas (700) e o peso das hastes de MEI. O l minúsculo da Lexend sobe até 740 e, nos 400 de \"va\", tem haste de 103. Altura do logo: 72, 28 (lateral) e 18 px; última coluna em cinza.",
        f'<table class="melva"><tr><th></th><th>72 px</th><th>28 px</th><th>18 px</th><th>28 px cinza</th></tr>{"".join(linhas)}</table>'
        + '<h3>Teste dos 5 segundos (minha previsão do que alguém leria sem contexto; não é teste com pessoas)</h3><ul class="cinco">'
        + "".join(f"<li><b>{a}:</b> {b}</li>" for a, b in CINCO)
        + "</ul>",
    )
)

# 2. peso óptico
cel = ""
for t, rot in (("claro-tinta", "claro · tinta"), ("claro-cobre", "claro · cobre"), ("petroleo", "petróleo")):
    bg = "#0d5c57" if t == "petroleo" else "#f2f4f2"
    cel += f'<div class="peso" style="background:{bg}">' + "".join(
        f'<figure>{img(f"peso-{lc}-{t}.svg", 120)}<figcaption class="{"cl" if t=="petroleo" else ""}">{lc}</figcaption></figure>' for lc in (165, 180, 195)
    ) + f'<span class="{"cl" if t=="petroleo" else ""}">{rot}</span></div>'
partes.append(
    secao(
        "2 · Peso óptico do cursor",
        "Haste do E = 165. O âmbar é mais claro que o petróleo, então o cursor na mesma largura parece mais fino. 180 (+9%) iguala o peso visual no claro; no petróleo, 180 também fica equilibrado.",
        f'<div class="pesos">{cel}</div>',
    )
)

# 3. as 4 versões do nome em todos os fundos
partes.append(
    secao(
        "3 · B1 · nome em todos os fundos",
        "Letras em curvas. M redesenhado: diagonais a 60° exatos, mesma espessura da haste (165).",
        "".join(f'<h3>{rot}</h3><div class="logos">{fundo_logos(nome)}</div>' for nome, rot in B1),
    )
)

# 4. ícones G
def linha_icone(nome, rot):
    tams = "".join(f'<figure>{img(f"{nome}-icone-petroleo.svg", s, s, f"style=border-radius:{s*0.22:.0f}px")}<figcaption>{s}</figcaption></figure>' for s in (16, 24, 32, 48, 64))
    fav = "".join(f'<figure>{img(f"{nome}-favicon-petroleo.svg", s, s)}<figcaption>fav {s}</figcaption></figure>' for s in (16, 32))
    seg = (
        f'<figure class="seguro">{img(f"{nome}-icone-petroleo.svg", 112, 112)}<i></i><figcaption>zona segura</figcaption></figure>'
        f'<figure>{img(f"{nome}-icone-petroleo.svg", 112, 112, "style=border-radius:50%")}<figcaption>redondo</figcaption></figure>'
        f'<figure>{img(f"{nome}-icone-escuro.svg", 112, 112, "style=border-radius:26px")}<figcaption>escuro</figcaption></figure>'
        f'<figure>{img(f"{nome}-icone-preto.svg", 112, 112, "style=border-radius:26px")}<figcaption>1 cor</figcaption></figure>'
    )
    return f'<div class="ic"><h3>{rot}</h3><div class="tams">{tams}{fav}</div><div class="tams">{seg}</div></div>'


partes.append(
    secao(
        "4 · G · ícone (sempre sobre petróleo)",
        "Quanto menor a área âmbar, mais longe dos ícones de fundo amarelo. O M é vazado de verdade (furo), não pintado.",
        '<div class="ics">' + "".join(linha_icone(n, r) for n, r in G) + "</div>",
    )
)

# 5. F
partes.append(
    secao(
        "5 · F · comprovante (curinga)",
        "Furos reais na linha escrita; o cursor âmbar no fim da linha liga o F à ideia do cursor.",
        "".join(f'<h3>{rot}</h3><div class="logos">{fundo_logos(n, 60)}</div>' for n, rot in F)
        + '<div class="ics">' + "".join(linha_icone(n, r) for n, r in F) + "</div>",
    )
)

# 6. bateria de cor
def linha_filtros(src, h, rot, bg="#f2f4f2"):
    return f'<tr><th>{rot}</th>' + "".join(
        f'<td style="background:{bg}">{img(src, h, extra=f"class={f}" if f else "")}</td>' for f, _ in FILTROS
    ) + "</tr>"


bat = [linha_filtros(f"{nome}-logo-claro.svg", 40, rot) for nome, rot in B1[:2]]
bat.append(linha_filtros(f"{NOME}-logo-petroleo.svg", 40, "Nome no petróleo", "#0d5c57"))
bat.append(linha_filtros(f"{NOME}-logo-escuro.svg", 40, "Nome no escuro", "#131a19"))
bat += [linha_filtros(f"{n}-icone-petroleo.svg", 56, r, "#fdfdfb") for n, r in G + F]
partes.append(
    secao(
        "6 · Escala de cinza e daltonismo",
        "Simulação com as matrizes de Machado et al. (2009), severidade total, em RGB linear. É uma aproximação de tela, não substitui testar com pessoas.",
        f'<table class="bat"><tr><th></th>{"".join(f"<th>{r}</th>" for _, r in FILTROS)}</tr>{"".join(bat)}</table>',
    )
)

# 7. simulações de uso
def lateral(tema):
    escuro = tema == "escuro"
    bg, tx, ativo, at_tx = ("#1b2422", "#edf0ee", "#21403c", "#5cc2b7") if escuro else ("#fdfdfb", "#1b2422", "#e1eeec", "#0d5c57")
    itens = "".join(
        f'<li style="{f"background:{ativo};color:{at_tx};font-weight:700" if i == 0 else ""}"><b class="ico" style="border-color:{at_tx if i==0 else tx}"></b>{t}</li>'
        for i, t in enumerate(["Conversa", "Resumo", "Fiados"])
    )
    pagina = "#131a19" if escuro else "#f2f4f2"
    return (
        f'<div class="app" style="background:{pagina}"><aside style="background:{bg};color:{tx}">'
        f'{img(f"{NOME}-logo-{tema}.svg", 30)}<ul>{itens}</ul></aside>'
        f'<main style="color:{tx}"><p class="h">Conversa</p><p>Escreva do jeito que você fala.</p></main></div>'
    )


def topo_celular(tema):
    escuro = tema == "escuro"
    bg, tx = ("#131a19", "#edf0ee") if escuro else ("#f2f4f2", "#1b2422")
    return (
        f'<div class="cel" style="background:{bg};color:{tx}"><div class="barra">{img(f"{NOME}-logo-{tema}.svg", 24)}'
        f'<span>Hoje <b>R$ 320,00</b></span></div><div class="campo" style="border-color:{"#3a4744" if escuro else "#c5ccc9"}">vendi 50 de pudim</div></div>'
    )


def aba(tema, icone):
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


mocks = (
    '<div class="mocks">'
    f'<div><h3>Lateral do computador · claro</h3>{lateral("claro")}</div>'
    f'<div><h3>Lateral do computador · escuro</h3>{lateral("escuro")}</div>'
    f'<div><h3>Topo do celular · claro e escuro</h3>{topo_celular("claro")}{topo_celular("escuro")}</div>'
    "</div>"
    '<h3>Aba do navegador (favicon real em 16 px)</h3><div class="abas-grid">'
    + "".join(f'<div><p class="mini">{r}</p>{aba("claro", n)}{aba("escuro", n)}</div>' for n, r in G)
    + '</div><h3>Tela inicial do celular (ícone em 60 px; os outros ícones são genéricos)</h3><div class="homes">'
    + "".join(f'<div><p class="mini">{r}</p>{tela_inicial(n)}</div>' for n, r in G)
    + "</div>"
)
partes.append(secao("7 · Simulações de uso", f"Nome {NOME}. Fontes do app: Atkinson Hyperlegible Next quando instalada; aqui cai na fonte do sistema.", mocks))

# 8. contraste
contraste = [
    ("Petróleo #0d5c57 no papel #f2f4f2", "7,1:1", "letras do nome"),
    ("Âmbar-tinta #8f5d00 no papel", "5,1:1", "cursor (é a letra I: precisa de 4,5:1)"),
    ("Âmbar-tinta na folha #fdfdfb", "5,5:1", ""),
    ("Âmbar-cobre #a55300 no papel", "5,0:1", ""),
    ("Âmbar-claro #f5c04f no petróleo", "4,7:1", "cursor no petróleo e âmbar dos ícones (o #f2b134 dava 4,1:1)"),
    ("Âmbar #f2b134 no escuro #131a19", "9,3:1", ""),
    ("Folha #fdfdfb no petróleo", "7,7:1", "letras do nome e M do ícone G3/G4"),
    ("Petróleo (furo do M) no âmbar-claro", "4,7:1", "M dos ícones G1/G2"),
    ("Texto #edf0ee no escuro", "15,4:1", ""),
]
partes.append(
    secao(
        "8 · Contraste",
        "Mínimo pedido: 4,5:1 onde há texto e 3:1 em elemento gráfico.",
        '<table class="ct">' + "".join(f"<tr><td>{a}</td><td><b>{b}</b></td><td>{c}</td></tr>" for a, b, c in contraste) + "</table>",
    )
)

html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>MEIva · exploração 2</title>
<style>
body {{ margin:0; padding:40px; width:1640px; background:#e6e9e7; color:#1b2422; font:16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size:30px; margin:0 0 4px; }} .intro {{ margin:0 0 24px; color:#4a5552; }}
section {{ background:#fdfdfb; border-radius:20px; padding:24px 28px; margin-bottom:22px; }}
h2 {{ font-size:22px; margin:0; }} h3 {{ font-size:14px; margin:16px 0 8px; color:#4a5552; }} .sub {{ margin:4px 0 12px; color:#4a5552; }}
.mini {{ font-size:13px; margin:0 0 6px; color:#4a5552; }}
table {{ border-collapse:separate; border-spacing:8px; }} th {{ text-align:left; font-size:13px; font-weight:600; color:#4a5552; }}
.melva td.t {{ background:#f2f4f2; border-radius:10px; padding:10px 14px; }}
.bat td {{ border-radius:10px; padding:10px 14px; text-align:center; }}
.logos {{ display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }}
.fundo {{ border-radius:14px; height:118px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; border:1px solid #0001; }}
.fundo span {{ font-size:12px; color:#4a5552; }} .cl {{ color:#ffffffb0 !important; }}
.pesos {{ display:flex; gap:12px; }} .peso {{ border-radius:14px; padding:12px 16px; display:flex; gap:14px; align-items:flex-end; position:relative; }}
.peso > span {{ position:absolute; top:6px; left:12px; font-size:12px; color:#4a5552; }}
figure {{ margin:0; text-align:center; position:relative; }} figcaption {{ font-size:11px; color:#4a5552; margin-top:4px; }}
.ics {{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }} .ic {{ background:#f2f4f2; border-radius:14px; padding:4px 16px 14px; }}
.tams {{ display:flex; gap:14px; align-items:flex-end; margin-top:10px; }}
.seguro img {{ border-radius:26px; }} .seguro i {{ position:absolute; left:11.2px; top:11.2px; width:89.6px; height:89.6px; border:1.5px dashed #f2b134; border-radius:50%; box-sizing:border-box; }}
.cinza {{ filter:grayscale(1); }} .protan {{ filter:url(#protan); }} .deutan {{ filter:url(#deutan); }} .tritan {{ filter:url(#tritan); }}
.mocks {{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }}
.app {{ display:flex; height:260px; border-radius:14px; overflow:hidden; border:1px solid #0002; }}
.app aside {{ width:210px; padding:22px 14px; box-sizing:border-box; }} .app ul {{ list-style:none; padding:0; margin:26px 0 0; font-size:17px; }}
.app li {{ display:flex; gap:10px; align-items:center; padding:10px 12px; border-radius:12px; margin-bottom:4px; }}
.ico {{ width:18px; height:18px; border:2px solid; border-radius:5px; box-sizing:border-box; }}
.app main {{ padding:26px; font-size:16px; }} .app .h {{ font-size:26px; font-weight:700; margin:0 0 4px; }}
.cel {{ width:360px; border-radius:14px; border:1px solid #0002; margin-bottom:10px; padding:14px 16px; box-sizing:border-box; }}
.barra {{ display:flex; justify-content:space-between; align-items:center; font-size:16px; }} .campo {{ margin-top:14px; border:2px solid; border-radius:14px; padding:10px 12px; }}
.abas-grid, .homes {{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }}
.abas {{ display:flex; gap:2px; padding:8px 8px 0; border-radius:10px 10px 0 0; margin-bottom:8px; }}
.aba {{ display:flex; gap:8px; align-items:center; padding:8px 12px; border-radius:8px 8px 0 0; font:12px system-ui; width:170px; }}
.aba em {{ margin-left:auto; font-style:normal; opacity:.6; }} .aba.off {{ opacity:.7; }} .fav-gen {{ width:16px; height:16px; border-radius:4px; background:#8a8f98; }}
.home {{ background:linear-gradient(#e8e2d8,#d9d2c6); border-radius:18px; padding:16px; display:grid; grid-template-columns:repeat(4,1fr); gap:12px 8px; }}
.app-i {{ display:flex; flex-direction:column; align-items:center; font-size:11px; color:#1b2422; }} .app-i b {{ width:60px; height:60px; border-radius:14px; }}
.app-i span {{ margin-top:4px; }}
.cinco li {{ margin-bottom:6px; max-width:1300px; }}
.ct td {{ background:#f2f4f2; padding:6px 10px; border-radius:6px; font-size:14px; }}
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>
<filter id="protan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0"/></filter>
<filter id="deutan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0"/></filter>
<filter id="tritan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0"/></filter>
</defs></svg>
<h1>MEIva · exploração 2</h1>
<p class="intro">B1 (nome) + G (ícone), com F como curinga. Letras em curvas a partir da Lexend (OFL); M, cursor e ícones desenhados do zero.</p>
{"".join(partes)}
</body></html>"""
open(os.path.join(AQUI, "previa.html"), "w", encoding="utf-8").write(html)
print("previa.html ok")
