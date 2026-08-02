class GameEngine {
    constructor() {
        this.state = null;
        this.currentScene = null;
        this.typingSpeed = 15;
        this.isTyping = false;
    }

    newGame(origin, pseudo) {
        const originData = GAME_DATA.origins[origin];
        this.state = {
            version: GAME_DATA.VERSION,
            pseudo: pseudo,
            origin: origin,
            money: 100,
            moneyEarned: 0,
            rep: 0,
            risk: 0,
            heat: 0,
            month: 1,
            year: 2026,
            day: 1,
            totalDays: 0,
            chapter: 1,
            stats: {
                tech: originData.bonuses.tech,
                social: originData.bonuses.social,
                risk: 0
            },
            skills: {},
            inventory: [...originData.startItems],
            equipped: {},
            messages: [],
            contacts: {},
            flags: {},
            missionsCompleted: 0,
            hacksCompleted: 0,
            daysAlive: 0,
            reputation: 0,
            energy: 100,
            stress: 0,
            alive: true,
            gameover: false,
            gameoverReason: "",
            currentChapter: "prologue",
            phase: "prologue",
            location: "chambre",
            availableEvents: [],
            completedEvents: [],
            activeMission: null,
            streak: 0,
            lastLoginDay: null,
            achievements: [],
            marketPrices: {},
            rivalActivity: {},
            worldDay: 0,
            raid: false,
            arrested: false,
            ended: false
        };

        originData.startSkills.forEach(skill => {
            if (GAME_DATA.skills[skill]) {
                this.state.skills[skill] = 20;
            }
        });

        this.state.inventory.forEach(id => {
            const item = GAME_DATA.items.find(i => i.id === id);
            if (item && item.type === "gear") {
                this.state.equipped[id] = true;
            }
        });

        this.initMarket();
        this.initRivals();

        return this.state;
    }

    initMarket() {
        GAME_DATA.shop.forEach(entry => {
            const item = GAME_DATA.items.find(i => i.id === entry.itemId);
            const base = entry.price;
            const variance = 0.6 + Math.random() * 0.8;
            this.state.marketPrices[entry.itemId] = Math.max(10, Math.round(base * variance));
        });
    }

    initRivals() {
        GAME_DATA.rivals.forEach(rival => {
            this.state.rivalActivity[rival.name] = {
                rep: rival.rep + Math.floor(Math.random() * 10),
                lastActive: Math.floor(Math.random() * 3),
                missions: Math.floor(Math.random() * 5),
                alive: true
            };
        });
    }

    getState() {
        return this.state;
    }

    loadState(savedState) {
        if (!savedState || savedState.version !== GAME_DATA.VERSION) {
            return false;
        }
        if (!savedState.equipped) {
            savedState.equipped = {};
            savedState.inventory.forEach(id => {
                const item = GAME_DATA.items.find(i => i.id === id);
                if (item && item.type === "gear") savedState.equipped[id] = true;
            });
        }
        if (!savedState.messages) savedState.messages = [];
        if (!savedState.location) savedState.location = "chambre";
        this.state = savedState;
        return true;
    }

    applyEffects(effects) {
        if (!effects) return;
        const s = this.state;
        if (effects.money) {
            s.money += effects.money;
            if (effects.money > 0) s.moneyEarned += effects.money;
        }
        if (effects.rep) s.rep = Math.max(0, s.rep + effects.rep);
        if (effects.risk) s.risk = this.clamp(s.risk + effects.risk, 0, 100);
        if (effects.heat) s.heat = this.clamp(s.heat + effects.heat, 0, 100);
        if (effects.tech) s.stats.tech = this.clamp(s.stats.tech + effects.tech, 0, 100);
        if (effects.social) s.stats.social = this.clamp(s.stats.social + effects.social, 0, 100);
        if (effects.energy) s.energy = this.clamp(s.energy + effects.energy, 0, 100);
        if (effects.stress) s.stress = this.clamp(s.stress + effects.stress, 0, 100);
        if (effects.days) s.totalDays += effects.days;

        Object.keys(effects).forEach(key => {
            if (key.startsWith('skill_')) {
                const skillName = key.replace('skill_', '');
                s.skills[skillName] = this.clamp((s.skills[skillName] || 0) + effects[key], 0, 100);
            }
            if (key.startsWith('contact_')) {
                const contactId = key.replace('contact_', '');
                s.contacts[contactId] = (s.contacts[contactId] || 0) + effects[key];
            }
            if (key.startsWith('flag_')) {
                s.flags[key.replace('flag_', '')] = true;
            }
            if (key === 'item') {
                this.addItem(effects[key]);
            }
        });
    }

    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    addItem(itemId) {
        if (!this.state.inventory.includes(itemId)) {
            this.state.inventory.push(itemId);
        }
    }

    removeItem(itemId) {
        const idx = this.state.inventory.indexOf(itemId);
        if (idx !== -1) this.state.inventory.splice(idx, 1);
        delete this.state.equipped[itemId];
    }

    hasItem(itemId) {
        return this.state.inventory.includes(itemId);
    }

    equipItem(itemId) {
        const item = GAME_DATA.items.find(i => i.id === itemId);
        if (!item || item.type !== "gear") return { ok: false, msg: "Cet objet ne s'équipe pas." };
        if (!this.hasItem(itemId)) return { ok: false, msg: "Tu ne possèdes pas cet objet." };
        this.state.equipped[itemId] = true;
        return { ok: true, msg: `Équipé : ${item.name}.` };
    }

    unequipItem(itemId) {
        const item = GAME_DATA.items.find(i => i.id === itemId);
        if (!item) return { ok: false, msg: "Objet inconnu." };
        delete this.state.equipped[itemId];
        return { ok: true, msg: `Déséquipé : ${item.name}.` };
    }

    isEquipped(itemId) {
        return !!this.state.equipped[itemId];
    }

    addMessage(fromId, text) {
        const contact = GAME_DATA.contacts[fromId];
        const from = contact ? contact.name : fromId;
        const avatar = contact ? contact.avatar : "📱";
        this.state.messages.push({
            id: "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            from: fromId,
            fromName: from,
            avatar: avatar,
            text: text,
            day: this.state.totalDays,
            date: `${this.state.day}/${this.state.month}/${this.state.year}`,
            read: false
        });
        if (window.gameUI && window.gameUI.phoneMessage) {
            window.gameUI.phoneMessage({ from, avatar, text });
        }
        return this.state.messages[this.state.messages.length - 1];
    }

    unreadCount() {
        return (this.state.messages || []).filter(m => !m.read).length;
    }

    advanceTime(days = 1) {
        const s = this.state;
        s.totalDays += days;
        s.day += days;
        while (s.day > 30) {
            s.day -= 30;
            s.month++;
            if (s.month > 12) {
                s.month = 1;
                s.year++;
            }
        }
        s.worldDay += days;
        s.daysAlive += days;

        s.energy = this.clamp(s.energy + 15, 0, 100);
        s.stress = this.clamp(s.stress - 5, 0, 100);
        s.heat = this.clamp(s.heat - Math.max(1, Math.floor(days * 0.8)), 0, 100);

        this.updateMarket();
        this.updateRivals(days);
        this.checkWorldEvents();
        this.checkHeatEvents();
        this.checkChapter();
        this.checkAchievements();
    }

    checkChapter() {
        const s = this.state;
        const defs = [
            { n: 2, cond: () => s.totalDays >= 10 || s.hacksCompleted >= 5 },
            { n: 3, cond: () => s.totalDays >= 30 || s.rep >= 25 },
            { n: 4, cond: () => s.totalDays >= 60 || s.heat >= 50 },
            { n: 5, cond: () => s.totalDays >= 90 || s.rep >= 60 }
        ];
        defs.forEach(d => {
            if (s.chapter < d.n && d.cond()) {
                s.chapter = d.n;
                s.currentChapter = "acte_" + d.n;
                if (window.gameUI && window.gameUI.pushChapter) {
                    window.gameUI.pushChapter(d.n);
                }
            }
        });
    }

    updateMarket() {
        Object.keys(this.state.marketPrices).forEach(itemId => {
            const entry = GAME_DATA.shop.find(e => e.itemId === itemId);
            if (!entry) return;
            const drift = 0.85 + Math.random() * 0.3;
            this.state.marketPrices[itemId] = Math.max(entry.min * 10, Math.round(this.state.marketPrices[itemId] * drift));
        });
    }

    getMarketPrice(itemId) {
        return this.state.marketPrices[itemId] || 0;
    }

    updateRivals(days) {
        Object.keys(this.state.rivalActivity).forEach(name => {
            const rival = this.state.rivalActivity[name];
            if (Math.random() < 0.35) {
                rival.lastActive = this.state.totalDays;
                rival.missions++;
                if (Math.random() < 0.4) {
                    rival.rep += Math.floor(Math.random() * 3);
                }
            }
        });
    }

    checkWorldEvents() {
        const s = this.state;
        GAME_DATA.worldEvents.forEach(event => {
            if (s.worldDay >= event.day && !s.flags['world_' + event.day]) {
                s.flags['world_' + event.day] = true;
                if (window.gameUI && window.gameUI.pushWorldEvent) {
                    window.gameUI.pushWorldEvent(event.text);
                }
            }
        });
    }

    checkHeatEvents() {
        const s = this.state;
        GAME_DATA.heatEvents.forEach(event => {
            if (s.heat >= event.threshold && !s.flags['heat_' + event.threshold]) {
                s.flags['heat_' + event.threshold] = true;
                if (window.gameUI && window.gameUI.pushHeatEvent) {
                    window.gameUI.pushHeatEvent(event.text, event.threshold);
                }
            }
        });
    }

    checkAchievements() {
        const s = this.state;
        const defs = [
            { id: "first_hack", cond: () => s.hacksCompleted >= 1 },
            { id: "pentester", cond: () => s.missionsCompleted >= 10 },
            { id: "rich", cond: () => s.money >= 10000 },
            { id: "legend", cond: () => s.rep >= 50 },
            { id: "ghost", cond: () => s.hacksCompleted >= 20 && s.heat < 30 },
            { id: "caught_once", cond: () => s.flags.raid },
            { id: "social_butterfly", cond: () => Object.keys(GAME_DATA.contacts).every(c => (s.contacts[c] || 0) > 0) },
            { id: "whale", cond: () => s.flags.hard_mission },
            { id: "streak_7", cond: () => s.streak >= 7 },
            { id: "zero_day", cond: () => s.flags.zero_day },
            { id: "fallen", cond: () => s.arrested },
            { id: "untouchable", cond: () => s.heat <= 10 && s.rep >= 30 && s.totalDays > 30 }
        ];
        defs.forEach(d => {
            if (!s.achievements.includes(d.id) && d.cond()) {
                s.achievements.push(d.id);
                if (window.gameUI && window.gameUI.unlockAchievement) {
                    window.gameUI.unlockAchievement(d.id);
                }
            }
        });
    }

    getRandomNews() {
        const idx = Math.floor(Math.random() * GAME_DATA.newsPool.length);
        return GAME_DATA.newsPool[idx];
    }

    getAvailableEvents() {
        const events = [...STORY.earlyEvents, ...STORY.monthEvents];
        return events.filter(event => {
            if (this.state.completedEvents.includes(event.id)) return false;
            if (event.chapter && this.state.chapter < event.chapter) return false;
            if (event.trigger) {
                if (event.trigger.rep && this.state.rep < event.trigger.rep) return false;
                if (event.trigger.risk && this.state.risk < event.trigger.risk) return false;
                if (event.trigger.month && this.state.month < event.trigger.month) return false;
                if (event.trigger.missions && this.state.missionsCompleted < event.trigger.missions) return false;
            }
            return true;
        });
    }

    getEnding() {
        const s = this.state;
        if (s.flags.final_path === "white") return STORY.endings.white_hat;
        if (s.flags.final_path === "black") return s.rep >= 70 ? STORY.endings.legend : STORY.endings.black_hat;
        if (s.flags.final_path === "gray") return s.rep >= 70 ? STORY.endings.legend : STORY.endings.gray_hat;
        if (s.risk > 80) return STORY.endings.caught;
        if (s.stress > 80) return STORY.endings.burnout;
        if (s.rep >= 70 && s.risk < 30) return STORY.endings.white_hat;
        if (s.rep >= 50 && s.risk >= 50) return STORY.endings.gray_hat;
        if (s.rep >= 80 && s.risk >= 60) return STORY.endings.legend;
        if (s.risk >= 70) return STORY.endings.black_hat;
        return STORY.endings.gray_hat;
    }

    generateMission() {
        const s = this.state;
        const missionPool = [
            {
                title: "Injection SQL sur un site e-commerce",
                desc: "Un petit site de vente en ligne utilise MySQL sans préparation de requêtes. Le formulaire de login est vulnérable.",
                skill: "web_hacking",
                minigame: "bruteforce",
                difficulty: 15,
                reward: { money: 600, rep: 4, heat: 8 },
                successText: "La base de données s'ouvre. 50 000 comptes exposés. Tu copies ce qu'il faut et tu sors.",
                failText: "Un WAF a détecté l'injection. Ton IP est loggée dans leurs journaux."
            },
            {
                title: "Phishing ciblé chez une PME",
                desc: "Un client te paie pour les identifiants d'un employé d'une PME locale. L'employé mord à l'hameçon ou pas.",
                skill: "social_engineering",
                minigame: "osint",
                difficulty: 15,
                reward: { money: 700, rep: 3, heat: 6 },
                successText: "L'employé a cliqué. Tu as ses identifiants. Accès au réseau interne.",
                failText: "L'employé a signalé le mail au service informatique. Le SI est en alerte."
            },
            {
                title: "Sniffing sur le WiFi du café",
                desc: "Le café du coin a un WiFi ouvert. Tu peux capturer le trafic non chiffré des clients.",
                skill: "reseaux",
                minigame: "timing",
                difficulty: 12,
                reward: { money: 300, rep: 2, heat: 5 },
                successText: "Tu interceptes des sessions HTTP. Des tokens, des mots de passe en clair.",
                failText: "Le café utilise du 802.1X. Tu n'as rien pu capturer."
            },
            {
                title: "Brute-force sur un forum",
                desc: "Un forum de trading a des protections faibles. Casse les mots de passe des modérateurs.",
                skill: "crypto",
                minigame: "bruteforce",
                difficulty: 20,
                reward: { money: 900, rep: 5, heat: 10 },
                successText: "Le hash craque. Tu as accès au compte modérateur.",
                failText: "Le forum a bloqué ton IP après 3 tentatives."
            },
            {
                title: "Exfiltration de données",
                desc: "Une compagnie d'assurance stocke des dossiers clients sur un serveur mal configuré.",
                skill: "exploits",
                minigame: "sequence",
                difficulty: 25,
                reward: { money: 1500, rep: 8, heat: 15 },
                successText: "Les dossiers sont exfiltrés. Le client te paie en cryptomonnaie.",
                failText: "Le serveur a alerté un SOC. Ta connexion a été coupée."
            },
            {
                title: "Piratage d'un compte crypto",
                desc: "Un trader te demande de récupérer son compte volé. Le wallet est protégé par 2FA.",
                skill: "crypto",
                minigame: "sequence",
                difficulty: 30,
                reward: { money: 2000, rep: 6, heat: 12 },
                successText: "Tu contournes la 2FA via le hash du téléphone. Wallet récupéré.",
                failText: "L'échange a détecté une tentative anormale. Tout est verrouillé."
            },
            {
                title: "DDoS de représailles",
                desc: "Un concurrent t'a fait une crasse. Envoie le botnet sur son site pour le mettre hors ligne.",
                skill: "reseaux",
                minigame: "evasion",
                difficulty: 22,
                reward: { money: 800, rep: 5, heat: 18 },
                successText: "Le site tombe en 30 secondes. Le concurrent panique.",
                failText: "L'hébergeur a activé la protection anti-DDoS. Ton botnet est détecté."
            },
            {
                title: "Exploitation de zero-day",
                desc: "Tu as entendu parler d'une faille dans un logiciel de gestion utilisé par 10 000 entreprises.",
                skill: "exploits",
                minigame: "sequence",
                difficulty: 40,
                reward: { money: 5000, rep: 15, heat: 25 },
                successText: "La faille est validée. Tu peux la vendre au plus offrant.",
                failText: "Le vendeur a déjà patché. Ta fenêtre d'exploitation est fermée."
            },
            {
                title: "Analyse de malware",
                desc: "Tu as récupéré un sample de ransomware. Analyse-le pour comprendre son fonctionnement.",
                skill: "reverse",
                minigame: "sequence",
                difficulty: 28,
                reward: { money: 1200, rep: 10, heat: 3 },
                successText: "Tu comprends le mécanisme. Tu peux créer un antidote et le vendre.",
                failText: "Le malware a déclenché un piège. Une partie de ton PC est compromise."
            },
            {
                title: "Pentest légal pour une startup",
                desc: "Une startup te paie pour tester leur plateforme. Rémunéré et légal. Enfin, presque.",
                skill: "pentest",
                minigame: "osint",
                difficulty: 18,
                reward: { money: 2000, rep: 12, heat: 2 },
                successText: "Tu trouves 5 failles critiques. Le client est impressionné.",
                failText: "Tu as cassé la production pendant le test. Le client est furieux."
            },
            {
                title: "Interception de satellite",
                desc: "Un client parano te demande de vérifier si son signal satellite est espionné.",
                skill: "hardware",
                minigame: "timing",
                difficulty: 35,
                reward: { money: 3000, rep: 10, heat: 15 },
                successText: "Tu confirmes : le signal est réémis. Quelqu'un espionne le client.",
                failText: "La fréquence est chiffrée. Tu n'as rien pu vérifier."
            },
            {
                title: "Défense d'un serveur ami",
                desc: "Zen, ton contact sysadmin, te demande de protéger son serveur d'une attaque en cours.",
                skill: "forensics",
                minigame: "evasion",
                difficulty: 20,
                reward: { money: 1000, rep: 8, heat: 5, contact_zen: 15 },
                successText: "L'attaquant se heurte à ton honeypot. Le serveur de Zen est sauvé.",
                failText: "L'attaquant a réussi à entrer. Zen n'est pas content."
            }
        ];

        const available = missionPool.filter(m => {
            const skillVal = s.skills[m.skill] || 0;
            return skillVal < 85 || Math.random() < 0.4;
        });

        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    }

    gearBonusFor(skill) {
        let bonus = 0;
        this.state.inventory.forEach(id => {
            if (!this.state.equipped[id]) return;
            const item = GAME_DATA.items.find(i => i.id === id);
            if (item && item.effect && item.effect.skills && item.effect.skills[skill]) {
                bonus += item.effect.skills[skill];
            }
        });
        return bonus;
    }

    calculateMissionSuccess(skill, difficulty) {
        const skillLevel = this.state.skills[skill] || 0;
        const gearBonus = this.gearBonusFor(skill);
        const luck = Math.random() * 20 - 10;
        const techBonus = this.state.stats.tech * 0.3;
        return (skillLevel + gearBonus + techBonus + luck) >= difficulty;
    }

    useItem(itemId) {
        const item = GAME_DATA.items.find(i => i.id === itemId);
        if (!item) return { ok: false, msg: "Objet inconnu." };
        if (item.type !== "consumable") return { ok: false, msg: "Cet objet ne se consomme pas." };
        if (!this.hasItem(itemId)) return { ok: false, msg: "Tu ne possèdes pas cet objet." };
        this.removeItem(itemId);
        if (item.effect) {
            if (item.effect.skills) {
                Object.keys(item.effect.skills).forEach(k => {
                    this.state.skills[k] = this.clamp((this.state.skills[k] || 0) + item.effect.skills[k], 0, 100);
                });
            }
            this.applyEffects(item.effect);
        }
        return { ok: true, msg: `Utilisé : ${item.name}.` };
    }

    buyItem(itemId) {
        const entry = GAME_DATA.shop.find(e => e.itemId === itemId);
        if (!entry) return { ok: false, msg: "Article inconnu." };
        const price = this.getMarketPrice(itemId);
        if (this.state.money < price) return { ok: false, msg: `Pas assez d'argent (il faut ${price}$).` };
        if (this.hasItem(itemId)) return { ok: false, msg: "Tu possèdes déjà cet équipement." };
        this.state.money -= price;
        this.addItem(itemId);
        return { ok: true, msg: `Acheté pour ${price}$.` };
    }

    sellItem(itemId) {
        const item = GAME_DATA.items.find(i => i.id === itemId);
        if (!item) return { ok: false, msg: "Objet inconnu." };
        if (item.type === "phone") return { ok: false, msg: "Tu ne vends pas ton téléphone." };
        if (item.type !== "data" && item.type !== "gear") return { ok: false, msg: "Cet objet ne se vend pas." };
        const idx = this.state.inventory.indexOf(itemId);
        if (idx === -1) return { ok: false, msg: "Tu ne possèdes pas cet objet." };
        const price = item.type === "data"
            ? Math.max(50, item.value || 100)
            : Math.max(20, Math.floor((this.getMarketPrice(itemId) || item.value || 100) * 0.5));
        this.state.inventory.splice(idx, 1);
        delete this.state.equipped[itemId];
        this.state.money += price;
        return { ok: true, msg: `Vendu pour ${price}$.` };
    }

    checkGameOver() {
        const s = this.state;
        if (s.risk >= 100) {
            s.gameover = true;
            s.gameoverReason = "Ton niveau de risque est devenu trop élevé. La police t'a localisé.";
            return true;
        }
        if (s.stress >= 100) {
            s.gameover = true;
            s.gameoverReason = "Tu craques. Le stress, l'isolement, la peur. Tu ne peux plus continuer.";
            return true;
        }
        if (s.energy <= 0) {
            s.gameover = true;
            s.gameoverReason = "Tu t'effondres d'épuisement. Tu n'as plus la force de continuer.";
            return true;
        }
        if (s.totalDays > 365 * 8) {
            s.gameover = true;
            s.gameoverReason = "8 ans se sont écoulés. Il est temps de prendre une décision définitive.";
            return true;
        }
        return false;
    }

    doRaid() {
        const s = this.state;
        s.flags.raid = true;
        const lost = Math.min(s.money, Math.floor(s.money * (0.3 + Math.random() * 0.4)));
        s.money -= lost;
        s.heat = this.clamp(s.heat - 60, 0, 100);
        s.risk = this.clamp(s.risk + 15, 0, 100);
        const gearLost = s.inventory.filter(id => {
            const item = GAME_DATA.items.find(i => i.id === id);
            return item && item.type === "gear" && Math.random() < 0.3;
        });
        gearLost.forEach(id => this.removeItem(id));
        return { lost, gearLost };
    }
}
