"""Exploração 3 (última) da marca MEIva: nome B1 (haste x I com serifa reta) + ícone G3 refinado.

Reaproveita o M próprio, as cores e os auxiliares da exploração 2.
    C:\\dev\\_ferramentas\\venv\\Scripts\\python gerar.py
"""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "exploracao-2"))
import gerar as e2  # noqa: E402

from gerar import COR, CAP, L400, L700, m_proprio, rect, path, svg, n, vb  # noqa: E402

SAIDA = os.path.join(AQUI, "svg")
os.makedirs(SAIDA, exist_ok=True)
e2.SAIDA = SAIDA  # os auxiliares de gravação passam a escrever aqui

HASTE_CURSOR = 180  # 165 + 9% de compensação óptica (rodada 2)
SERIFA_ESP = 130  # espessura da serifa: um pouco menor que os braços do E (145), horizontais parecem mais grossas


def cursor_haste(x):
    return rect(x, -CAP, HASTE_CURSOR, CAP), HASTE_CURSOR


def cursor_serifa(largura):
    """I com serifas retas e curtas: haste 180 + duas barras de `largura` total, sem curva."""

    def forma(x):
        aba = (largura - HASTE_CURSOR) / 2
        pts = [
            (x, -CAP), (x + largura, -CAP), (x + largura, -CAP + SERIFA_ESP), (x + aba + HASTE_CURSOR, -CAP + SERIFA_ESP),
            (x + aba + HASTE_CURSOR, -SERIFA_ESP), (x + largura, -SERIFA_ESP), (x + largura, 0), (x, 0),
            (x, -SERIFA_ESP), (x + aba, -SERIFA_ESP), (x + aba, -CAP + SERIFA_ESP), (x, -CAP + SERIFA_ESP),
        ]
        return e2.poly(pts), largura

    return forma


def wordmark(forma_i, gap_e, gap_v):
    """M próprio + E 700 + I (forma) + va 400, com espaços medidos de tinta a tinta."""
    partes = []
    x = 88.0
    m, W = m_proprio(x)
    partes.append((m, "letra"))
    x += W + 88 - 10
    partes.append((L700.glifo("E", dx=x), "letra"))
    borda_e = x + L700.caixa("E")[2]
    xi = borda_e + gap_e
    d, w = forma_i(xi)
    partes.append((d, "cursor"))
    x = xi + w + gap_v - L400.lsb("v")
    partes.append((L400.glifo("v", dx=x), "letra"))
    x += L400.avanco("v") - 6
    partes.append((L400.glifo("a", dx=x), "letra"))
    x += L400.avanco("a")
    return partes, x


NOMES = {
    # id: (forma, espaço E→I, espaço I→v, rótulo)
    # haste: mesmos espaços da rodada 2
    "haste": (cursor_haste, 100, 52, "Haste 180"),
    # serifa: o braço do E e a serifa ficam frente a frente na mesma altura; com 100 eles
    # quase se emendam numa barra só, então o espaço sobe para 128 (≈ E→I da própria Lexend, 133).
    # Do I para o v, a serifa de baixo avança sob o braço do v: 70 basta.
    "serifa-curta": (cursor_serifa(300), 128, 70, "I com serifa curta (300)"),
    "serifa-media": (cursor_serifa(370), 132, 66, "I com serifa média (370)"),
}


# ------------------------------------------------------------------ ícone G3

def g3(largura, espessura, distancia):
    m, W = m_proprio(0)
    x0 = (W - largura) / 2
    barra = rect(x0, distancia, largura, espessura)
    caixa = (0, -CAP, W, CAP + distancia + espessura)
    return [(m, "letra", False), (barra, "acento", False)], caixa


ICONES = {
    # id: (largura, espessura, distância do M, rótulo)
    "g3a": (702, 120, 110, "G3a · como na rodada 2 (702 × 120, a 110)"),
    "g3b": (702, 165, 100, "G3b · traço com a espessura da haste (702 × 165, a 100)"),
    "g3c": (540, 165, 100, "G3c · traço mais curto (540 × 165, a 100)"),
    "g3d": (702, 200, 120, "G3d · traço grosso e mais afastado (702 × 200, a 120)"),
}


def gerar():
    for nome, (forma, ge, gv, rot) in NOMES.items():
        partes, w = wordmark(forma, ge, gv)
        e2.gerar_wordmark(nome, partes, w, COR["tinta"], f"MEIva – {rot}")
    for nome, (lg, es, di, rot) in ICONES.items():
        camadas, caixa = g3(lg, es, di)
        e2.gerar_icone(nome, camadas, caixa, f"MEIva – ícone {rot}")
    print("svgs ok:", len(os.listdir(SAIDA)))


if __name__ == "__main__":
    gerar()
