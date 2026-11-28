"""Arquivos finais da marca MEIva (Fase 4).

Nome: M próprio (60°) + E Lexend 700 + I de serifa curta (300) em âmbar + "va" Lexend 400.
Ícone: G3b, o M com o cursor sublinhado (traço de 702 x 165, a 100 do M).

Gera SVGs em svg/, PNGs em png/, web/ e social/, e copia para public/ os arquivos que não
conflitam com as convenções do Next (favicon.ico, icon.svg e apple-icon vão em src/app na Fase 5).

    C:\\dev\\_ferramentas\\venv\\Scripts\\python gerar.py
"""
import os
import shutil
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", "..", ".."))
import importlib.util  # noqa: E402

# os geradores das explorações também se chamam gerar.py: carrega o da exploração 3 pelo caminho
_spec = importlib.util.spec_from_file_location("exploracao3", os.path.join(AQUI, "..", "exploracao-3", "gerar.py"))
_e3 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_e3)

from favicon16 import svg as favicon16_svg  # noqa: E402

e2 = _e3.e2
COR = e2.COR
CAP = e2.CAP
n = e2.n
RENDER = r"C:/Users/vicen/.claude/skills/logo-design/scripts/render_png.py"

# cor das letras e do âmbar por fundo
TEMAS = {
    "claro": ("#f2f4f2", COR["petroleo"], COR["tinta"]),  # âmbar-tinta #8f5d00
    "petroleo": (COR["petroleo"], COR["folha"], COR["ambar_claro"]),  # âmbar-claro #f5c04f
    "escuro": (COR["escuro"], COR["texto_escuro"], COR["ambar"]),  # âmbar #f2b134
    "preto": ("#ffffff", "#000000", "#000000"),
    "branco": ("#000000", "#ffffff", "#ffffff"),
}


def pasta(*p):
    d = os.path.join(AQUI, *p)
    os.makedirs(d, exist_ok=True)
    return d


def escrever(caminho, texto):
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(texto)


def svg(viewbox, corpo, titulo, extra=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}"{extra} role="img"><title>{titulo}</title>{corpo}</svg>\n'


def render(origem, destino, **kw):
    args = ["python", RENDER, origem, "-o", destino]
    for k, v in kw.items():
        args += [f"--{k}", str(v)]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr)


# ------------------------------------------------------------------ desenho

def logo_partes():
    partes, x_fim = _e3.wordmark(_e3.cursor_serifa(300), 128, 70)
    L400 = e2.L400
    direita = x_fim - L400.avanco("a") + L400.caixa("a")[2]
    caixa = (88, -CAP, direita - 88, CAP + 10)  # tinta exata: do M até o "a" (o "a" passa 10 da linha)
    return partes, caixa


def simbolo_camadas():
    camadas, caixa = _e3.g3(702, 165, 100)
    return camadas, caixa  # (0, -700, 702, 965)


def corpo_logo(partes, letra, acento):
    cor = {"letra": letra, "cursor": acento}
    return "".join(e2.path(d, cor[p]) for d, p in partes)


def corpo_simbolo(camadas, letra, acento):
    cor = {"letra": letra, "acento": acento}
    return "".join(e2.path(d, cor[p], eo) for d, p, eo in camadas)


def icone(camadas, caixa, fundo, letra, acento, conteudo, raio):
    """Quadrado de 1024 com o símbolo centrado num quadrado de `conteudo` px."""
    lado = max(caixa[2], caixa[3])
    esc = conteudo / lado
    cx, cy = caixa[0] + caixa[2] / 2, caixa[1] + caixa[3] / 2
    g = f'<g transform="translate({n(512 - cx * esc)} {n(512 - cy * esc)}) scale({n(esc)})">{corpo_simbolo(camadas, letra, acento)}</g>'
    return f'<rect width="1024" height="1024" rx="{raio}" fill="{fundo}"/>' + g


def gerar():
    partes, cx = logo_partes()
    camadas, cs = simbolo_camadas()
    vb_logo = " ".join(n(v) for v in cx)
    vb_simb = " ".join(n(v) for v in cs)

    d_logo, d_simb, d_icone, d_web = pasta("svg", "logo"), pasta("svg", "simbolo"), pasta("svg", "icone"), pasta("web")
    for t, (_, letra, acento) in TEMAS.items():
        escrever(os.path.join(d_logo, f"meiva-logo-{t}.svg"), svg(vb_logo, corpo_logo(partes, letra, acento), "MEIva"))
        escrever(os.path.join(d_simb, f"meiva-simbolo-{t}.svg"), svg(vb_simb, corpo_simbolo(camadas, letra, acento), "MEIva"))

    p, f, a = COR["petroleo"], COR["folha"], COR["ambar_claro"]
    icones = {
        # ícone "any": quadrado arredondado (22%), símbolo em 600 de 1024
        "meiva-icone": icone(camadas, cs, p, f, a, 600, 225),
        "meiva-icone-escuro": icone(camadas, cs, COR["escuro"], COR["texto_escuro"], COR["ambar"], 600, 225),
        "meiva-icone-1cor": icone(camadas, cs, "#000000", "#ffffff", "#ffffff", 600, 225),
        # maskable: sangra até a borda; símbolo em 560, dentro do círculo seguro de 80% (819 px)
        "meiva-icone-maskable": icone(camadas, cs, p, f, a, 560, 0),
        # apple-touch-icon: quadrado cheio (o iOS arredonda sozinho), símbolo em 600
        "meiva-icone-apple": icone(camadas, cs, p, f, a, 600, 0),
        # favicon vetorial para tamanhos grandes (o de 16 px usa a grade de pixels)
        "meiva-favicon-vetor": icone(camadas, cs, p, f, a, 760, 200),
    }
    for nome, corpo in icones.items():
        escrever(os.path.join(d_icone, f"{nome}.svg"), svg("0 0 1024 1024", corpo, "MEIva"))

    # favicon.svg: o desenho em grade de 16 px (nítido em 16, 32 e 48)
    escrever(os.path.join(d_web, "favicon.svg"), favicon16_svg("A"))
    escrever(os.path.join(d_web, "favicon-1cor.svg"), favicon16_svg("A", "#000000", "#ffffff", "#ffffff"))

    exportar(d_logo, d_simb, d_icone, d_web)
    social(d_logo, d_icone)
    copiar_public()
    print("ok")


# ------------------------------------------------------------------ PNG, ICO

def exportar(d_logo, d_simb, d_icone, d_web):
    from PIL import Image

    _, cx = logo_partes()
    png_logo, png_simb = pasta("png", "logo"), pasta("png", "simbolo")
    for t in TEMAS:
        render(os.path.join(d_logo, f"meiva-logo-{t}.svg"), os.path.join(png_logo, f"meiva-logo-{t}-1200.png"), width=1200, height=round(1200 * cx[3] / cx[2]))
        render(os.path.join(d_simb, f"meiva-simbolo-{t}.svg"), os.path.join(png_simb, f"meiva-simbolo-{t}-512.png"), size=512)
    png_icone = pasta("png", "icone")
    for nome in ("meiva-icone", "meiva-icone-escuro", "meiva-icone-1cor", "meiva-icone-maskable"):
        render(os.path.join(d_icone, f"{nome}.svg"), os.path.join(png_icone, f"{nome}-1024.png"), size=1024)

    # web
    render(os.path.join(d_icone, "meiva-icone-apple.svg"), os.path.join(d_web, "apple-touch-icon.png"), size=180)
    for s in (192, 512):
        render(os.path.join(d_icone, "meiva-icone.svg"), os.path.join(d_web, f"icon-{s}.png"), size=s)
        render(os.path.join(d_icone, "meiva-icone-maskable.svg"), os.path.join(d_web, f"icon-maskable-{s}.png"), size=s)

    # favicon.ico: 16 (grade), 32 e 48 (a mesma grade ampliada 2x e 3x, sem suavizar)
    tmp16 = os.path.join(d_web, "_fav16.png")
    render(os.path.join(d_web, "favicon.svg"), tmp16, size=16)
    base = Image.open(tmp16).convert("RGBA")
    # o Pillow descarta tamanhos maiores que a imagem principal: a principal é a de 48
    i32, i48 = (base.resize((s, s), Image.NEAREST) for s in (32, 48))
    i48.save(os.path.join(d_web, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[base, i32])
    base.resize((160, 160), Image.NEAREST).save(os.path.join(d_web, "favicon-16-ampliado-10x.png"))
    os.remove(tmp16)


def social(d_logo, d_icone):
    d_soc = pasta("social")
    fonte = "file:///C:/dev/_ferramentas/fontes/atkinson-next-latin-var.woff2"
    logo = "file:///" + os.path.join(d_logo, "meiva-logo-petroleo.svg").replace("\\", "/")
    og = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: Atk; src: url("{fonte}") format("woff2"); font-weight: 200 800; }}
html, body {{ margin:0; width:1200px; height:630px; background:{COR['petroleo']}; }}
.c {{ position:absolute; left:96px; top:0; bottom:0; display:flex; flex-direction:column; justify-content:center; gap:44px; }}
img {{ height:150px; width:auto; align-self:flex-start; }}
p {{ margin:0; font:400 52px/1.25 Atk, sans-serif; color:{COR['texto_escuro']}; max-width:1020px; }}
</style></head><body><div class="c"><img src="{logo}" alt=""><p>O caixa do seu negócio numa conversa.</p></div></body></html>"""
    html = os.path.join(d_soc, "_og.html")
    escrever(html, og)
    render(html, os.path.join(d_soc, "og-image-1200x630.png"), width=1200, height=630)
    os.remove(html)
    # avatar do Instagram: corte redondo; símbolo pequeno o bastante para caber no círculo
    camadas, cs = simbolo_camadas()
    av = icone(camadas, cs, COR["petroleo"], COR["folha"], COR["ambar_claro"], 520, 0)
    tmp = os.path.join(d_soc, "_av.svg")
    escrever(tmp, svg("0 0 1024 1024", av, "MEIva"))
    render(tmp, os.path.join(d_soc, "instagram-avatar-400.png"), size=400)
    os.remove(tmp)


def copiar_public():
    """public/ recebe só o que não conflita com src/app (favicon.ico, icon e apple-icon ficam para a Fase 5)."""
    pub = os.path.join(RAIZ, "public")
    web, soc = os.path.join(AQUI, "web"), os.path.join(AQUI, "social")
    for nome in ("icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png"):
        shutil.copy(os.path.join(web, nome), os.path.join(pub, nome))
    shutil.copy(os.path.join(soc, "og-image-1200x630.png"), os.path.join(pub, "og-image.png"))


if __name__ == "__main__":
    gerar()
