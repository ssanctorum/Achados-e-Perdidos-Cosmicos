#!/usr/bin/env python3
"""Validates data/items.json against the project rules. Usage: python3 scripts/validate.py"""
import json, sys, pathlib

F = pathlib.Path(__file__).resolve().parent.parent / "data" / "items.json"
CORPOS = {"terra", "lua", "marte", "espaco"}
STATUS = {"ativo", "silencioso", "concluído"}
HIST_MAX = 80
DESC_MIN, DESC_MAX = 30, 40  # project rule; change here if the team picks another range
MARCAS = {
    "pt": ["O que é:", "O que descobriu:", "Onde está hoje:"],
    "en": ["What it is:", "What it found:", "Where it is today:"],
}
OBRIGATORIOS = ["id", "corpo", "nome", "status", "ano", "fonte", "data_consulta"] + [
    f"{c}_{l}" for c in ("historia", "descricao_visual", "ultimo_sinal") for l in ("pt", "en")
]

n = lambda s: len(s.split())
erros, avisos = [], []
d = json.loads(F.read_text(encoding="utf-8"))
ids = [i.get("id") for i in d]
for dup in {x for x in ids if ids.count(x) > 1}:
    erros.append(f"id duplicado: {dup}")

for i in d:
    k = i.get("id", "?")
    for c in OBRIGATORIOS:
        if not str(i.get(c, "")).strip():
            erros.append(f"{k}: campo vazio ou ausente: {c}")
    if i.get("corpo") not in CORPOS:
        erros.append(f"{k}: corpo inválido: {i.get('corpo')}")
    if i.get("status") not in STATUS:
        erros.append(f"{k}: status fora da lista fixa: {i.get('status')}")
    for l in ("pt", "en"):
        h = i.get(f"historia_{l}", "")
        if n(h) > HIST_MAX:
            erros.append(f"{k}: historia_{l} tem {n(h)} palavras (máx. {HIST_MAX})")
        falta = [m for m in MARCAS[l] if m not in h]
        if falta:
            erros.append(f"{k}: historia_{l} sem o modelo fixo: {falta}")
        dv = n(i.get(f"descricao_visual_{l}", ""))
        if not DESC_MIN <= dv <= DESC_MAX:
            avisos.append(f"{k}: descricao_visual_{l} tem {dv} palavras (faixa {DESC_MIN}-{DESC_MAX})")
    if i.get("corpo") == "espaco":
        if not isinstance(i.get("distancia_ua"), (int, float)) or not i.get("data_distancia"):
            erros.append(f"{k}: espaço profundo precisa de distancia_ua e data_distancia")
    elif i.get("locais"):
        if not all(-90 <= a <= 90 and -180 <= b <= 180 for a, b in i["locais"]):
            erros.append(f"{k}: locais fora do intervalo")
    elif i.get("lat") is not None:
        if not (-90 <= i["lat"] <= 90 and -180 <= i["lng"] <= 180):
            erros.append(f"{k}: lat/lng fora do intervalo")
    else:
        avisos.append(f"{k}: sem lat/lng (sem pino no globo)")
    for r in i.get("relacionados", []):
        if r not in ids:
            erros.append(f"{k}: relacionado inexistente: {r}")
    if not str(i.get("fonte", "")).startswith("http"):
        avisos.append(f"{k}: fonte pendente")
    if i.get("data_consulta") in ("pendente", "", None):
        avisos.append(f"{k}: data_consulta pendente (fato ainda não conferido)")

print(f"{len(d)} itens")
for a in avisos:
    print("AVISO:", a)
for e in erros:
    print("ERRO: ", e)
print(f"{len(erros)} erro(s), {len(avisos)} aviso(s)")
sys.exit(1 if erros else 0)
