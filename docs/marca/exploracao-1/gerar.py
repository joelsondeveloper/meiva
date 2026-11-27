"""Gera as SVGs da exploração 1 da marca MEIva.

Requer fontTools num ambiente FORA do repositório (C:\\dev\\_ferramentas\\venv) e o módulo
glifos.py de C:\\dev\\_ferramentas. As letras saem como curvas (paths), sem <text>.
Lexend e Atkinson Hyperlegible Next: SIL Open Font License 1.1.

    C:\\dev\\_ferramentas\\venv\\Scripts\\python gerar.py
"""
import os
import sys

sys.path.insert(0, r"C:\dev\_ferramentas")
from glifos import Fonte  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "svg")
os.makedirs(SAIDA, exist_ok=True)

COR = {
    "petroleo": "#0d5c57",
    "petroleo_claro": "#5cc2b7",
    "ambar": "#f2b134",
    "ambar_tinta": "#9a6400",  # âmbar para fundo claro (>= 4,5:1 sobre papel e folha)
    "papel": "#f2f4f2",
    "folha": "#fdfdfb",
    "tinta": "#1b2422",
    "escuro": "#131a19",
    "texto_escuro": "#edf0ee",
}

# Temas: (fundo, cor das letras, cor de destaque, cor de recorte sobre a forma)
TEMAS = {
    "claro": (COR["papel"], COR["petroleo"], COR["ambar_tinta"], COR["folha"]),
    "petroleo": (COR["petroleo"], COR["folha"], COR["ambar"], COR["petroleo"]),
    "escuro": (COR["escuro"], COR["texto_escuro"], COR["ambar"], COR["escuro"]),
    "preto": ("#ffffff", "#000000", "#000000", "#ffffff"),
    "branco": ("#000000", "#ffffff", "#ffffff", "#000000"),
}

L700 = Fonte("lexend", 700)
L400 = Fonte("lexend", 400)
CAP = 700
HASTE = 165  # espessura da haste vertical da Lexend 700 (E, M)


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


def svg(viewbox, corpo, titulo):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img">'
        f"<title>{titulo}</title>{corpo}</svg>\n"
    )


def p(d, cor):
    return f'<path fill="{cor}" d="{d}"/>'


# ---------------------------------------------------------------- formas próprias

def m_geometrico(x0, base=0.0, w=700, s=HASTE, vertice=-170, cores=None):
    """M desenhado do zero: duas hastes e duas diagonais.

    cores = dict(esq, dir, v) para colorir partes; devolve lista de (d, papel).
    vertice = altura (y) do ponto mais baixo do V (0 = toca a linha de base).
    """
    c = x0 + w / 2
    meia = 80 if vertice < 0 else 78
    esq = rect(x0, base - CAP, s, CAP)
    dir_ = rect(x0 + w - s, base - CAP, s, CAP)
    if vertice < 0:
        diag_e = poly([(x0, base - CAP), (x0 + s, base - CAP), (c + meia, base + vertice), (c - meia, base + vertice)])
        diag_d = poly([(x0 + w - s, base - CAP), (x0 + w, base - CAP), (c + meia, base + vertice), (c - meia, base + vertice)])
        return [(esq, "esq"), (dir_, "dir"), (diag_e, "v"), (diag_d, "v")]
    # V até a linha de base, como peça separada (monograma)
    larg = 157
    xi = x0 + s
    xf = x0 + w - s
    # braços com 157 de largura horizontal (~150 de espessura real a 17°)
    xi, xf = x0, x0 + w  # o braço nasce da borda externa da haste: o M fica inteiro em 1 cor
    larg = s + 40
    a = (xi, base - CAP)
    b = (xi + larg, base - CAP)
    d_ = (xf - larg, base - CAP)
    e = (xf, base - CAP)
    f = (c + meia, base)
    g = (c - meia, base)
    # vértice interno: cruzamento de b->f com d_->g
    t = (c - b[0]) / (f[0] - b[0])
    vi = (c, b[1] + (f[1] - b[1]) * t)
    v = poly([a, b, vi, d_, e, f, g])
    return [(esq, "esq"), (dir_, "dir"), (v, "v")]


def ibeam(cx, larg=380, haste=150, esp=74, curva=42):
    """Cursor de texto em I (⌶): haste + duas serifas curvas, altura de maiúscula com pequena sobra."""
    h = larg / 2
    topo = -CAP - 36
    d = []
    # serifa de cima: arco "sorriso" que desce até a haste
    d.append(
        f"M{n(cx - h)} {n(topo)}Q{n(cx)} {n(topo + curva * 2)} {n(cx + h)} {n(topo)}"
        f"L{n(cx + h)} {n(topo + esp)}Q{n(cx)} {n(topo + esp + curva * 2)} {n(cx - h)} {n(topo + esp)}Z"
    )
    base = 36
    d.append(
        f"M{n(cx - h)} {n(base)}Q{n(cx)} {n(base - curva * 2)} {n(cx + h)} {n(base)}"
        f"L{n(cx + h)} {n(base - esp)}Q{n(cx)} {n(base - esp - curva * 2)} {n(cx - h)} {n(base - esp)}Z"
    )
    meio_topo = topo + esp / 2 + curva  # centro da serifa
    d.append(rect(cx - haste / 2, meio_topo, haste, (base - esp / 2 - curva) - meio_topo))
    return "".join(d)


# ---------------------------------------------------------------- wordmarks

def palavra(itens):
    """itens: lista de (tipo, valor, papel, espaco_antes). Devolve (lista de (d, papel), largura)."""
    partes = []
    x = 0.0
    for tipo, val, papel, esp in itens:
        x += esp
        if tipo == "g":
            fonte, ch = val
            partes.append((fonte.glifo(ch, dx=x), papel))
            x += fonte.avanco(ch)
        elif tipo == "forma":  # val = função(x) -> (d ou [(d, papel)], avanço)
            d, av = val(x)
            if isinstance(d, list):
                partes.extend(d)
            else:
                partes.append((d, papel))
            x += av
    return partes, x


def caixa_tinta(partes_d):
    """Caixa aproximada a partir dos números dos paths (suficiente para viewBox)."""
    import re

    xs, ys = [], []
    for d in partes_d:
        nums = [float(v) for v in re.findall(r"-?\d+\.?\d*", d.replace("A", " A "))]
        # paths com arcos têm flags; filtramos só pares plausíveis
        for i in range(0, len(nums) - 1, 2):
            xs.append(nums[i])
            ys.append(nums[i + 1])
    return min(xs), min(ys), max(xs), max(ys)


def wordmark_padrao(papel_I="letra", forma_I=None, esp=None):
    """MEI em 700 + va em 400. O I pode ser trocado por uma forma (cursor)."""
    esp = esp or {}
    itens = [
        ("g", (L700, "M"), "letra", 0),
        ("g", (L700, "E"), "letra", esp.get("ME", -10)),
    ]
    if forma_I is None:
        itens.append(("g", (L700, "I"), papel_I, esp.get("EI", -20)))
    else:
        itens.append(("forma", forma_I, papel_I, esp.get("EI", 0)))
    itens += [
        ("g", (L400, "v"), "letra", esp.get("Iv", 0)),
        ("g", (L400, "a"), "letra", esp.get("va", -6)),
    ]
    return palavra(itens)


# ---------------------------------------------------------------- direções

DIRECOES = []


def direcao(fn):
    DIRECOES.append(fn)
    return fn


def pintar(partes, tema):
    fundo, letra, destaque, recorte = TEMAS[tema]
    # o que é vazado dentro de uma forma âmbar: petróleo nos temas de cor, fundo no P&B
    recorte_dest = COR["petroleo"] if tema in ("claro", "petroleo") else (COR["escuro"] if tema == "escuro" else fundo)
    mapa = {"letra": letra, "esq": letra, "dir": letra, "v": letra, "destaque": destaque, "recorte": recorte, "recorte_destaque": recorte_dest}
    return "".join(p(d, mapa[papel]) for d, papel in partes)


@direcao
def b1_cursor():
    """B1 · Cursor na haste: o I de MEI é um cursor com a espessura e o espaço de uma letra."""

    def cursor(x):
        # haste com a largura da Lexend 700, altura de maiúscula; espaço lateral de letra (88)
        return rect(x + 88, -CAP, HASTE, CAP), 88 + HASTE + 52

    partes, w = wordmark_padrao(forma_I=cursor, papel_I="destaque", esp={"EI": -40})
    # símbolo: M cuja haste direita é o cursor, mais alto que a letra (cursor "passa" da linha)
    m = m_geometrico(0, vertice=-170)
    simb = [(d, "letra") for d, papel in m if papel != "dir"]
    simb.append((rect(700 - HASTE, -CAP - 150, HASTE, CAP + 300), "destaque"))
    return dict(
        id="b1-cursor",
        nome="B1 · Cursor na haste",
        familia="(a) wordmark com detalhe",
        ideia="O I de MEI é o cursor de digitação: a marca está sempre pronta para anotar.",
        palavra=(partes, w),
        simbolo=(simb, (-60, -CAP - 170, 820, CAP + 340)),
    )


@direcao
def b2_ibeam():
    """B2 · Cursor em I (⌶): o cursor de texto do computador já tem forma de I."""

    def cur(x):
        return ibeam(x + 230), 460

    partes, w = wordmark_padrao(forma_I=cur, papel_I="destaque", esp={"EI": -30, "Iv": -10})
    simb = [(ibeam(0, larg=480, haste=170, esp=90, curva=50), "destaque")]
    return dict(
        id="b2-ibeam",
        nome="B2 · Cursor em I",
        familia="(a) wordmark com detalhe",
        ideia="O I é o cursor de texto (⌶), que já tem forma de I: lê-se letra e lê-se \"escreva aqui\".",
        palavra=(partes, w),
        simbolo=(simb, (-420, -CAP - 100, 840, CAP + 200)),
        simbolo_destaque_sozinho=True,
    )


@direcao
def c_monograma():
    """C · Monograma M com o va dentro: o V do M desce até a base, em âmbar."""
    m = m_geometrico(0, vertice=0, w=820)
    mapa = {"esq": "letra", "dir": "letra", "v": "destaque"}
    simb = [(d, mapa[papel]) for d, papel in m]

    # wordmark com o mesmo M
    def mforma(x):
        return [(d, mapa[papel]) for d, papel in m_geometrico(x + 88, vertice=0, w=820)], 88 + 820 + 60

    itens = [
        ("forma", mforma, "letra", 0),
        ("g", (L700, "E"), "letra", -20),
        ("g", (L700, "I"), "letra", -20),
        ("g", (L400, "v"), "letra", 0),
        ("g", (L400, "a"), "letra", -6),
    ]
    partes, w = palavra(itens)
    return dict(
        id="c-monograma",
        nome="C · M que guarda o va",
        familia="(c) monograma",
        ideia="O V do M desce até a linha e fica âmbar: o M de MEI carrega o \"va\" (vai, segue).",
        palavra=(partes, w),
        simbolo=(simb, (-60, -CAP - 60, 940, CAP + 120)),
    )


@direcao
def d_caderninho():
    """D · Caderninho: o caderno de fiado do balcão, com o cursor na capa."""
    # símbolo em unidades 0..1000 (y para baixo a partir de -1000)
    capa = rrect(150, -860, 600, 860, 90)
    arames = "".join(rect(x, -960, 56, 170) for x in (255, 422, 589))
    furos = "".join(rrect(x + 8, -830, 40, 40, 20) for x in (255, 422, 589))
    cursor = rect(330, -600, 110, 440)
    linha = rect(450, -260, 200, 90)
    simb = [(arames, "letra"), (capa, "letra"), (furos, "recorte"), (cursor, "destaque")]
    partes, w = wordmark_padrao()
    return dict(
        id="d-caderninho",
        nome="D · Caderninho",
        familia="(b) símbolo + wordmark",
        ideia="O caderninho do fiado que todo balcão conhece, agora com cursor: anotar sem papel.",
        palavra=(partes, w),
        simbolo=(simb, (50, -1010, 800, 1060)),
        lockup="simbolo",
    )


@direcao
def e_campo():
    """E · Campo: a marca é o próprio campo de conversa, com o cursor esperando."""
    partes, w = wordmark_padrao()
    # cursor fino depois do "va", maior que a letra, como no campo de texto
    cur = rect(w + 120, -CAP - 40, 72, CAP + 120)
    partes = partes + [(cur, "destaque")]
    w2 = w + 120 + 72
    pad_x, pad_y, esp = 400, 230, 56
    x0, y0 = -pad_x, -CAP - pad_y
    W, H = w2 + 2 * pad_x, CAP + 2 * pad_y
    anel = rrect(x0, y0, W, H, H / 2) + rrect(x0 + esp, y0 + esp, W - 2 * esp, H - 2 * esp, H / 2 - esp)
    partes = [(anel, "letra")] + partes
    # símbolo: campo com o cursor piscando no começo (campo vazio)
    campo = rrect(0, -420, 1000, 420, 210) + rrect(56, -364, 888, 308, 154)
    simb = [(campo, "letra"), (rect(190, -330, 80, 240), "destaque"), (rect(330, -232, 300, 70), "letra")]
    return dict(
        id="e-campo",
        nome="E · Campo",
        familia="(d) só tipografia e forma simples",
        ideia="A marca é o campo onde se escreve: um contorno de pílula e o cursor esperando a frase.",
        palavra=(partes, w2),
        viewbox_palavra=(x0 - 20, y0 - 20, W + 40, H + 40),
        simbolo=(simb, (-40, -720, 1080, 1020)),
        simbolo_evenodd=True,
        anel=True,
    )


@direcao
def f_picote():
    """F · Picote (ousada): o comprovante, assinatura do app, rasgado em forma de M."""
    # folha com topo em V (o M) e base picotada (dentes)
    larg, alt = 760, 900
    x0, yb = 120, 0
    topo = -alt
    dentes = 5
    passo = larg / dentes
    pts = [(x0, topo), (x0 + larg / 2, topo + 300), (x0 + larg, topo)]
    pts.append((x0 + larg, yb - 60))
    for i in range(dentes):
        xa = x0 + larg - i * passo
        pts.append((xa - passo / 2, yb))
        pts.append((xa - passo, yb - 60))
    folha = poly(pts)
    l1 = rect(x0 + 130, -430, 500, 70)
    tot = rect(x0 + 130, -280, 300, 90)
    simb = [(folha, "letra"), (l1, "recorte"), (tot, "destaque")]
    partes, w = wordmark_padrao()
    return dict(
        id="f-picote",
        nome="F · Picote (ousada)",
        familia="(e) ousada",
        ideia="O comprovante (a assinatura do app) rasgado no alto em forma de M: cada anotação vira papel passado a limpo.",
        palavra=(partes, w),
        simbolo=(simb, (60, -960, 880, 1000)),
        lockup="simbolo",
        recorte_destaque=True,
    )


@direcao
def g_cursor_bloco():
    """G · Cursor-bloco (B3): o I de MEI é um cursor em bloco, e o ícone é o M com o cursor dentro."""

    def cursor(x):
        return rrect(x + 70, -CAP, 200, CAP, 18), 70 + 200 + 60

    partes, w = wordmark_padrao(forma_I=cursor, papel_I="destaque", esp={"EI": -45, "Iv": -4})
    # símbolo: tile com M em recorte e cursor âmbar ao lado da perna direita, dentro do mesmo bloco
    bloco = rrect(-170, -CAP - 170, 1040, CAP + 340, 70)
    m = m_geometrico(0, vertice=-170)
    simb = [(bloco, "destaque")] + [(d, "recorte_destaque") for d, _ in m]
    return dict(
        id="g-bloco",
        nome="G · Cursor em bloco",
        familia="(a) wordmark com detalhe",
        ideia="O I vira o bloco de cursor que pisca; no ícone, o bloco âmbar fica sobre o M, como no terminal.",
        palavra=(partes, w),
        simbolo=(simb, (-190, -CAP - 190, 1080, CAP + 380)),
    )


# ---------------------------------------------------------------- saída

def vb(b):
    return " ".join(n(v) for v in b)


def gerar():
    meta = []
    for fn in DIRECOES:
        d = fn()
        partes, w = d["palavra"]
        # viewBox do logo
        if d.get("lockup") == "simbolo":
            sp, sb = d["simbolo"]
            # símbolo com altura 1,3x a maiúscula, à esquerda do wordmark
            esc = (CAP * 1.32) / sb[3]
            gap = 230
            dx = -sb[0] * esc
            dy = -CAP * 1.16 - sb[1] * esc
            ws = sb[2] * esc
            grupo_s = (sp, f"translate({n(dx)} {n(dy)}) scale({n(esc)})")
            grupo_w = (partes, f"translate({n(ws + gap)} 0)")
            vbox = (-40, -CAP * 1.16 - 40, ws + gap + w + 80, CAP * 1.32 + 80)
            logos = [grupo_s, grupo_w]
        else:
            vbox = d.get("viewbox_palavra") or (-40, -CAP - 120, w + 80, CAP + 240)
            logos = [(partes, "")]
        regra = ' fill-rule="evenodd"' if d.get("anel") or d.get("simbolo_evenodd") else ""
        for tema in TEMAS:
            corpo = "".join(f'<g transform="{t}"{regra}>{pintar(ps, tema)}</g>' for ps, t in logos)
            open(os.path.join(SAIDA, f"{d['id']}-logo-{tema}.svg"), "w", encoding="utf-8").write(
                svg(vb(vbox), corpo, f"MEIva – {d['nome']}")
            )
        # símbolo solto
        sp, sb = d["simbolo"]
        lado = max(sb[2], sb[3])
        sq = (sb[0] - (lado - sb[2]) / 2, sb[1] - (lado - sb[3]) / 2, lado, lado)
        for tema in TEMAS:
            corpo = f"<g{regra}>{pintar(sp, tema)}</g>"
            open(os.path.join(SAIDA, f"{d['id']}-simbolo-{tema}.svg"), "w", encoding="utf-8").write(
                svg(vb(sq), corpo, f"MEIva – símbolo {d['nome']}")
            )
        # ícone de app: quadrado 1024, fundo petróleo, símbolo dentro da zona segura (círculo de 80%)
        for tema_icone, tema_simb in (("petroleo", "petroleo"), ("escuro", "escuro"), ("preto", "branco")):
            fundo = TEMAS[tema_simb][0] if tema_simb != "branco" else "#000000"
            caixa = 560  # lado do quadrado que cabe no círculo seguro de 819 (80% de 1024)
            esc = caixa / lado
            tx = 512 - (sq[0] + lado / 2) * esc
            ty = 512 - (sq[1] + lado / 2) * esc
            corpo = (
                f'<rect width="1024" height="1024" fill="{fundo}"/>'
                f'<g transform="translate({n(tx)} {n(ty)}) scale({n(esc)})"{regra}>{pintar(sp, tema_simb)}</g>'
            )
            open(os.path.join(SAIDA, f"{d['id']}-icone-{tema_icone}.svg"), "w", encoding="utf-8").write(
                svg("0 0 1024 1024", corpo, f"MEIva – ícone {d['nome']}")
            )
        meta.append({k: d[k] for k in ("id", "nome", "familia", "ideia")})
    import json

    json.dump(meta, open(os.path.join(AQUI, "direcoes.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("ok:", ", ".join(m["id"] for m in meta))


if __name__ == "__main__":
    gerar()
