let engine = null;
let saveManager = null;
let narrativeQueue = [];
let isTyping = false;
let typingTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    engine = new GameEngine();
    saveManager = new SaveManager();

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

    engine.loadState(saved);
    showScreen('screen-game');
    updateHUD();
    continueGame();
}

function continueGame() {
    const state = engine.getState();

    if (state.phase === "prologue") {
        startPrologue();
    } else if (state.phase === "freeplay") {
        showFreePlay();
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
    narrativeQueue.push({ type: "system", content: "PROLOGUE TERMINÉ — Tu es maintenant en mode libre." });

    state.phase = "freeplay";
    state.currentChapter = "freeplay";

    typeNarrativeQueue(() => {
        showFreePlayChoices();
    });
}

function showFreePlay() {
    const state = engine.getState();

    addNarrative({ type: "text", content: `Tu es dans ta chambre. Il est ${state.year}. Tes compétences s'améliorent.` });
    addNarrative({ type: "text", content: `Argent: $${state.money} | Réputation: ${state.rep} | Risque: ${state.risk}` });

    const events = engine.getAvailableEvents();
    if (events.length > 0) {
        const event = events[0];
        state.completedEvents.push(event.id);
        event.text.forEach(scene => addNarrative(scene));

        if (event.choices) {
            showChoices(event.choices);
        }
    } else {
        showFreePlayChoices();
    }

    updateHUD();
}

function showFreePlayChoices() {
    const state = engine.getState();
    const choices = [];

    choices.push({
        text: `Travailler sur des skills (+${Math.floor(Math.random() * 5 + 3)} skill aléatoire)`,
        effects: { skill_random: Math.floor(Math.random() * 5 + 3), energy: -5 },
        next: "skill_train"
    });

    choices.push({
        text: "Accepter une mission hacking",
        effects: {},
        next: "mission"
    });

    choices.push({
        text: "Explorer le darknet",
        effects: { risk: 3, rep: 2 },
        next: "darknet"
    });

    choices.push({
        text: "Vendre des exploits",
        effects: { money: Math.floor(Math.random() * 500 + 200) },
        next: "sell_exploits"
    });

    choices.push({
        text: "Se reposer (récupère 30 énergie)",
        effects: { energy: 30, stress: -10 },
        next: "rest"
    });

    choices.push({
        text: "Rencontrer un contact",
        effects: {},
        next: "meet_contact"
    });

    showChoices(choices);
}

function showChoices(choices) {
    const container = document.getElementById('game-choices');
    container.innerHTML = '';

    choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-choice';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            if (choice.effects) {
                applyEffectsSafe(choice.effects);
            }

            container.innerHTML = '';

            if (choice.next === "mission") {
                startMission();
            } else if (choice.next === "mission_resolve") {
                resolveMission();
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
            } else if (choice.next && STORY[choice.next]) {
                playScene(choice.next);
            } else {
                engine.advanceTime();
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
    state.rep = Math.max(0, Math.min(100, state.rep));
    state.energy = Math.max(0, Math.min(100, state.energy));
    state.stress = Math.max(0, Math.min(100, state.stress));
}

function startMission() {
    const state = engine.getState();
    const mission = engine.generateMission();
    if (!mission) {
        addNarrative({ type: "text", content: "Pas de missions disponibles pour l'instant." });
        showFreePlayChoices();
        return;
    }

    addNarrative({ type: "divider" });
    addNarrative({ type: "action", content: `MISSION: ${mission.title}` });
    addNarrative({ type: "text", content: mission.desc });
    addNarrative({ type: "system", content: `Compétence: ${GAME_DATA.skills[mission.skill]?.name || mission.skill} | Difficulté: ${mission.difficulty}` });

    const skillLevel = state.skills[mission.skill] || 0;
    addNarrative({ type: "system", content: `Ton niveau: ${skillLevel}` });

    const choices = [
        {
            text: "Lancer la mission",
            effects: { energy: -10, stress: 5 },
            next: "mission_resolve"
        },
        {
            text: "Abandonner (prudent)",
            effects: {},
            next: "freeplay"
        }
    ];

    window._currentMission = mission;
    showChoices(choices);
}

function resolveMission() {
    const state = engine.getState();
    const mission = window._currentMission;
    if (!mission) { showFreePlayChoices(); return; }

    const success = engine.calculateMissionSuccess(mission.skill, mission.difficulty);

    if (success) {
        addNarrative({ type: "success", content: `Succès ! ${mission.successText}` });
        engine.applyEffects(mission.reward);
        if (state.skills[mission.skill] !== undefined) {
            state.skills[mission.skill] = Math.min(100, state.skills[mission.skill] + Math.floor(Math.random() * 5 + 3));
        }
        state.missionsCompleted++;
        state.hacksCompleted++;
    } else {
        addNarrative({ type: "danger", content: `Échec. ${mission.failText}` });
        state.risk = Math.min(100, state.risk + 5);
    }

    window._currentMission = null;
    engine.advanceTime();
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
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

    engine.advanceTime();
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function exploreDarknet() {
    const state = engine.getState();
    const events = [
        { text: "Tu navigues sur le darknet. Tu trouves un forum de hackers.", effect: { rep: 2 } },
        { text: "Tu achètes un exploit kit pour 200$. C'est une bonne affaire.", effect: { money: -200 } },
        { text: "Un vendeur t'offre un zero-day. Tu le soupçonnes d'être un FBI.", effect: { risk: 8 } },
        { text: "Tu trouves un tutoriel sur le pentest. Tu apprends des techniques avancées.", effect: { skill_pentest: 5 } },
        { text: "Tu vois une annonce pour un job de pentester. 5000$ par mission.", effect: { rep: 3 } },
        { text: "Un hacker te défie en duel de code. Tu gagnes.", effect: { rep: 5, skill_python: 3 } },
        { text: "Tu trouves une liste de mots de passe fuités. Tu peux les utiliser.", effect: { risk: 10 } }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    addNarrative({ type: "action", content: "EXPLORATION DARKNET" });
    addNarrative({ type: "text", content: event.text });
    engine.applyEffects(event.effect);

    engine.advanceTime();
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function sellExploits() {
    const state = engine.getState();
    const price = Math.floor(Math.random() * 500 + 200);
    state.money += price;

    addNarrative({ type: "action", content: "VENTE D'EXPLOITS" });
    addNarrative({ type: "text", content: `Tu vends un exploit pour $${price}. L'acheteur est satisfait.` });
    addNarrative({ type: "system", content: `Argent: $${state.money}` });

    engine.advanceTime();
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
}

function rest() {
    addNarrative({ type: "text", content: "Tu te reposes. Le silence de la nuit. Pas d'écran. Pas de code. Juste le bruit du réfrigérateur." });
    addNarrative({ type: "system", content: "Énergie récupérée. Stress réduit." });

    engine.advanceTime();
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

    addNarrative({ type: "action", content: `RENCONTRE: ${contact.name}` });
    addNarrative({ type: "text", content: `Tu contactes ${contact.name}. ${contact.role}. ${contact.personality}.` });

    const dialogue = [
        `${contact.name}: "Salut. Quoi de neuf ?"`,
        `${contact.name}: "J'ai entendu dire que tu faisais des choses intéressantes."`,
        `${contact.name}: "Fais attention à toi. Ce milieu est dangereux."`,
        `${contact.name}: "Si tu as besoin de moi, tu sais où me trouver."`
    ];

    addNarrative({ type: "speaker", content: dialogue[Math.floor(Math.random() * dialogue.length)] });

    state.contacts[contactId] = (state.contacts[contactId] || 0) + 5;

    engine.advanceTime();
    if (checkGameOver()) return;
    updateHUD();
    showFreePlayChoices();
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
                setTimeout(typeNext, 100);
            });
        } else if (scene.type === "divider") {
            const div = document.createElement('div');
            div.className = 'divider';
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
            setTimeout(typeNext, 100);
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
            setTimeout(typeChar, 8);
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

function postAction() {
    if (checkGameOver()) return;
    updateHUD();
}

function updateHUD() {
    const state = engine.getState();
    if (!state) return;

    document.getElementById('hud-pseudo').textContent = state.pseudo;
    document.getElementById('hud-money').textContent = `$${state.money}`;
    document.getElementById('hud-date').textContent = `${state.year}`;
    document.getElementById('hud-rep').textContent = `Réputation: ${state.rep}`;

    document.getElementById('bar-tech').style.width = `${state.stats.tech}%`;
    document.getElementById('val-tech').textContent = state.stats.tech;

    document.getElementById('bar-social').style.width = `${state.stats.social}%`;
    document.getElementById('val-social').textContent = state.stats.social;

    document.getElementById('bar-risk').style.width = `${state.risk}%`;
    document.getElementById('val-risk').textContent = state.risk;

    const newsEl = document.getElementById('news-text');
    newsEl.textContent = engine.getRandomNews();
}

function showSkills() {
    const state = engine.getState();
    const container = document.getElementById('skills-list');
    container.innerHTML = '';

    Object.keys(state.skills).forEach(skillId => {
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

        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `
            <div>
                <div class="inv-item-name">${item.name}</div>
                <div class="inv-item-desc">${item.desc}</div>
            </div>
            <span class="inv-item-rarity rarity-${item.rarity}">${item.rarity}</span>
        `;
        container.appendChild(div);
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
        let statusText = "Neutre";
        if (relation >= 50) { status = "friendly"; statusText = "Allié"; }
        else if (relation >= 20) { status = "neutral"; statusText = "Connu"; }
        else if (relation < 0) { status = "hostile"; statusText = "Ennemi"; }
        else { status = "neutral"; statusText = "Inconnu"; }

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

function saveGame() {
    const state = engine.getState();
    if (saveManager.save(state)) {
        addNarrative({ type: "system", content: "Partie sauvegardée." });
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
    return false;
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
        <p>Argent: $${state.money} | Réputation: ${state.rep} | Risque: ${state.risk}</p>
    `;

    showScreen('screen-gameover');
}
