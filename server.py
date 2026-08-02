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

DEFAULTS = {
    "api_key": "",
    "model": "gemini-2.5-flash",
    "daily_budget_requests": 60,
    "daily_budget_tokens": 100000,
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
        "du joueur : {context}. Réponds UNIQUEMENT avec le tableau JSON, sans texte autour."
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
        "Réponds UNIQUEMENT avec le tableau JSON, sans texte autour.\n"
        "Contexte du joueur : {context}"
    )
}

MAX_OUTPUT = {"missions": 700, "news": 350, "contacts": 500, "rivals": 300}


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


def load_budget():
    default = {"date": today(), "requests": 0, "tokens": 0}
    if os.path.exists(BUDGET_PATH):
        try:
            with open(BUDGET_PATH, "r", encoding="utf-8") as f:
                b = json.load(f)
            if b.get("date") != today():
                b = default
        except Exception:
            b = default
    else:
        b = default
    return b


def save_budget(b):
    try:
        with open(BUDGET_PATH, "w", encoding="utf-8") as f:
            json.dump(b, f)
    except Exception as e:
        print("[BUDGET] Erreur d'écriture :", e)


def budget_allows():
    b = load_budget()
    return b["requests"] < CONFIG["daily_budget_requests"] and b["tokens"] < CONFIG["daily_budget_tokens"], b


def spend(tokens):
    b = load_budget()
    b["requests"] += 1
    b["tokens"] += tokens
    save_budget(b)
    print("[AI] +1 requête, %d tokens — %d/%d requêtes, %d/%d tokens aujourd'hui" % (
        tokens, b["requests"], CONFIG["daily_budget_requests"], b["tokens"], CONFIG["daily_budget_tokens"]))
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
            "responseMimeType": "application/json"
        }
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=CONFIG["timeout"]) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts)
    usage = data.get("usageMetadata", {})
    tokens = usage.get("promptTokenCount", 0) + usage.get("candidatesTokenCount", 0)
    return strip_fences(text), tokens


def parse_json(text):
    text = text.strip()
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
            b = load_budget()
            self.send_json({
                "configured": bool(CONFIG["api_key"]),
                "model": CONFIG["model"],
                "used_requests": b["requests"],
                "budget_requests": CONFIG["daily_budget_requests"],
                "used_tokens": b["tokens"],
                "budget_tokens": CONFIG["daily_budget_tokens"],
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

        if not CONFIG["api_key"]:
            self.send_json({"ok": False, "reason": "nokey"})
            return

        allowed, b = budget_allows()
        if not allowed:
            self.send_json({"ok": False, "reason": "budget",
                            "used": b, "budget": CONFIG["daily_budget_requests"]})
            return

        prompt = build_prompt(kind, body.get("context") or {})
        try:
            text, tokens = call_gemini(prompt, MAX_OUTPUT.get(kind, 300))
        except urllib.error.HTTPError as e:
            reason = "rate_limit" if e.code == 429 else "api"
            print("[AI] Erreur HTTP %d (%s)" % (e.code, reason))
            self.send_json({"ok": False, "reason": reason})
            return
        except Exception as e:
            print("[AI] Erreur réseau :", e)
            self.send_json({"ok": False, "reason": "api"})
            return

        data = parse_json(text)
        if data is None:
            print("[AI] Réponse JSON invalide pour %s : %s..." % (kind, text[:120]))
            self.send_json({"ok": False, "reason": "api"})
            return

        spend(tokens)
        self.send_json({"ok": True, "data": data, "tokens": tokens})


def main():
    port = 8080
    args = sys.argv[1:]
    if "--port" in args:
        port = int(args[args.index("--port") + 1])
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print("Ghost Protocol — http://localhost:%d (LAN : %s:%d)" % (port, get_lan_ip(), port))
    if CONFIG["api_key"]:
        print("IA Gemini : ACTIVE (%s) — budget %d req/jour, %d tokens/jour" % (
            CONFIG["model"], CONFIG["daily_budget_requests"], CONFIG["daily_budget_tokens"]))
    else:
        print("IA Gemini : PAS DE CLÉ — édite server_config.json puis redémarre (le jeu fonctionne sans).")
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
