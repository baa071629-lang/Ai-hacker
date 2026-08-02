let engine = null;
let saveManager = null;
let narrativeQueue = [];
let worldEventQueue = [];
let heatEventQueue = [];
let achievementQueue = [];

document.addEventListener('DOMContentLoaded', () => {
    engine = new GameEngine();
    saveManager = new SaveManager();

    window.gameUI = {
        pushWorldEvent: (text) => worldEventQueue.push(text),
        pushHeatEvent: (text, threshold) => heatEventQueue.push({ text, threshold }),
        unlockAchievement: (id) => achievementQueue.push(id)
    };

    if (saveManager.hasSave()) {
        document.getElementById('btn-continue').classList.remove('btn-hidden');
    }

    document.getElementById('btn-new-game').addEventListener('click', showCreateScreen);
    document.getElementById('btn-continue').addEventListener('click', loadGame);
    document.getElementById('btn-start-game').addEventListener('click', startGame);

    document.querySelectorAll('.btn-choice[data-origin]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-choice[data-origin]').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            const pseudo = document.getElementById('input-pseudo').value.trim();
            if (pseudo) {
                document.getElementById('btn-start-game').classList.remove('btn-hidden');
            }
        });
    });

    document.getElementById('input-pseudo').addEventListener('input', (e) => {
        const selectedOrigin = document.querySelector('.btn-choice.selected');
        if (e.target.value.trim() && selectedOrigin) {
            document.getElementById('btn-start-game').classList.remove('btn-hidden');
        }
    });

    document.querySelectorAll('.btn-close-overlay').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.screen.overlay').forEach(s => s.classList.remove('active'));
        });
    });

    document.getElementById('btn-skills').addEventListener('click', showSkills);
    document.getElementById('btn-inventory').addEventListener('click', showInventory);
    document.getElementById('btn-network').addEventListener('click', showNetwork);
    document.getElementById('btn-market').addEventListener('click', showMarket);
    document.getElementById('btn-rivals').addEventListener('click', showRivals);
    document.getElementById('btn-achievements').addEventListener('click', showAchievements);
    document.getElementById('btn-save').addEventListener('click', saveGame);
    document.getElementById('btn-restart').addEventListener('click', () => {
        saveManager.deleteSave();
        location.reload();
    });
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showCreateScreen() {
    showScreen('screen-create');
}

function startGame() {
    const pseudo = document.getElementById('input-pseudo').value.trim();
    const originBtn = document.querySelector('.btn-choice.selected');
    if (!pseudo || !originBtn) return;

    const origin = originBtn.dataset.origin;
    engine.newGame(origin, pseudo);

    showScreen('screen-game');
    updateHUD();
    startPrologue();
}

function loadGame() {
    const saved = saveManager.load();
    if (!saved) return;

    if (!engine.loadState(saved)) {
        addNarrative({ type: "danger", content: "Sauvegarde incompatible (ancienne version). Nouvelle partie requise." });
        setTimeout(() => { saveManager.deleteSave(); location.reload(); }, 2000);
        return;
    }

    showScreen('screen-game');
    updateHUD();
    applyStreak();
    continueGame();
}

function applyStreak() {
    const s = engine.getState();
    const today = s.totalDays;
    if (s.lastLoginDay === today) return;
    if (s.lastLoginDay === today - 1) {
        s.streak = (s.streak || 0) + 1;
    } else {
        s.streak = 1;
    }
    s.lastLoginDay = today;
    s.energy = Math.min(100, s.energy + 10);
    addNarrative({ type: "system", content: `🔥 Streak de connexion : ${s.streak} jour(s) — +10 énergie.` });
    engine.checkAchievements();
    updateHUD();
}

function continueGame() {
    const state = engine.getState();

    if (state.phase === "prologue") {
        startPrologue();
    } else {
        showFreePlay();
    }
}

function startPrologue() {
    const state = engine.getState();
    const origin = state.origin;
    const scenes = STORY.prologue;

    narrativeQueue = [];
    scenes.forEach(scene => narrativeQueue.push(scene));

    const firstHack = STORY.firstHack[origin];
    firstHack.forEach(scene => narrativeQueue.push(scene));

    narrativeQueue.push({ type: "divider" });
    narrativeQueue.push({ type: "text", content: "Tu fermes l'ordinateur. 4h12 du matin. Demain, tu retournes au bureau. Mais tu sais que <strong>rien ne sera plus jamais comme avant</strong>." });
    narrativeQueue.push({ type: "divider" });
    narrativeQueue.push({ type: "system", content: "PROLOGUE TERMINÉ — Le monde du hacking s'ouvre à toi. Attention à la chaleur (HEAT) : plus elle monte, plus la police s'intéresse à toi." });

    state.phase = "freeplay";
    state.currentChapter = "freeplay";
    state.hacksCompleted = 1;

    typeNarrativeQueue(() => {
        showFreePlayChoices();
    });
}

function showFreePlay() {
    const state = engine.getState();

    addNarrative({ type: "text", content: `Tu es dans ta chambre. ${state.day}/${state.month}/${state.year}. Tu as ${state.money}$ et ${state.rep} de réputation.` });

    const events = engine.getAvailableEvents();
    if (events.length > 0) {
        const event = events[0];
        state.completedEvents.push(event.id);
        event.text.forEach(scene => addNarrative(scene));

        if (event.choices) {
            showChoices(event.choices);
            return;
        }
    }

    showFreePlayChoices();
    updateHUD();
}

function showFreePlayChoices() {
    const state = engine.getState();
    const choices = [];

    choices.push({
        text: `💻 Travailler sur tes compétences (+${Math.floor(Math.random() * 5 + 3)} skill aléatoire)`,
        effects: { skill_random: Math.floor(Math.random() * 5 + 3), energy: -5 },
        next: "skill_train"
    });

    choices.push({
        text: "🎯 Accepter une mission hacking",
        effects: {},
        next: "mission"
    });

    choices.push({
        text: "🕶️ Explorer le darknet",
        effects: { risk: 3, rep: 2 },
        next: "darknet"
    });

    choices.push({
        text: `💼 Vendre des données ($${Math.floor(Math.random() * 300 + 150)})`,
        effects: {},
        next: "sell_exploits"
    });

    choices.push({
        text: "🛌 Se reposer (récupère 30 énergie)",
        effects: { energy: 30, stress: -10 },
        next: "rest"
    });

    choices.push({
        text: "📞 Rencontrer un contact",
        effects: {},
        next: "meet_contact"
    });

    choices.push({
        text: "⏩ Passer la journée",
        effects: {},
        next: "pass_day"
    });

    showChoices(choices);
}

function showChoices(choices) {
    const container = document.getElementById('game-choices');
    container.innerHTML = '';

    choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'btn-choice';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            if (choice.effects) {
                applyEffectsSafe(choice.effects);
            }

            container.innerHTML = '';

            if (choice.custom) {
                choice.custom();
                updateHUD();
                return;
            }

            if (choice.next === "mission") {
                startMission();
            } else if (choice.next === "mission_resolve") {
                resolveMission();
            } else if (choice.next === "minigame_launch") {
                launchMinigame();
            } else if (choice.next === "skill_train") {
                trainSkill();
            } else if (choice.next === "darknet") {
                exploreDarknet();
            } else if (choice.next === "sell_exploits") {
                sellExploits();
            } else if (choice.next === "rest") {
                rest();
            } else if (choice.next === "meet_contact") {
                meetContact();
            } else if (choice.next === "pass_day") {
                passDay();
            } else if (choice.next === "raid_escape") {
                raidEscape();
            } else if (choice.next === "raid_destroy") {
                raidDestroy();
            } else if (choice.next === "raid_hide") {
                raidHide();
            } else if (choice.next && STORY[choice.next]) {
                playScene(choice.next);
            } else if (choice.next) {
                const event = findEventById(choice.next);
                if (event) {
                    const state = engine.getState();
                    if (!state.completedEvents.includes(event.id)) {
                        state.completedEvents.push(event.id);
                    }
                    event.text.forEach(scene => addNarrative(scene));
                    if (event.choices) {
                        showChoices(event.choices);
                    } else {
                        engine.advanceTime();
                        if (checkGameOver()) return;
                        updateHUD();
                        showFreePlay();
                    }
                } else {
                    engine.advanceTime();
                    if (checkGameOver()) return;
                    updateHUD();
                    showFreePlay();
                }
            } else {
                engine.advanceTime();
                if (checkGameOver()) return;
                updateHUD();
                showFreePlay();
            }

            updateHUD();
        });
        container.appendChild(btn);
    });
}

function applyEffectsSafe(effects) {
    const state = engine.getState();

    if (effects.skill_random) {
        const skillNames = Object.keys(state.skills);
        if (skillNames.length > 0) {
            const randomSkill = skillNames[Math.floor(Math.random() * skillNames.length)];
            state.skills[randomSkill] = Math.min(100, (state.skills[randomSkill] || 0) + effects.skill_random);
        }
    }

    engine.applyEffects(effects);

    state.money = Math.max(0, state.money);
    state.risk = Math.max(0, Math.min(100, state.risk));
    state.heat = Math.max(0, Math.min(100, state.heat));
    state.rep = Math.max(0, Math.min(100, state.rep));
    state.energy = Math.max(0, Math.min(100, state.energy));
    state.stress = Math.max(0, Math.min(100, state.stress));
}

function startMission() {
    const state = engine.getState();
    const mission = engine.generateMission();
    if (!mission) {
        addNarrative({ type: "text", content: "Pas de missions disponibles pour l'instant. Entraîne-toi et reviens." });
        showFreePlayChoices();
        return;
    }

    window._currentMission = mission;

    addNarrative({ type: "divider" });
    addNarrative({ type: "action", content: `🎯 MISSION : ${mission.title}` });
    addNarrative({ type: "text", content: mission.desc });
    addNarrative({ type: "system", content: `Compétence : ${GAME_DATA.skills[mission.skill]?.name || mission.skill} (${state.skills[mission.skill] || 0}) | Minijeu : ${GAME_DATA.minigames[mission.minigame]?.name || "—"}` });

    const choices = [
        {
            text: "🚀 Lancer l'opération",
            effects: { energy: -10, stress: 5 },
            next: "minigame_launch"
        },
        {
            text: "Prudent — abandonner",
            effects: {},
            next: "pass_day"
        }
    ];

    showChoices(choices);
}

function launchMinigame() {
    const mission = window._currentMission;
    if (!mission || !GAME_DATA.minigames[mission.minigame]) {
        resolveMission();
        return;
    }

    addNarrative({ type: "divider" });
    addNarrative({ type: "action", content: `🔧 MINIJEU : ${GAME_DATA.minigames[mission.minigame].name}` });

    const skillLevel = engine.getState().skills[mission.skill] || 0;
    const difficulty = skillLevel >= 50 ? "hard" : skillLevel >= 25 ? "medium" : "easy";

    if (mission.minigame === "bruteforce") {
        mgBruteforce(difficulty);
    } else if (mission.minigame === "sequence") {
        mgSequence(difficulty);
    } else if (mission.minigame === "timing") {
        mgTiming(difficulty);
    } else if (mission.minigame === "osint") {
        mgOsint();
    } else if (mission.minigame === "evasion") {
        mgEvasion(difficulty);
    } else {
        resolveMission();
    }
}

function mgBruteforce(difficulty) {
    const rounds = GAME_DATA.minigames.bruteforce.difficulty[difficulty];
    const symbols = "0123456789abcdef";
    let current = 0;
    let attempts = 3;

    addNarrative({ type: "system", content: `Hash MD5 : 5f4dcc3b5aa765d61d8327deb882cf99 — positions inconnues : ${'_ '.repeat(rounds)}` });
    addNarrative({ type: "text", content: "Pour chaque position, choisis le bon symbole. Tu as 3 tentatives." });

    function askPosition() {
        if (current >= rounds) {
            addNarrative({ type: "success", content: "Hash craqué ! Accès accordé." });
            resolveMission(true);
            return;
        }
        const correct = symbols[Math.floor(Math.random() * symbols.length)];
        const wrong1 = symbols[Math.floor(Math.random() * symbols.length)];
        const wrong2 = symbols[Math.floor(Math.random() * symbols.length)];
        const options = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);

        addNarrative({ type: "system", content: `Position ${current + 1}/${rounds} — tentatives restantes : ${attempts}` });

        const choices = options.map(sym => ({
            text: `'${sym}'`,
            effects: {},
            next: null,
            custom: () => {
                if (sym === correct) {
                    current++;
                    askPosition();
                } else {
                    attempts--;
                    if (attempts <= 0) {
                        addNarrative({ type: "danger", content: "Trop d'échecs. Le système verrouille la session." });
                        failMission();
                    } else {
                        addNarrative({ type: "danger", content: `Symbole incorrect. Tentatives : ${attempts}` });
                        askPosition();
                    }
                }
            }
        }));
        showChoices(choices);
    }

    askPosition();
}

function mgSequence(difficulty) {
    const length = GAME_DATA.minigames.sequence.difficulty[difficulty];
    const symbols = ["▲", "◀", "▶", "▼"];
    const seq = [];
    for (let i = 0; i < length; i++) {
        seq.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    addNarrative({ type: "text", content: `Mémorise cette séquence : <strong>${seq.join(" ")}</strong>` });

    setTimeout(() => {
        addNarrative({ type: "action", content: "Mémorise la séquence ci-dessus, puis reproduis-la. Clique sur [PRÊT] pour commencer." });
        showChoices([
            { text: "PRÊT", effects: {}, next: null, custom: () => playSequence(seq) }
        ]);
    }, 300);
}

function playSequence(seq) {
    let index = 0;
    const symbols = ["▲", "◀", "▶", "▼"];

    addNarrative({ type: "danger", content: "Reproduis la séquence !" });

    function askNext() {
        if (index >= seq.length) {
            addNarrative({ type: "success", content: "Séquence parfaite. Accès déverrouillé." });
            resolveMission(true);
            return;
        }
        const choices = symbols.map(sym => ({
            text: sym,
            effects: {},
            next: null,
            custom: () => {
                if (sym === seq[index]) {
                    index++;
                    askNext();
                } else {
                    addNarrative({ type: "danger", content: `Erreur. Le symbole attendu était ${seq[index]}.` });
                    failMission();
                }
            }
        }));
        showChoices(choices);
    }
    askNext();
}

function mgTiming(difficulty) {
    const slots = GAME_DATA.minigames.timing.difficulty[difficulty];
    const target = Math.floor(Math.random() * slots);
    const segments = [];
    for (let i = 0; i < slots; i++) {
        segments.push(`[${i + 1}]`);
    }

    addNarrative({ type: "system", content: `Flux : ${segments.join(" ")}` });
    addNarrative({ type: "text", content: "Un paquet traverse le flux. Intercepte-le au bon moment (position de l'éclair ⚡)." });

    const choices = segments.map((seg, i) => ({
        text: `Intercepter en ${i + 1}`,
        effects: {},
        next: null,
        custom: () => {
            if (Math.abs(i - target) <= 1) {
                addNarrative({ type: "success", content: "Paquet intercepté ! Données récupérées." });
                resolveMission(true);
            } else {
                addNarrative({ type: "danger", content: "Raté — le paquet t'a échappé." });
                failMission();
            }
        }
    }));
    showChoices(choices);
}

function mgOsint() {
    const puzzles = [
        {
            clue: "Cible : Michel Durand, né le 15/03/1994 à Lyon. Son chat s'appelle Minou. Son club préféré : l'OL.",
            options: ["minou94", "durand1503", "ol1994lyon", "lyon15"],
            correct: "ol1994lyon",
            hint: "Les gens utilisent souvent club + année de naissance."
        },
        {
            clue: "Cible : Sarah Benali, née le 08/11/1988 à Marseille. Son fils s'appelle Noah. Elle travaille chez Total.",
            options: ["noah88", "benali88", "total1988", "marseille11"],
            correct: "total1988",
            hint: "Le nom de l'entreprise + l'année de naissance."
        },
        {
            clue: "Cible : Jean Petit, 1965, Bordeaux. Son chien : Rex. Passion : les échecs.",
            options: ["rex65", "jean1965", "echecs65", "bordeaux45"],
            correct: "rex65",
            hint: "Le nom du chien est le plus souvent utilisé."
        },
        {
            clue: "Cible : Emma Rossi, 1999, Paris. Instagram : @emma.r. Fan de BTS.",
            options: ["bts99", "emma99", "paris99", "rossi1999"],
            correct: "bts99",
            hint: "La passion récente + l'année."
        }
    ];

    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    addNarrative({ type: "text", content: `📋 ${puzzle.clue}` });
    addNarrative({ type: "system", content: "Les gens choisissent rarement un mot de passe aléatoire. Réfléchis comme eux." });

    const choices = puzzle.options.map(opt => ({
        text: opt,
        effects: {},
        next: null,
        custom: () => {
            if (opt === puzzle.correct) {
                addNarrative({ type: "success", content: "Mot de passe trouvé. Compte compromis." });
                resolveMission(true);
            } else {
                addNarrative({ type: "danger", content: `Refusé. Indice : ${puzzle.hint}` });
                failMission();
            }
        }
    }));
    showChoices(choices);
}

function mgEvasion(difficulty) {
    const hops = GAME_DATA.minigames.evasion.difficulty[difficulty];
    let current = 0;
    const failFactor = difficulty === "easy" ? 0.5 : difficulty === "medium" ? 0.8 : 1;
    const routes = [
        { name: "Allemagne 🇩🇪", danger: 0.4 * failFactor },
        { name: "Pays-Bas 🇳🇱", danger: 0.25 * failFactor },
        { name: "Roumanie 🇷🇴", danger: 0.6 * failFactor }
    ];

    addNarrative({ type: "system", content: "⚠️ TRAÇAGE EN COURS — Tu dois rebondir de nœud en nœud avant d'être localisé." });

    function nextHop() {
        if (current >= hops) {
            addNarrative({ type: "success", content: "Tu t'es évaporé dans le réseau. Aucune trace." });
            resolveMission(true);
            return;
        }
        addNarrative({ type: "system", content: `Rebond ${current + 1}/${hops} — choisis la route.` });
        const choices = routes.map(r => ({
            text: `${r.name} (risque estimé : ${Math.round(r.danger * 100)}%)`,
            effects: {},
            next: null,
            custom: () => {
                if (Math.random() < r.danger) {
                    addNarrative({ type: "danger", content: `Nœud compromis — la trace pointe vers toi !` });
                    failMission();
                } else {
                    addNarrative({ type: "text", content: `Rebond via ${r.name} réussi.` });
                    current++;
                    nextHop();
                }
            }
        }));
        showChoices(choices);
    }
    nextHop();
}

function resolveMission(won) {
    const state = engine.getState();
    const mission = window._currentMission;
    if (!mission) { showFreePlayChoices(); return; }

    const success = won !== undefined ? won : engine.calculateMissionSuccess(mission.skill, mission.difficulty);

    if (success) {
        addNarrative({ type: "success", content: `✅ Succès ! ${mission.successText}` });
        engine.applyEffects(mission.reward);
        if (state.skills[mission.skill] !== undefined) {
            state.skills[mission.skill] = Math.min(100, state.skills[mission.skill] + Math.floor(Math.random() * 5 + 3));
        }
        state.missionsCompleted++;
        state.hacksCompleted++;

        if (Math.random() < 0.25) {
            const loot = GAME_DATA.items.filter(i => i.rarity === "common" || i.rarity === "rare");
            const item = loot[Math.floor(Math.random() * loot.length)];
            engine.addItem(item.id);
            addNarrative({ type: "system", content: `🎁 Loot : ${item.name} !` });
        }

        if (mission.difficulty >= 35) {
            state.flags.hard_mission = true;
        }
    } else {
        addNarrative({ type: "danger", content: `❌ Échec. ${mission.failText}` });
        state.risk = Math.min(100, state.risk + 5);
        state.heat = Math.min(100, state.heat + 5);
    }

    window._currentMission = null;
    engine.advanceTime(2);
    if (checkGameOver()) return;
    engine.checkAchievements();
    updateHUD();
    showFreePlay();
}

function failMission() {
    addNarrative({ type: "danger", content: "Opération avortée." });
    const state = engine.getState();
    state.risk = Math.min(100, state.risk + 5);
    state.heat = Math.min(100, state.heat + 5);
    window._currentMission = null;
    engine.advanceTime(2);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlay();
}

function trainSkill() {
    const state = engine.getState();
    const skillNames = Object.keys(state.skills);

    if (skillNames.length === 0) {
        addNarrative({ type: "text", content: "Tu n'as aucune compétence. Explore le darknet ou trouve un mentor." });
        showFreePlayChoices();
        return;
    }

    const randomSkill = skillNames[Math.floor(Math.random() * skillNames.length)];
    const gain = Math.floor(Math.random() * 5 + 3);
    state.skills[randomSkill] = Math.min(100, (state.skills[randomSkill] || 0) + gain);

    const skillInfo = GAME_DATA.skills[randomSkill];
    addNarrative({ type: "text", content: `Tu as travaillé sur <strong>${skillInfo?.name || randomSkill}</strong>. +${gain} points.` });
    addNarrative({ type: "system", content: `Niveau actuel: ${state.skills[randomSkill]}/100` });

    engine.advanceTime(1);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function exploreDarknet() {
    const state = engine.getState();
    const events = [
        { text: "Tu navigues sur le darknet. Tu trouves un forum de hackers.", effect: { rep: 2 } },
        { text: "Un vendeur te propose un exploit kit d'occasion à -30%.", effect: { rep: 1 } },
        { text: "Un hacker te défie en duel de code. Tu gagnes.", effect: { rep: 5, skill_python: 3 } },
        { text: "Tu trouves un tutoriel de pentest avancé. Tu apprends des techniques.", effect: { skill_pentest: 5 } },
        { text: "Un inconnu te propose un job mystérieux. Tu hésites.", effect: { risk: 5, rep: 3 } },
        { text: "Tu tombes sur une liste de 10 000 mots de passe fuités. Tu copies discrètement.", effect: { heat: 8, skill_osint: 3 } },
        { text: "Le marché noir propose des zero-days à prix cassés. Suspect.", effect: { risk: 8, rep: 2 } },
        { text: "Tu découvres un forum dédié au social engineering. Techniques précieuses.", effect: { skill_social_engineering: 5 } },
        { text: "Un hacker anonyme t'envoie un fichier chiffré. Tu n'arrives pas à l'ouvrir.", effect: { skill_crypto: 3 } }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    addNarrative({ type: "action", content: "🕶️ EXPLORATION DARKNET" });
    addNarrative({ type: "text", content: event.text });
    engine.applyEffects(event.effect);

    engine.advanceTime(1);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function sellExploits() {
    const state = engine.getState();
    const price = Math.floor(Math.random() * 300 + 150);
    state.money += price;
    state.heat = Math.min(100, state.heat + 3);

    addNarrative({ type: "action", content: "💼 VENTE DE DONNÉES" });
    addNarrative({ type: "text", content: `Tu vends un lot de données volées pour $${price}. L'acheteur est satisfait.` });
    addNarrative({ type: "system", content: `Argent: $${state.money}` });

    engine.advanceTime(1);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function rest() {
    addNarrative({ type: "text", content: "Tu te reposes. Le silence de la nuit. Pas d'écran. Pas de code. Juste le bruit du réfrigérateur." });
    addNarrative({ type: "system", content: "Énergie récupérée. Stress réduit. Le heat baisse légèrement." });

    engine.advanceTime(1);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function passDay() {
    const state = engine.getState();
    engine.advanceTime(1);
    addNarrative({ type: "text", content: `La journée passe. ${state.day}/${state.month}/${state.year}. Rien de spécial, et c'est bien.` });
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function meetContact() {
    const state = engine.getState();
    const contactIds = Object.keys(GAME_DATA.contacts);

    if (contactIds.length === 0) {
        addNarrative({ type: "text", content: "Tu ne connais personne. Explore le darknet ou trouve un mentor." });
        showFreePlayChoices();
        return;
    }

    const contactId = contactIds[Math.floor(Math.random() * contactIds.length)];
    const contact = GAME_DATA.contacts[contactId];

    addNarrative({ type: "action", content: `📞 RENCONTRE : ${contact.name}` });
    addNarrative({ type: "text", content: `Tu contactes ${contact.name}. ${contact.role}. ${contact.personality}.` });

    const dialogue = [
        `${contact.name} : "Salut. Quoi de neuf ?"`,
        `${contact.name} : "J'ai entendu dire que tu faisais des choses intéressantes."`,
        `${contact.name} : "Fais attention à toi. Le heat monte vite dans ce milieu."`,
        `${contact.name} : "Si tu as besoin de moi, tu sais où me trouver."`
    ];

    addNarrative({ type: "speaker", content: dialogue[Math.floor(Math.random() * dialogue.length)] });

    state.contacts[contactId] = (state.contacts[contactId] || 0) + 5;

    engine.advanceTime(1);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function findEventById(id) {
    const all = [...STORY.earlyEvents, ...STORY.monthEvents];
    return all.find(e => e.id === id) || null;
}

function playScene(sceneId) {
    const state = engine.getState();
    const scene = STORY[sceneId];
    if (!scene) {
        showFreePlayChoices();
        return;
    }

    if (scene.text) {
        narrativeQueue = [...scene.text];
        typeNarrativeQueue(() => {
            if (scene.choices) {
                showChoices(scene.choices);
            } else {
                engine.advanceTime();
                updateHUD();
                showFreePlay();
            }
        });
    } else {
        if (scene.choices) {
            showChoices(scene.choices);
        } else {
            engine.advanceTime();
            updateHUD();
            showFreePlay();
        }
    }
}

function typeNarrativeQueue(callback) {
    const container = document.getElementById('game-narrative');
    let idx = 0;

    function typeNext() {
        if (idx >= narrativeQueue.length) {
            if (callback) callback();
            return;
        }

        const scene = narrativeQueue[idx];
        idx++;

        if (scene.type === "text" || scene.type === "action" || scene.type === "speaker" || scene.type === "system" || scene.type === "danger" || scene.type === "success") {
            typeText(container, scene, () => {
                setTimeout(typeNext, 60);
            });
        } else if (scene.type === "divider") {
            const div = document.createElement('div');
            div.className = 'divider';
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
            setTimeout(typeNext, 60);
        } else {
            typeNext();
        }
    }

    typeNext();
}

function typeText(container, scene, callback) {
    const p = document.createElement('p');
    p.className = scene.type === "danger" ? "danger" : scene.type === "success" ? "success" : scene.type === "action" ? "action" : scene.type === "system" ? "system" : scene.type === "speaker" ? "speaker" : "";

    if (scene.type === "speaker") {
        p.innerHTML = `<span class="speaker">${scene.content}</span>`;
        container.appendChild(p);
        container.scrollTop = container.scrollHeight;
        setTimeout(callback, 200);
        return;
    }

    const content = scene.content;
    let charIdx = 0;
    let skipTyping = false;
    p.innerHTML = '';
    container.appendChild(p);

    function finishTyping() {
        p.innerHTML = content;
        container.scrollTop = container.scrollHeight;
        callback();
    }

    function typeChar() {
        if (skipTyping) {
            finishTyping();
            return;
        }
        if (charIdx < content.length) {
            if (content[charIdx] === '<') {
                const tagEnd = content.indexOf('>', charIdx);
                if (tagEnd !== -1) {
                    p.innerHTML += content.substring(charIdx, tagEnd + 1);
                    charIdx = tagEnd + 1;
                } else {
                    p.innerHTML += content[charIdx];
                    charIdx++;
                }
            } else {
                p.innerHTML += content[charIdx];
                charIdx++;
            }
            container.scrollTop = container.scrollHeight;
            setTimeout(typeChar, 6);
        } else {
            callback();
        }
    }

    const skipHandler = () => { skipTyping = true; };
    container.addEventListener('click', skipHandler, { once: true });
    typeChar();
}

function addNarrative(scene) {
    const container = document.getElementById('game-narrative');
    const p = document.createElement('p');
    p.className = scene.type === "danger" ? "danger" : scene.type === "success" ? "success" : scene.type === "action" ? "action" : scene.type === "system" ? "system" : scene.type === "speaker" ? "speaker" : "";

    if (scene.type === "speaker") {
        p.innerHTML = `<span class="speaker">${scene.content}</span>`;
    } else {
        p.innerHTML = scene.content;
    }

    container.appendChild(p);
    container.scrollTop = container.scrollHeight;
}

function updateHUD() {
    const state = engine.getState();
    if (!state) return;

    document.getElementById('hud-pseudo').textContent = state.pseudo;
    document.getElementById('hud-money').textContent = `$${state.money}`;
    document.getElementById('hud-date').textContent = `${state.day}/${state.month}/${state.year}`;
    document.getElementById('hud-rep').textContent = `Rep: ${state.rep}`;

    document.getElementById('bar-tech').style.width = `${state.stats.tech}%`;
    document.getElementById('val-tech').textContent = state.stats.tech;

    document.getElementById('bar-social').style.width = `${state.stats.social}%`;
    document.getElementById('val-social').textContent = state.stats.social;

    document.getElementById('bar-risk').style.width = `${state.heat}%`;
    document.getElementById('val-risk').textContent = state.heat;

    const newsEl = document.getElementById('news-text');
    newsEl.textContent = engine.getRandomNews();
}

function showSkills() {
    const state = engine.getState();
    const container = document.getElementById('skills-list');
    container.innerHTML = '';

    Object.keys(state.skills).sort((a, b) => (state.skills[b] || 0) - (state.skills[a] || 0)).forEach(skillId => {
        const level = state.skills[skillId];
        const info = GAME_DATA.skills[skillId];
        if (!info) return;

        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <span class="skill-name">${info.name}</span>
            <div class="skill-bar-small"><div class="skill-fill-small" style="width:${level}%"></div></div>
            <span class="skill-level">${level}</span>
        `;
        container.appendChild(div);
    });

    if (Object.keys(state.skills).length === 0) {
        container.innerHTML = '<p style="color:#666">Aucune compétence encore.</p>';
    }

    document.getElementById('screen-skills').classList.add('active');
}

function showInventory() {
    const state = engine.getState();
    const container = document.getElementById('inventory-list');
    container.innerHTML = '';

    state.inventory.forEach(itemId => {
        const item = GAME_DATA.items.find(i => i.id === itemId);
        if (!item) return;

        const owned = item.type === "gear" ? " (équipé)" : "";
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `
            <div class="shop-item-info">
                <div class="inv-item-name">${item.name}${owned}</div>
                <div class="inv-item-desc">${item.desc}</div>
            </div>
            <div class="inv-actions">
                <span class="inv-item-rarity rarity-${item.rarity}">${item.rarity}</span>
                ${item.type === "consumable" ? `<button class="btn-shop" data-use="${item.id}">UTILISER</button>` : ""}
            </div>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('[data-use]').forEach(btn => {
        btn.addEventListener('click', () => {
            const result = engine.useItem(btn.dataset.use);
            addNarrative({ type: result.ok ? "system" : "danger", content: result.msg });
            showInventory();
            updateHUD();
        });
    });

    if (state.inventory.length === 0) {
        container.innerHTML = '<p style="color:#666">Inventaire vide.</p>';
    }

    document.getElementById('screen-inventory').classList.add('active');
}

function showNetwork() {
    const state = engine.getState();
    const container = document.getElementById('network-list');
    container.innerHTML = '';

    Object.keys(GAME_DATA.contacts).forEach(contactId => {
        const contact = GAME_DATA.contacts[contactId];
        const relation = state.contacts[contactId] || 0;

        let status = "neutral";
        let statusText = "Inconnu";
        if (relation >= 50) { status = "friendly"; statusText = "Allié"; }
        else if (relation >= 20) { status = "neutral"; statusText = "Connu"; }
        else if (relation < 0) { status = "hostile"; statusText = "Ennemi"; }

        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-role">${contact.role}</div>
                <div class="contact-status status-${status}">${statusText} (${relation})</div>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('screen-network').classList.add('active');
}

function showMarket() {
    const state = engine.getState();
    const container = document.getElementById('market-list');
    container.innerHTML = '';

    document.getElementById('market-info').textContent = `💰 Argent : $${state.money} — les prix fluctuent chaque jour.`;

    GAME_DATA.shop.forEach(entry => {
        const item = GAME_DATA.items.find(i => i.id === entry.itemId);
        if (!item) return;
        const price = engine.getMarketPrice(entry.itemId);
        const owned = state.inventory.includes(item.id);

        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="shop-item-info">
                <div class="inv-item-name">${item.name} <span class="inv-item-rarity rarity-${item.rarity}">${item.rarity}</span></div>
                <div class="inv-item-desc">${item.desc}</div>
            </div>
            <button class="btn-shop ${owned ? 'btn-shop-owned' : ''}" data-item="${item.id}" ${owned ? 'disabled' : ''}>
                ${owned ? 'POSSÉDÉ' : `$${price}`}
            </button>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.btn-shop').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.item;
            const result = engine.buyItem(itemId);
            addNarrative({ type: result.ok ? "system" : "danger", content: result.msg });
            showMarket();
            updateHUD();
        });
    });

    document.getElementById('screen-market').classList.add('active');
}

function showRivals() {
    const state = engine.getState();
    const container = document.getElementById('rival-list');
    container.innerHTML = '';

    const entries = Object.keys(state.rivalActivity).map(name => ({
        name,
        ...state.rivalActivity[name]
    }));
    entries.sort((a, b) => b.rep - a.rep);

    const myEntry = { name: `${state.pseudo} 👈 (TOI)`, rep: state.rep, missions: state.missionsCompleted, lastActive: state.totalDays, alive: true };
    let insertIdx = entries.findIndex(e => e.rep < state.rep);
    if (insertIdx === -1) insertIdx = entries.length;
    entries.splice(insertIdx, 0, myEntry);

    entries.forEach((rival, idx) => {
        const daysSince = state.totalDays - rival.lastActive;
        const activityText = rival.alive
            ? (daysSince <= 1 ? "🟢 très actif" : daysSince <= 5 ? "🟡 actif" : "🔴 inactif")
            : "💀 mort";
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `
            <div class="contact-avatar">#${idx + 1}</div>
            <div class="contact-info">
                <div class="contact-name">${rival.name}</div>
                <div class="contact-role">Réputation: ${rival.rep} | Missions: ${rival.missions}</div>
                <div class="contact-status ${rival.name.includes("TOI") ? 'status-friendly' : 'status-neutral'}">${activityText}</div>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('screen-rivals').classList.add('active');
}

function showAchievements() {
    const state = engine.getState();
    const container = document.getElementById('achievement-list');
    container.innerHTML = '';

    GAME_DATA.achievements.forEach(ach => {
        const unlocked = state.achievements.includes(ach.id);
        const div = document.createElement('div');
        div.className = 'ach-item';
        div.innerHTML = `
            <span class="ach-icon ${unlocked ? '' : 'ach-locked'}">${ach.icon}</span>
            <div class="contact-info">
                <div class="contact-name ${unlocked ? '' : 'ach-locked'}">${ach.name}</div>
                <div class="contact-role">${ach.desc}</div>
            </div>
            <span class="ach-status ${unlocked ? 'status-friendly' : 'ach-locked'}">${unlocked ? 'DÉBLOQUÉ' : '🔒'}</span>
        `;
        container.appendChild(div);
    });

    document.getElementById('screen-achievements').classList.add('active');
}

function saveGame() {
    const state = engine.getState();
    if (saveManager.save(state)) {
        addNarrative({ type: "system", content: "💾 Partie sauvegardée." });
    } else {
        addNarrative({ type: "danger", content: "Erreur de sauvegarde." });
    }
}

function checkGameOver() {
    const state = engine.getState();
    if (engine.checkGameOver()) {
        showGameOver();
        return true;
    }

    processQueues();
    return false;
}

function processQueues() {
    if (worldEventQueue.length > 0) {
        const text = worldEventQueue.shift();
        addNarrative({ type: "system", content: `🌐 ${text}` });
    }
    if (heatEventQueue.length > 0) {
        const ev = heatEventQueue.shift();
        addNarrative({ type: "danger", content: ev.text });
        if (ev.threshold >= 90 && !engine.getState().flags.raid) {
            addNarrative({ type: "danger", content: "📢 ON FRAPPE À TA PORTE — Perquisition imminente !" });
            raidChoices();
            return;
        }
    }
    if (achievementQueue.length > 0) {
        const id = achievementQueue.shift();
        const ach = GAME_DATA.achievements.find(a => a.id === id);
        if (ach) {
            addNarrative({ type: "success", content: `🏆 SUCCÈS DÉBLOQUÉ : ${ach.icon} ${ach.name} — ${ach.desc}` });
        }
    }
}

function raidChoices() {
    const choices = [
        { text: "🏃 Fuir par la fenêtre (perds de l'argent, sauve le matos)", effects: {}, next: "raid_escape" },
        { text: "🔥 Détruire toutes les preuves (sauve l'argent, perds du matos)", effects: {}, next: "raid_destroy" },
        { text: "🙈 Cacher le matériel (risqué mais gros gain potentiel)", effects: {}, next: "raid_hide" }
    ];
    showChoices(choices);
}

function raidEscape() {
    const state = engine.getState();
    addNarrative({ type: "text", content: "Tu sautes par la fenêtre arrière, ton sac à dos sur l'épaule. La police fouille ta chambre vide." });
    const result = engine.doRaid();
    addNarrative({ type: "system", content: `La police a saisi $${result.lost} mais ton matériel est sauvé.` });
    state.heat = 5;
    state.flags.raid = true;
    engine.advanceTime(2);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function raidDestroy() {
    const state = engine.getState();
    addNarrative({ type: "text", content: "Tu jettes tout ton matériel dans l'incinérateur. Chaque disque dur fond devant tes yeux. Tes exploits, tes outils... réduits en cendres." });
    const result = engine.doRaid();
    addNarrative({ type: "system", content: `La police ne trouve rien. Ton argent est intact. Mais tu as perdu : ${result.gearLost.length > 0 ? result.gearLost.join(", ") : "rien (chanceux)"}` });
    state.heat = 5;
    state.flags.raid = true;
    engine.advanceTime(2);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function raidHide() {
    const state = engine.getState();
    addNarrative({ type: "text", content: "Tu glisses ton matériel dans un faux mur. La police fouille pendant 3 heures. Ton cœur bat à 180." });
    const luck = Math.random();
    if (luck < 0.5) {
        addNarrative({ type: "success", content: "Ils ne trouvent rien ! Ton matériel est intact. Tu as gagné gros." });
        state.money += 500;
    } else {
        addNarrative({ type: "danger", content: "Ils trouvent tout. Le matériel est confisqué et tu es interrogé pendant 8 heures." });
        const result = engine.doRaid();
        state.risk = Math.min(100, state.risk + 30);
    }
    state.heat = 5;
    state.flags.raid = true;
    engine.advanceTime(2);
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function showGameOver() {
    const state = engine.getState();
    const ending = engine.getEnding();

    document.getElementById('gameover-reason').innerHTML = `
        <p>${state.gameoverReason}</p>
        <h3 class="glow" style="margin-top:20px">${ending.title}</h3>
        <p style="margin-top:10px;color:#00aa2a">${ending.text}</p>
    `;

    document.getElementById('gameover-stats').innerHTML = `
        <p>Jours vécus: ${state.daysAlive} | Missions: ${state.missionsCompleted} | Hacks: ${state.hacksCompleted}</p>
        <p>Argent: $${state.money} | Réputation: ${state.rep} | Heat: ${state.heat} | Succès: ${state.achievements.length}/${GAME_DATA.achievements.length}</p>
    `;

    showScreen('screen-gameover');
}
