#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ghost Protocol - Serveur local (fichiers + proxy IA Gemini)
- Garde la clé API CÔTÉ SERVEUR (jamais envoyée au navigateur)
- Budget quotidien conservateur : le jeu ne tombe jamais à sec
- Sans clé : le jeu fonctionne normalement (contenu local)

Lancer : python3 server.py [--port 8080] [--dir .]
Config : fichier server_config.json (voir exemple ci-dessous)
"""
import json
import os
import sys
import time
import datetime
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(DIR, "server_config.json")
BUDGET_PATH = os.path.join(DIR, "server_budget.json")
BUDGET_GROQ_PATH = os.path.join(DIR, "server_budget_groq.json")

DEFAULTS = {
    "api_key": "",
    "model": "gemini-2.5-flash",
    "groq_api_key": "",
    "groq_model": "llama-3.3-70b-versatile",
    "provider_roles": {
        "missions": "gemini",
        "news": "groq",
        "contacts": "groq",
        "rivals": "groq"
    },
    "daily_budget_requests": 60,
    "daily_budget_tokens": 100000,
    "groq_daily_budget_requests": 400,
    "groq_daily_budget_tokens": 2000000,
    "timeout": 60
}

SKILL_LIST = "python, javascript, linux, windows, reseaux, crypto, social_engineering, reverse, web_hacking, forensics, stealth, exploits, anonymat, pentest, malware, mobile_hacking, cloud, hardware, osint, ia"
MINIGAME_LIST = "bruteforce, sequence, timing, osint, evasion"

PROMPTS = {
    "missions": (
        "Tu écris des missions pour un jeu de hacker narratif en français (Ghost Protocol). "
        "Réponds UNIQUEMENT avec un tableau JSON de 5 objets, sans texte autour, format : "
        '[{"title": "...", "desc": "...", "skill": "...", "minigame": "...", "difficulty": 20, '
        '"reward": {"money": 600, "rep": 4, "heat": 8}, "successText": "...", "failText": "..."}]\n'
        "Règles :\n"
        "- title : court et concret (max 60 caractères), cible toujours différente\n"
        "- desc : 1-2 phrases d'ambiance réaliste, jamais la même cible ni le même motif entre les 5\n"
        f"- skill : uniquement une de ces valeurs : {SKILL_LIST}\n"
        f"- minigame : uniquement une de ces valeurs : {MINIGAME_LIST}\n"
        "- difficulty : entier 12-40\n"
        "- reward.money : entier 200-5000 ; rep : entier 2-15 ; heat : entier 2-25\n"
        "- successText / failText : 1 phrase chacune avec conséquence narrative\n"
        "- Style roman noir hacker, en français. Sois précis et crédible.\n"
        "Contexte du joueur : {context}"
    ),
    "news": (
        "Génère un tableau JSON de 8 dépêches d'actualité cyber en français, une phrase chacune "
        "(max 140 caractères), style fil d'actualité. Mélange : darknet, police, fuites de données, "
        "crypto, vulnérabilités, anecdotes de hackers. 2 d'entre elles doivent réagir à la situation "
        "du joueur : {context}. Réponds UNIQUEMENT avec un tableau JSON de chaînes de caractères, "
        "SANS objet englobant, sans texte autour.\n"
        "Exemple de format attendu : [\"dépêche un\", \"dépêche deux\", \"dépêche trois\"]"
    ),
    "contacts": (
        "Tu es l'auteur d'un jeu de hacker français. Pour chaque contact, écris UNE réplique de dialogue "
        "(1-2 phrases, max 180 caractères) fidèle à sa personnalité et à sa relation avec le joueur. "
        "Réponds UNIQUEMENT avec un objet JSON clé -> réplique, sans texte autour.\n"
        "Contacts : {contacts}\n"
        "Contexte du joueur : {context}"
    ),
    "rivals": (
        "Génère un tableau JSON de 8 provocations courtes (max 120 caractères) que des hackers rivaux "
        "écriraient sur un forum, en français. Variées : mépris, défi, vantardise, menace voilée, humour noir. "
        "Réponds UNIQUEMENT avec un tableau JSON de chaînes de caractères, SANS objet englobant, sans texte autour.\n"
        "Exemple de format attendu : [\"provocation un\", \"provocation deux\", \"provocation trois\"]\n"
        "Contexte du joueur : {context}"
    )
}

MAX_OUTPUT = {"missions": 1200, "news": 800, "contacts": 500, "rivals": 300}


def load_config():
    cfg = dict(DEFAULTS)
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg.update(json.load(f))
        except Exception as e:
            print("[CONFIG] Erreur de lecture de server_config.json :", e)
    return cfg


CONFIG = load_config()


def today():
    return datetime.date.today().isoformat()


def budget_file(provider):
    return BUDGET_GROQ_PATH if provider == "groq" else BUDGET_PATH


def load_budget(provider="gemini"):
    default = {"date": today(), "requests": 0, "tokens": 0}
    path = budget_file(provider)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                b = json.load(f)
            if b.get("date") != today():
                b = default
        except Exception:
            b = default
    else:
        b = default
    return b


def save_budget(provider, b):
    try:
        with open(budget_file(provider), "w", encoding="utf-8") as f:
            json.dump(b, f)
    except Exception as e:
        print("[BUDGET] Erreur d'écriture :", e)


def budget_allows(provider):
    b = load_budget(provider)
    if provider == "groq":
        return b["requests"] < CONFIG["groq_daily_budget_requests"] and b["tokens"] < CONFIG["groq_daily_budget_tokens"], b
    return b["requests"] < CONFIG["daily_budget_requests"] and b["tokens"] < CONFIG["daily_budget_tokens"], b


def spend(provider, tokens):
    b = load_budget(provider)
    b["requests"] += 1
    b["tokens"] += tokens
    save_budget(provider, b)
    if provider == "groq":
        print("[AI][groq] +1 requête, %d tokens — %d/%d requêtes, %d/%d tokens aujourd'hui" % (
            tokens, b["requests"], CONFIG["groq_daily_budget_requests"],
            b["tokens"], CONFIG["groq_daily_budget_tokens"]))
    else:
        print("[AI][gemini] +1 requête, %d tokens — %d/%d requêtes, %d/%d tokens aujourd'hui" % (
            tokens, b["requests"], CONFIG["daily_budget_requests"],
            b["tokens"], CONFIG["daily_budget_tokens"]))
    return b


def strip_fences(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()


def call_gemini(prompt, max_tokens):
    url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (
        CONFIG["model"], CONFIG["api_key"])
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.9,
            "responseMimeType": "application/json",
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=CONFIG["timeout"]) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    parts = [p for p in parts if not p.get("thought")]
    text = "".join(p.get("text", "") for p in parts)
    usage = data.get("usageMetadata", {})
    tokens = usage.get("promptTokenCount", 0) + usage.get("candidatesTokenCount", 0)
    return strip_fences(text), tokens


def call_groq(prompt, max_tokens):
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": CONFIG["groq_model"],
        "messages": [
            {"role": "system", "content": "Tu réponds UNIQUEMENT avec un JSON valide, sans texte autour, sans marques de code."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.9,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"}
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                 headers={"Content-Type": "application/json",
                                          "Authorization": "Bearer " + CONFIG["groq_api_key"],
                                          "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"})
    with urllib.request.urlopen(req, timeout=CONFIG["timeout"]) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    text = data["choices"][0]["message"]["content"]
    usage = data.get("usage", {})
    tokens = usage.get("prompt_tokens", 0) + usage.get("completion_tokens", 0)
    return strip_fences(text), tokens


def provider_key(provider):
    return "api_key" if provider == "gemini" else "groq_api_key"


def generate(kind, context):
    prompt = build_prompt(kind, context)
    max_tokens = MAX_OUTPUT.get(kind, 300)
    primary = CONFIG["provider_roles"].get(kind) or "gemini"
    fallback = "groq" if primary == "gemini" else "gemini"

    providers = []
    if CONFIG.get(provider_key(primary)):
        providers.append(primary)
    if fallback != primary and CONFIG.get(provider_key(fallback)):
        providers.append(fallback)

    last_reason = None
    for provider in providers:
        allowed, b = budget_allows(provider)
        if not allowed:
            last_reason = "budget"
            print("[AI][%s] Budget du jour atteint (%d requêtes)" % (provider, b["requests"]))
            continue
        try:
            if provider == "groq":
                text, tokens = call_groq(prompt, max_tokens)
            else:
                text, tokens = call_gemini(prompt, max_tokens)
        except urllib.error.HTTPError as e:
            last_reason = "rate_limit" if e.code == 429 else "api"
            print("[AI][%s] Erreur HTTP %d (%s)" % (provider, e.code, last_reason))
            continue
        except Exception as e:
            last_reason = "api"
            print("[AI][%s] Erreur réseau : %s" % (provider, e))
            continue

        data = parse_json(text)
        if data is None:
            last_reason = "api"
            print("[AI][%s] Réponse JSON invalide pour %s : %s..." % (provider, kind, text[:120]))
            continue

        if kind in ("missions", "news", "rivals") and isinstance(data, dict):
            for v in data.values():
                if isinstance(v, list):
                    data = v
                    break
            else:
                print("[AI][%s] %s : objet sans tableau JSON" % (provider, kind))
                last_reason = "api"
                continue

        spend(provider, tokens)
        return data, provider

    return None, last_reason


def parse_json(text):
    import re
    text = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    start = text.find("[")
    if start == -1:
        start = text.find("{")
    end = text.rfind("]")
    if end == -1:
        end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except Exception:
        return None


def build_prompt(kind, context):
    prompt = PROMPTS[kind]
    ctx = context or {}
    prompt = prompt.replace("{context}", ctx.get("context", ""))
    if kind == "contacts":
        contacts = ctx.get("contacts") or {}
        contacts_txt = "; ".join("%s (relation %s)" % (k, v) for k, v in contacts.items())
        prompt = prompt.replace("{contacts}", contacts_txt)
    return prompt


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, fmt, *args):
        pass

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if urlparse(self.path).path == "/api/status":
            b = load_budget("gemini")
            bg = load_budget("groq")
            self.send_json({
                "configured": bool(CONFIG["api_key"]) or bool(CONFIG["groq_api_key"]),
                "model": CONFIG["model"],
                "groq_model": CONFIG["groq_model"],
                "used_requests": b["requests"],
                "budget_requests": CONFIG["daily_budget_requests"],
                "used_tokens": b["tokens"],
                "budget_tokens": CONFIG["daily_budget_tokens"],
                "groq_used_requests": bg["requests"],
                "groq_budget_requests": CONFIG["groq_daily_budget_requests"],
                "reset_date": b["date"]
            })
            return
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/ai":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length <= 0:
                self.send_json({"ok": False, "reason": "empty"}, 400)
                return
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            self.send_json({"ok": False, "reason": "bad_request"}, 400)
            return

        kind = body.get("kind")
        if kind not in PROMPTS:
            self.send_json({"ok": False, "reason": "unknown_kind"}, 400)
            return

        if not (CONFIG["api_key"] or CONFIG["groq_api_key"]):
            self.send_json({"ok": False, "reason": "nokey"})
            return

        data, info = generate(kind, body.get("context") or {})
        if data is None:
            self.send_json({"ok": False, "reason": info or "api"})
            return

        self.send_json({"ok": True, "data": data, "provider": info})


def main():
    port = 8080
    args = sys.argv[1:]
    if "--port" in args:
        port = int(args[args.index("--port") + 1])
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print("Ghost Protocol — http://localhost:%d (LAN : %s:%d)" % (port, get_lan_ip(), port))
    providers = []
    if CONFIG["api_key"]:
        providers.append("Gemini (%s)" % CONFIG["model"])
    if CONFIG["groq_api_key"]:
        providers.append("Groq (%s)" % CONFIG["groq_model"])
    if providers:
        print("IA ACTIVE : %s — rôles : %s" % (
            " + ".join(providers),
            ", ".join("%s→%s" % (k, v) for k, v in CONFIG["provider_roles"].items())))
    else:
        print("IA : PAS DE CLÉ — édite server_config.json puis redémarre (le jeu fonctionne sans).")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt.")


def get_lan_ip():
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


if __name__ == "__main__":
    main()
