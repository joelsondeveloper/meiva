"""Exploração 2 da marca MEIva: B1 (nome) + G (ícone) e F (curinga).

Gera as SVGs em svg/ e a previa.html (folha de contato com a bateria de testes).
Requer fontTools fora do repositório (C:\\dev\\_ferramentas\\venv) e glifos.py de C:\\dev\\_ferramentas.

    C:\\dev\\_ferramentas\\venv\\Scripts\\python gerar.py
"""
import math
import os
import sys

sys.path.insert(0, r"C:\dev\_ferramentas")
from glifos import Fonte  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "svg")
os.makedirs(SAIDA, exist_ok=True)

COR = {
    "petroleo": "#0d5c57",
    "ambar": "#f2b134",
    "ambar_claro": "#f5c04f",  # âmbar sobre petróleo: 4,7:1 (o #f2b134 dá 4,1:1)
    "tinta": "#8f5d00",  # âmbar-tinta: 5,1:1 no papel, 5,5:1 na folha
    "cobre": "#a55300",  # âmbar-cobre: 5,0:1 no papel, 5,4:1 na folha
    "papel": "#f2f4f2",
    "folha": "#fdfdfb",
    "texto": "#1b2422",
    "escuro": "#131a19",
    "superficie_escura": "#1b2422",
    "texto_escuro": "#edf0ee",
}

L700 = Fonte("lexend", 700)
L400 = Fonte("lexend", 400)
CAP = 700
HASTE = 165
TAN60 = math.tan(math.radians(60))


def n(v):
    return ("%.1f" % v).rstrip("0").rstrip(".")


def poly(pts):
    return "M" + "L".join(f"{n(x)} {n(y)}" for x, y in pts) + "Z"


def rect(x, y, w, h):
    return poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])


def rrect(x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    return (
        f"M{n(x + r)} {n(y)}H{n(x + w - r)}A{n(r)} {n(r)} 0 0 1 {n(x + w)} {n(y + r)}"
        f"V{n(y + h - r)}A{n(r)} {n(r)} 0 0 1 {n(x + w - r)} {n(y + h)}"
        f"H{n(x + r)}A{n(r)} {n(r)} 0 0 1 {n(x)} {n(y + h - r)}"
        f"V{n(y + r)}A{n(r)} {n(r)} 0 0 1 {n(x + r)} {n(y)}Z"
    )


def path(d, cor, evenodd=False):
    regra = ' fill-rule="evenodd"' if evenodd else ""
    return f'<path fill="{cor}"{regra} d="{d}"/>'


def svg(viewbox, corpo, titulo):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img">'
        f"<title>{titulo}</title>{corpo}</svg>\n"
    )


def salvar(nome, conteudo):
    open(os.path.join(SAIDA, nome), "w", encoding="utf-8").write(conteudo)


# ------------------------------------------------------------------ o M próprio

def m_proprio(x0=0.0):
    """M num contorno só, diagonais a 60° exatos, haste 165 e diagonal com 165 de espessura real.

    Mesma caixa da Lexend 700 (702 de largura, vértice externo em -170). Construção:
    a borda de cada diagonal é uma reta a 60°; a largura horizontal da diagonal é
    165 / sen 60° = 190, então a espessura perpendicular fica igual à da haste.
    """
    W, s, d, f = 702.0, HASTE, HASTE / math.sin(math.radians(60)), 66.0
    c = W / 2
    xa = c - f / 2 - (CAP - 170) / TAN60  # borda esquerda da diagonal no topo
    yi = (c - xa - d) * TAN60 - CAP  # vértice interno (fundo do V de cima)
    yc = (s - xa) * TAN60 - CAP  # onde a diagonal encontra a haste por dentro
    pts = [
        (0, 0), (0, -CAP), (xa + d, -CAP), (c, yi), (W - xa - d, -CAP), (W, -CAP),
        (W, 0), (W - s, 0), (W - s, yc), (c + f / 2, -170), (c - f / 2, -170), (s, yc), (s, 0),
    ]
    return poly([(x + x0, y) for x, y in pts]), W


# ------------------------------------------------------------------ wordmark B1

def wordmark(larg_cursor=None, gap_e=100, gap_v=52, ref=None):
    """MEIva: M próprio, E 700, cursor (ou I/l de referência), va 400.

    Devolve (lista de (d, papel), largura). papel: 'letra' ou 'cursor'.
    """
    partes = []
    x = 88.0
    m, W = m_proprio(x)
    partes.append((m, "letra"))
    x += W + 88 - 10  # avanço do M (88 + 702 + 88) com -10 de kerning
    partes.append((L700.glifo("E", dx=x), "letra"))
    borda_e = x + L700.caixa("E")[2]
    if ref:  # referência com glifo de verdade (I da Lexend ou l minúsculo)
        fonte, ch = ref
        x = x + L700.avanco("E") - 20
        partes.append((fonte.glifo(ch, dx=x), "letra"))
        x += fonte.avanco(ch)
        fim_i = x
    else:
        xc = borda_e + gap_e
        partes.append((rect(xc, -CAP, larg_cursor, CAP), "cursor"))
        fim_i = xc + larg_cursor + gap_v - L400.lsb("v")
    x = fim_i
    partes.append((L400.glifo("v", dx=x), "letra"))
    x += L400.avanco("v") - 6
    partes.append((L400.glifo("a", dx=x), "letra"))
    x += L400.avanco("a")
    return partes, x


# ------------------------------------------------------------------ símbolos (ícone)

def g_simbolo(tipo):
    """Símbolo G em unidades de fonte; devolve (camadas, caixa). camada = (d, papel, evenodd)."""
    m, W = m_proprio(0)
    if tipo == "g1":  # bloco grande (como na rodada 1)
        pad = 170
        bloco = rrect(-pad, -CAP - pad, W + 2 * pad, CAP + 2 * pad, 70)
        return [(bloco + m, "acento", True)], (-pad, -CAP - pad, W + 2 * pad, CAP + 2 * pad)
    if tipo == "g2":  # bloco justo: o bloco é o "caractere selecionado", pouco maior que o M
        padx, pady = 96, 96
        bloco = rrect(-padx, -CAP - pady, W + 2 * padx, CAP + 2 * pady, 44)
        return [(bloco + m, "acento", True)], (-padx, -CAP - pady, W + 2 * padx, CAP + 2 * pady)
    if tipo == "g3":  # cursor sublinhado: M claro, barra âmbar embaixo
        barra = rect(0, 110, W, 120)
        return [(m, "letra", False), (barra, "acento", False)], (0, -CAP, W, CAP + 230)
    if tipo == "g4":  # cursor vazado (terminal sem foco): contorno âmbar em volta do M
        pad, esp = 150, 70
        anel = rrect(-pad, -CAP - pad, W + 2 * pad, CAP + 2 * pad, 60) + rrect(
            -pad + esp, -CAP - pad + esp, W + 2 * pad - 2 * esp, CAP + 2 * pad - 2 * esp, 60 - esp / 2
        )
        return [(anel, "acento", True), (m, "letra", False)], (-pad, -CAP - pad, W + 2 * pad, CAP + 2 * pad)
    raise ValueError(tipo)


def f_simbolo(tipo):
    """Comprovante. f1: V no alto (M) e picote embaixo. f2: topo em /\\/\\ (M pontudo)."""
    larg, alt, x0 = 760.0, 900.0, 0.0
    topo = -alt
    dentes, prof = 5, 60
    passo = larg / dentes
    if tipo == "f1":
        cima = [(x0, topo), (x0 + larg / 2, topo + 300), (x0 + larg, topo)]
    else:
        cima = [(x0, topo + 220), (x0 + larg / 4, topo), (x0 + larg / 2, topo + 220), (x0 + 3 * larg / 4, topo), (x0 + larg, topo + 220)]
    pts = list(cima) + [(x0 + larg, -prof)]
    for i in range(dentes):
        xa = x0 + larg - i * passo
        pts += [(xa - passo / 2, 0), (xa - passo, -prof)]
    folha = poly(pts)
    linha = rect(x0 + 130, -390, 330, 80)  # furo: a linha escrita
    cursor = rect(x0 + 500, -470, 90, 240)  # cursor âmbar no fim da linha
    return [(folha + linha, "letra", True), (cursor, "acento", False)], (x0, topo, larg, alt)


# ------------------------------------------------------------------ temas

def tema(nome, acento_claro):
    """(fundo, letra, cursor, acento do símbolo)."""
    return {
        "claro": (COR["papel"], COR["petroleo"], acento_claro, acento_claro),
        "petroleo": (COR["petroleo"], COR["folha"], COR["ambar_claro"], COR["ambar_claro"]),
        "escuro": (COR["escuro"], COR["texto_escuro"], COR["ambar"], COR["ambar"]),
        "preto": ("#ffffff", "#000000", "#000000", "#000000"),
        "branco": ("#000000", "#ffffff", "#ffffff", "#ffffff"),
    }[nome]


TEMAS = ["claro", "petroleo", "escuro", "preto", "branco"]


def vb(b):
    return " ".join(n(v) for v in b)


def gerar_wordmark(nome, partes, w, acento_claro, titulo):
    caixa = (-40, -CAP - 120, w + 80, CAP + 240)
    for t in TEMAS:
        _, letra, cursor, _ = tema(t, acento_claro)
        cor = {"letra": letra, "cursor": cursor}
        corpo = "".join(path(d, cor[papel]) for d, papel in partes)
        salvar(f"{nome}-logo-{t}.svg", svg(vb(caixa), corpo, titulo))


def camadas_svg(camadas, letra, acento):
    cor = {"letra": letra, "acento": acento}
    return "".join(path(d, cor[papel], eo) for d, papel, eo in camadas)


def gerar_icone(nome, camadas, caixa, titulo, letra_sobre_tile="folha"):
    """Ícone 1024 com o símbolo no quadrado de 560 (dentro do círculo seguro de 80%) e favicon com 78%."""
    lado = max(caixa[2], caixa[3])
    cx, cy = caixa[0] + caixa[2] / 2, caixa[1] + caixa[3] / 2
    variantes = {
        "petroleo": (COR["petroleo"], COR["folha"], COR["ambar_claro"]),
        "escuro": (COR["escuro"], COR["texto_escuro"], COR["ambar"]),
        "preto": ("#000000", "#ffffff", "#ffffff"),
    }
    for v, (fundo, letra, acento) in variantes.items():
        for sufixo, caixa_px, raio in (("icone", 560, 0), ("favicon", 800, 200)):
            esc = caixa_px / lado
            g = f'<g transform="translate({n(512 - cx * esc)} {n(512 - cy * esc)}) scale({n(esc)})">{camadas_svg(camadas, letra, acento)}</g>'
            fundo_svg = f'<rect width="1024" height="1024" rx="{raio}" fill="{fundo}"/>'
            salvar(f"{nome}-{sufixo}-{v}.svg", svg("0 0 1024 1024", fundo_svg + g, titulo))
    # símbolo solto (sem quadrado) nos 5 temas
    sq = (cx - lado / 2, cy - lado / 2, lado, lado)
    for t in TEMAS:
        _, letra, _, acento = tema(t, COR["tinta"])
        salvar(f"{nome}-simbolo-{t}.svg", svg(vb(sq), camadas_svg(camadas, letra, acento), titulo))


def gerar_lockup_f(nome, camadas, caixa, titulo):
    partes, w = wordmark(ref=(L700, "I"))
    esc = (CAP * 1.32) / caixa[3]
    ws = caixa[2] * esc
    gap = 230
    dy = -CAP * 1.16 - caixa[1] * esc
    total = ws + gap + w
    vbox = (-40, -CAP * 1.16 - 40, total + 80, CAP * 1.32 + 80)
    for t in TEMAS:
        _, letra, _, acento = tema(t, COR["tinta"])
        corpo = (
            f'<g transform="translate({n(-caixa[0] * esc)} {n(dy)}) scale({n(esc)})">{camadas_svg(camadas, letra, acento)}</g>'
            f'<g transform="translate({n(ws + gap)} 0)">' + "".join(path(d, letra) for d, _ in partes) + "</g>"
        )
        salvar(f"{nome}-logo-{t}.svg", svg(vb(vbox), corpo, titulo))


# ------------------------------------------------------------------ geração

B1 = {
    # id: (largura do cursor, cor no fundo claro, rótulo)
    "b1-h-tinta": (180, COR["tinta"], "haste 180 · âmbar-tinta"),
    "b1-h-cobre": (180, COR["cobre"], "haste 180 · âmbar-cobre"),
    "b1-l-tinta": (215, COR["tinta"], "haste larga 215 · âmbar-tinta"),
    "b1-l-cobre": (215, COR["cobre"], "haste larga 215 · âmbar-cobre"),
}

G = {
    "g1": "bloco grande",
    "g2": "bloco justo",
    "g3": "cursor sublinhado",
    "g4": "cursor vazado",
}
F = {"f1": "V no alto", "f2": "M pontudo"}


def gerar():
    for nome, (lc, cor, rot) in B1.items():
        partes, w = wordmark(larg_cursor=lc)
        gerar_wordmark(nome, partes, w, cor, f"MEIva – {rot}")
    # referências para o teste "MElva" (glifos reais da Lexend, só para comparar)
    for nome, ref in (("ref-l400", (L400, "l")), ("ref-l700", (L700, "l")), ("ref-I700", (L700, "I"))):
        partes, w = wordmark(ref=ref)
        gerar_wordmark(nome, partes, w, COR["tinta"], f"referência {nome}")
    # peso óptico: E + cursor em 3 larguras, no claro e no petróleo
    for lc in (165, 180, 195):
        e = L700.glifo("E", dx=0)
        cur = rect(L700.caixa("E")[2] + 100, -CAP, lc, CAP)
        for t, fundo, letra, cursor in (
            ("claro-tinta", COR["papel"], COR["petroleo"], COR["tinta"]),
            ("claro-cobre", COR["papel"], COR["petroleo"], COR["cobre"]),
            ("petroleo", COR["petroleo"], COR["folha"], COR["ambar_claro"]),
        ):
            corpo = path(e, letra) + path(cur, cursor)
            salvar(f"peso-{lc}-{t}.svg", svg(vb((-40, -CAP - 60, 1000, CAP + 120)), corpo, f"peso {lc}"))
    for nome, rot in G.items():
        camadas, caixa = g_simbolo(nome)
        gerar_icone(nome, camadas, caixa, f"MEIva – ícone {rot}")
    for nome, rot in F.items():
        camadas, caixa = f_simbolo(nome)
        gerar_icone(nome, camadas, caixa, f"MEIva – comprovante {rot}")
        gerar_lockup_f(nome, camadas, caixa, f"MEIva – comprovante {rot}")
    print("svgs ok:", len(os.listdir(SAIDA)))


if __name__ == "__main__":
    gerar()
