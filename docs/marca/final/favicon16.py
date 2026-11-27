"""Corte de 16 px do favicon: desenhado pixel a pixel (cada pixel é um quadrado inteiro).

A grade sai do M vetorial rasterizado em 10 x 9 px (limiar de 50%) e foi ajustada à mão:
hastes de 2 px, V que desce até a linha 6, traço do cursor de 10 x 2 px, 1 px abaixo do M.
"""
M = {
    "A": [  # limiar de 50% do vetor
        "###....###",
        "####..####",
        "##########",
        "##########",
        "##.####.##",
        "##..##..##",
        "##..##..##",
        "##......##",
        "##......##",
    ],
    "B": [  # V em escada, contraformas abrindo mais cedo
        "###....###",
        "####..####",
        "##.#..#.##",
        "##.####.##",
        "##..##..##",
        "##..##..##",
        "##......##",
        "##......##",
        "##......##",
    ],
}
X0, Y0 = 3, 2  # canto do M na grade de 16
BARRA = (3, 12, 10, 2)  # x, y, largura, altura


def svg(variante, fundo="#0d5c57", letra="#fdfdfb", acento="#f5c04f", raio=3):
    rects = []
    for j, linha in enumerate(M[variante]):
        i = 0
        while i < len(linha):
            if linha[i] == "#":
                k = i
                while k < len(linha) and linha[k] == "#":
                    k += 1
                rects.append(f'<rect x="{X0 + i}" y="{Y0 + j}" width="{k - i}" height="1"/>')
                i = k
            else:
                i += 1
    x, y, w, h = BARRA
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges">'
        f'<title>MEIva</title><rect width="16" height="16" rx="{raio}" fill="{fundo}" shape-rendering="geometricPrecision"/>'
        f'<g fill="{letra}">{"".join(rects)}</g><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{acento}"/></svg>\n'
    )


if __name__ == "__main__":
    import sys
    pasta = sys.argv[1] if len(sys.argv) > 1 else "."
    for v in M:
        open(f"{pasta}/favicon-16-{v}.svg", "w", encoding="utf-8").write(svg(v))
        open(f"{pasta}/favicon-16-{v}-1cor.svg", "w", encoding="utf-8").write(svg(v, "#000000", "#ffffff", "#ffffff"))
