# Ghost Protocol — Présentation du projet

**Ghost Protocol : Carrière de Hacker** — jeu de simulation de hacker en navigateur (mobile-first), 100% HTML/CSS/JavaScript + un serveur Python local (proxy IA Gemini).

URL : https://github.com/baa071629-lang/Ai-hacker

---

## Concept

Le joueur incarne un hacker débutant qui monte en carrière sur 5 actes narratifs :
- **Acte I — L'Éveil** : prologue, le forum des Ombres, première mission
- **Acte II — La Descente** : premiers gros braquages, offres du darknet
- **Acte III — La Crise** : l'Opération Phantom, 3 choix moraux, la trahison (la taupe)
- **Acte IV — La Traque** : la police se rapproche, trouver la taupe
- **Acte V — La Résolution** : 3 portes finales (white hat / black hat / gray hat)

## Architecture

- `index.html` — structure des écrans (splash, création, jeu, overlays)
- `css/style.css` — thème terminal, 5 environnements visuels distincts
- `js/data.js` — données du jeu : origines, compétences, objets, contacts, marchés, succès
- `js/story.js` — scénario : prologue, événements, chapitres, fins
- `js/engine.js` — moteur : état, économie, heat/risk, équipement, missions, messages
- `js/main.js` — UI : narratif, choix, minijeux, inventaire, téléphone, notifications
- `js/ai.js` — client du proxy IA (fallback local sans clé)
- `js/save.js` — sauvegarde localStorage
- `server.py` — serveur HTTP local + proxy Gemini (clé côté serveur, budget quotidien)

## Systèmes de jeu

- **Stats** : Tech, Social, Heat (chaleur policière), Risk, Reputation, Energie, Stress
- **Compétences** : 20 compétences (python, web_hacking, OSINT, hardware...)
- **Objets** : gear (équipable, bonus de compétences), consommables, données, téléphone
- **Marché darknet** : prix fluctuants quotidiens
- **Minijeux** : brute-force, séquence de mémoire, interception timing, OSINT, évasion
- **Contacts** : 7 personnages avec relations dynamiques
- **Succès** : 12 trophées
- **IA vivante** (optionnelle) : missions, actualités, dialogues, provocations générés par Gemini via proxy local, avec repli sur contenu local et budget quotidien (60 req / 100k tokens)

## Historique des phases

- **Phases 1-2** (`1989e25`) : monde vivant, mini-jeux, marché, rivaux, succès
- **Phase 3** (`b65790c`) : IA vivante — proxy Gemini local, budget, repli sans clé
- **Phase 4** (`ab97d70`) : 5 actes narratifs complets, Opération Phantom, trahison, 3 fins
- **Phase 5** (`15e7f0f`) : inventaire interactif, téléphone, notifications, environnements
- **Phase 5.1** (`02cb6e0`) : support des nouvelles clés Gemini Auth (AQ.)

## Phase 5 en détail (dernière en date)

1. **Inventaire interactif** — chaque objet a ses actions : UTILISER (consommables), ÉQUIPER/DÉSÉQUIPER (gear, les bonus ne s'appliquent que si équipé), VENDRE (données et gear à 50% du prix marché), MESSAGES (téléphone). Migration automatique des anciennes sauvegardes.
2. **Téléphone + notifications** — toasts animés (3 max, auto-dismiss 5s), badge de non-lus sur le bouton 📱, historique des messages daté par jour de jeu. Les contacts écrivent spontanément, alertes quand le heat ≥ 50, message de bienvenue de Shadow.
3. **5 environnements visuels** — Appartement (nuit violette), Café (ambre), Planque (vert sombre), Darknet (rouge, scanlines vacillantes), Néon (cyan). Changement selon l'acte + contexte (darknet, café, perquisition). Indicateur dans le HUD.
4. **Compatibilité Gemini 2026** — Google ne délivre plus que des clés Auth `AQ.Ab...` (les `AIza` sont dépréciées en septembre 2026). Fix : désactivation du mode thinking, parsing JSON robuste, budget de sortie élargi.

## Prochaines améliorations prévues (système de choix)

1. Aperçu des conséquences sur chaque bouton (badges +HEAT/-$/+REP, % de réussite)
2. Choix verrouillés par prérequis (compétence, objet, relation)
3. Choix à risque avec taux de réussite estimé et échecs à issues multiples
4. Choix chronométrés en situation d'urgence (perquisition, ops risquées)
5. Conséquences différées (investissements, promesses de contacts)
6. Alignement moral discret (Ange / Mercenaire / Fantôme) alimentant les 3 fins
7. Réactions des contacts en direct (notifications)
8. Chaînes de choix (négociations en 2-3 étapes)
9. Choix contextuels secrets (objets/flags)
10. Récap de carrière enrichi (styles de jeu comptés)

---

## Comment lancer

```bash
cd hacker-sim
python3 server.py --port 8080
# ouvrir http://localhost:8080
```

Sans clé API : le jeu fonctionne avec le contenu local. Avec clé : `server_config.json` (`{"api_key": "AQ...."}`) — fichier jamais commité (`.gitignore`).
