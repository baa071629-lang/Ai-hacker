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
            pseudo: pseudo,
            origin: origin,
            money: 100,
            rep: 0,
            risk: 0,
            month: 1,
            year: 2024,
            day: 1,
            stats: {
                tech: originData.bonuses.tech,
                social: originData.bonuses.social,
                risk: originData.bonuses.risk
            },
            skills: {},
            items: originData.startItems.map(id => id),
            contacts: {},
            inventory: originData.startItems.map(id => id),
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
            currentSceneIndex: 0,
            phase: "prologue",
            location: "chambre",
            availableEvents: [],
            completedEvents: [],
            activeMission: null,
            monthlyEvents: [],
            streak: 0,
            lastLogin: null,
            achievements: []
        };

        originData.startSkills.forEach(skill => {
            if (GAME_DATA.skills[skill]) {
                this.state.skills[skill] = 20;
            }
        });

        return this.state;
    }

    getState() {
        return this.state;
    }

    loadState(savedState) {
        this.state = savedState;
    }

    applyEffects(effects) {
        if (!effects) return;
        if (effects.money) this.state.money += effects.money;
        if (effects.rep) this.state.rep += effects.rep;
        if (effects.risk) this.state.risk = Math.max(0, Math.min(100, this.state.risk + effects.risk));
        if (effects.tech) this.state.stats.tech = Math.max(0, Math.min(100, this.state.stats.tech + effects.tech));
        if (effects.social) this.state.stats.social = Math.max(0, Math.min(100, this.state.stats.social + effects.social));
        if (effects.energy) this.state.energy = Math.max(0, Math.min(100, this.state.energy + effects.energy));
        if (effects.stress) this.state.stress = Math.max(0, Math.min(100, this.state.stress + effects.stress));

        Object.keys(effects).forEach(key => {
            if (key.startsWith('skill_')) {
                const skillName = key.replace('skill_', '');
                if (this.state.skills[skillName] !== undefined) {
                    this.state.skills[skillName] = Math.min(100, this.state.skills[skillName] + effects[key]);
                } else {
                    this.state.skills[skillName] = Math.min(100, effects[key]);
                }
            }
            if (key.startsWith('contact_')) {
                const contactId = key.replace('contact_', '');
                this.state.contacts[contactId] = (this.state.contacts[contactId] || 0) + effects[key];
            }
        });

        this.state.stats.risk = Math.max(0, Math.min(100, this.state.risk));
        this.state.stats.tech = Math.max(0, Math.min(100, this.state.stats.tech));
        this.state.stats.social = Math.max(0, Math.min(100, this.state.stats.social));
    }

    advanceTime() {
        this.state.day += 7;
        if (this.state.day > 30) {
            this.state.day = 1;
            this.state.month += 1;
            if (this.state.month > 12) {
                this.state.month = 1;
                this.state.year += 1;
            }
        }
        this.state.daysAlive += 7;
        this.state.energy = Math.min(100, this.state.energy + 20);
        this.state.stress = Math.max(0, this.state.stress - 5);

        if (this.state.risk > 80 && Math.random() < 0.3) {
            this.state.gameover = true;
            this.state.gameoverReason = "La police a tracing ton IP. Tu as été arrêté à 4h du matin.";
        }
    }

    getRandomNews() {
        const idx = Math.floor(Math.random() * GAME_DATA.newsPool.length);
        return GAME_DATA.newsPool[idx];
    }

    getAvailableEvents() {
        const events = [...STORY.earlyEvents, ...STORY.monthEvents];
        return events.filter(event => {
            if (this.state.completedEvents.includes(event.id)) return false;
            if (event.trigger) {
                if (event.trigger.rep && this.state.rep < event.trigger.rep) return false;
                if (event.trigger.risk && this.state.risk < event.trigger.risk) return false;
                if (event.trigger.month && this.state.month < event.trigger.month) return false;
            }
            return true;
        });
    }

    getEnding() {
        if (this.state.risk > 80) return STORY.endings.caught;
        if (this.state.stress > 80) return STORY.endings.burnout;
        if (this.state.rep >= 70 && this.state.risk < 30) return STORY.endings.white_hat;
        if (this.state.rep >= 50 && this.state.risk >= 50) return STORY.endings.gray_hat;
        if (this.state.rep >= 80 && this.state.risk >= 60) return STORY.endings.legend;
        if (this.state.risk >= 70) return STORY.endings.black_hat;
        return STORY.endings.gray_hat;
    }

    generateMission() {
        const missions = [
            {
                title: "Phishing ciblé",
                desc: "Un employé d'une PME locale a cliqué sur un lien suspects. Tu peux exploiter ça.",
                skill: "social_engineering",
                difficulty: 15,
                reward: { money: 500, rep: 3, risk: 8 },
                successText: "Tu as récupéré les identifiants de l'employé. Accès au réseau interne.",
                failText: "L'employé a signalé le phishing. Le RI est en alerte."
            },
            {
                title: "Injection SQL",
                desc: "Un site e-commerce utilise MySQL sans préparation. Le formulaire de login est vulnérable.",
                skill: "web_hacking",
                difficulty: 20,
                reward: { money: 800, rep: 5, risk: 10 },
                successText: "La base de données est ouverte. 50 000 comptes exposés.",
                failText: "Un WAF a détecté l'injection. Ton IP est loggée."
            },
            {
                title: "Scan réseau local",
                desc: "Tu es dans un café. Le wifi est ouvert. Tu peux scanner le réseau.",
                skill: "reseaux",
                difficulty: 12,
                reward: { money: 200, rep: 2, risk: 5 },
                successText: "Tu as trouvé 3 machines vulnérables. Tu peux les compromettre.",
                failText: "Un admin réseau a vu ton scan. Tu as été banni du wifi."
            },
            {
                title: "Social Engineering physique",
                desc: "Tu peux te faire passer pour un technicien IT pour accéder à un bâtiment.",
                skill: "social_engineering",
                difficulty: 25,
                reward: { money: 1200, rep: 8, risk: 15 },
                successText: "Tu as accès au réseau physique. Tu peux poser un keylogger.",
                failText: "La sécurité t'a reconnu. Tu as été viré du site."
            },
            {
                title: "Capture de traffic",
                desc: "Sur le réseau du café, tu peux sniff le trafic non chiffré.",
                skill: "reseaux",
                difficulty: 18,
                reward: { money: 400, rep: 3, risk: 7 },
                successText: "Tu as intercepté des sessions HTTP. Des tokens, des mots de passe.",
                failText: "Le café utilise du 802.1X. Tu n'as rien pu capturer."
            },
            {
                title: "Exploitation de faille zero-day",
                desc: "Tu as trouvé une faille dans un logiciel utilisé par 10 000 entreprises.",
                skill: "exploits",
                difficulty: 40,
                reward: { money: 5000, rep: 15, risk: 20 },
                successText: "La faille est validée. Tu peux la vendre ou l'utiliser.",
                failText: "Le vendor a été notifié. La faille est en cours de patch."
            },
            {
                title: "Reverse engineering d'un malware",
                desc: "Tu as récupéré un sample de malware. Tu peux l'analyser pour comprendre comment il fonctionne.",
                skill: "reverse",
                difficulty: 30,
                reward: { money: 1500, rep: 10, risk: 5 },
                successText: "Tu as compris le mécanisme. Tu peux créer un patch ou un antidote.",
                failText: "Le malware a déclenché un piège. Ton PC est compromis."
            },
            {
                title: "Pentest d'un startup",
                desc: "Une startup te propose de tester leur plateforme. Rémunéré, légal.",
                skill: "pentest",
                difficulty: 22,
                reward: { money: 2000, rep: 12, risk: 2 },
                successText: "Tu as trouvé 5 failles critiques. Le client est impressionné.",
                failText: "Tu as cassé la production. Le client est furieux."
            }
        ];

        const available = missions.filter(m => {
            const skillVal = this.state.skills[m.skill] || 0;
            return skillVal < 80 || Math.random() < 0.3;
        });

        return available[Math.floor(Math.random() * available.length)];
    }

    calculateMissionSuccess(skill, difficulty) {
        const skillLevel = this.state.skills[skill] || 0;
        const luck = Math.random() * 20 - 10;
        const techBonus = this.state.stats.tech * 0.3;
        return (skillLevel + techBonus + luck) >= difficulty;
    }

    checkGameOver() {
        if (this.state.risk >= 100) {
            this.state.gameover = true;
            this.state.gameoverReason = "Ton niveau de risque est trop élevé. La police te a localisé.";
            return true;
        }
        if (this.state.stress >= 100) {
            this.state.gameover = true;
            this.state.gameoverReason = "Tu craques. Le stress, l'isolement, la peur. Tu ne peux plus continuer.";
            return true;
        }
        if (this.state.energy <= 0) {
            this.state.gameover = true;
            this.state.gameoverReason = "Tu t'effondres d'épuisement. Tu n'as plus la force de continuer.";
            return true;
        }
        if (this.state.daysAlive > 365 * 10) {
            this.state.gameover = true;
            this.state.gameoverReason = "10 ans se sont écoulés. Tu as vécu 10 vies en une. Il est temps de prendre une décision.";
            return true;
        }
        return false;
    }
}
