"""Monta previa.html (folha de contato) a partir de direcoes.json e das SVGs em svg/."""
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
dirs = json.load(open(os.path.join(AQUI, "direcoes.json"), encoding="utf-8"))
notas = {}
p_notas = os.path.join(AQUI, "notas.json")
if os.path.exists(p_notas):
    notas = json.load(open(p_notas, encoding="utf-8"))

FUNDOS = [
    ("claro", "#f2f4f2", "#1b2422", "Fundo claro"),
    ("petroleo", "#0d5c57", "#fdfdfb", "Petróleo"),
    ("escuro", "#131a19", "#edf0ee", "Escuro"),
    ("preto", "#ffffff", "#1b2422", "Preto (1 cor)"),
    ("branco", "#000000", "#ffffff", "Branco (negativo)"),
]

linhas = []
for d in dirs:
    i = d["id"]
    logos = "".join(
        f'<div class="fundo" style="background:{bg};color:{tx}"><img class="logo" src="svg/{i}-logo-{t}.svg" alt=""><span>{nome}</span></div>'
        for t, bg, tx, nome in FUNDOS
    )
    tamanhos = "".join(
        f'<figure><img src="svg/{i}-icone-petroleo.svg" width="{s}" height="{s}" style="border-radius:{s*0.22:.0f}px" alt=""><figcaption>{s}</figcaption></figure>'
        for s in (16, 24, 32, 64)
    )
    simb_claro = "".join(
        f'<figure><img src="svg/{i}-simbolo-claro.svg" width="{s}" height="{s}" alt=""><figcaption>{s}</figcaption></figure>'
        for s in (16, 24, 32, 64)
    )
    n = notas.get(i, {})
    porque = "".join(f"<li>{x}</li>" for x in n.get("porque", []))
    riscos = "".join(f"<li>{x}</li>" for x in n.get("riscos", []))
    rec = ' <b class="rec">recomendada</b>' if n.get("recomendada") else ""
    linhas.append(
        f"""
<section class="dir">
  <header><h2>{d['nome']}{rec}</h2><p class="fam">{d['familia']}</p><p class="ideia">{d['ideia']}</p></header>
  <div class="logos">{logos}</div>
  <div class="testes">
    <div class="bloco"><h3>Ícone do app (16–64 px)</h3><div class="tams">{tamanhos}</div></div>
    <div class="bloco"><h3>Símbolo em fundo claro</h3><div class="tams claro">{simb_claro}</div></div>
    <div class="bloco"><h3>Ícone com zona segura</h3><div class="tams">
      <figure class="seguro"><img src="svg/{i}-icone-petroleo.svg" width="112" height="112" alt=""><i></i><figcaption>quadrado</figcaption></figure>
      <figure><img src="svg/{i}-icone-petroleo.svg" width="112" height="112" style="border-radius:50%" alt=""><figcaption>máscara redonda</figcaption></figure>
      <figure><img src="svg/{i}-icone-escuro.svg" width="112" height="112" style="border-radius:26px" alt=""><figcaption>escuro</figcaption></figure>
      <figure><img src="svg/{i}-icone-preto.svg" width="112" height="112" style="border-radius:26px" alt=""><figcaption>1 cor</figcaption></figure>
    </div></div>
  </div>
  {"<div class='notas'><div><h3>Por que combina</h3><ul>" + porque + "</ul></div><div><h3>Riscos</h3><ul>" + riscos + "</ul></div></div>" if porque else ""}
</section>"""
    )

html = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>MEIva · exploração 1 da marca</title>
<style>
  body {{ margin:0; padding:40px; background:#e6e9e7; font:16px/1.45 system-ui, sans-serif; color:#1b2422; width:1640px; }}
  h1 {{ font-size:30px; margin:0 0 4px; }} .sub {{ margin:0 0 28px; color:#4a5552; }}
  .dir {{ background:#fdfdfb; border-radius:20px; padding:24px 28px; margin-bottom:24px; }}
  .dir header {{ display:grid; grid-template-columns: 340px 1fr; column-gap:24px; align-items:baseline; }}
  h2 {{ font-size:22px; margin:0; grid-row: span 2; }} .fam {{ margin:0; color:#4a5552; font-size:14px; }} .ideia {{ margin:2px 0 0; font-size:17px; }}
  .rec {{ background:#0d5c57; color:#fff; font-size:13px; padding:2px 8px; border-radius:8px; vertical-align:middle; }}
  .logos {{ display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin:18px 0 14px; }}
  .fundo {{ border-radius:14px; height:132px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; border:1px solid #0001; }}
  .fundo span {{ font-size:12px; opacity:.7; }} .logo {{ max-width:84%; max-height:76px; }}
  .testes {{ display:grid; grid-template-columns: 1fr 1fr 1.6fr; gap:14px; }}
  .bloco {{ background:#f2f4f2; border-radius:14px; padding:12px 14px; }} h3 {{ font-size:13px; margin:0 0 8px; color:#4a5552; font-weight:600; }}
  .tams {{ display:flex; gap:16px; align-items:flex-end; }} figure {{ margin:0; text-align:center; position:relative; }}
  figcaption {{ font-size:11px; color:#4a5552; margin-top:4px; }}
  .seguro i {{ position:absolute; left:11.2px; top:11.2px; width:89.6px; height:89.6px; border:1.5px dashed #f2b134; border-radius:50%; box-sizing:border-box; }}
  .seguro img {{ border-radius:26px; }}
  .notas {{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:12px; font-size:14px; }} .notas ul {{ margin:0; padding-left:18px; }}
</style></head><body>
<h1>MEIva · exploração 1 da marca</h1>
<p class="sub">7 direções. Letras em curvas a partir da Lexend (OFL); cursor, símbolos e ícones desenhados do zero. Âmbar no fundo claro: <b>#9a6400</b> (âmbar-tinta); no petróleo e no escuro: <b>#f2b134</b>. Tamanhos do ícone em pixels reais.</p>
{''.join(linhas)}
</body></html>
"""
open(os.path.join(AQUI, "previa.html"), "w", encoding="utf-8").write(html)
print("previa.html ok")
