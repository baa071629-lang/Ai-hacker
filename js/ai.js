const AI = (() => {
    const STASH_KEY = "ghost_protocol_ai_stash_v1";
    const FAIL_COOLDOWN_MS = 10 * 60 * 1000;
    const REQUEST_GAP_MS = 600;
    const LOW_MISSION = 2;
    const LOW_NEWS = 3;
    const LOW_CONTACT = 0;
    const LOW_RIVAL = 2;

    let stash = defaultStash();
    let configured = false;
    let busy = false;
    let lastFailAt = 0;
    let statusText = "HORS LIGNE";

    function defaultStash() {
        return { v: 1, missions: [], news: [], contacts: {}, rivals: [] };
    }

    function loadStash() {
        try {
            stash = JSON.parse(localStorage.getItem(STASH_KEY)) || defaultStash();
        } catch (e) {
            stash = defaultStash();
        }
        if (!stash.missions || !stash.news || !stash.contacts || !stash.rivals) {
            stash = defaultStash();
        }
    }

    function saveStash() {
        try {
            localStorage.setItem(STASH_KEY, JSON.stringify(stash));
        } catch (e) { }
    }

    function playerContext() {
        const s = engine.getState();
        const skills = Object.entries(s.skills || {})
            .slice(0, 8)
            .map(([k, v]) => `${GAME_DATA.skills[k] ? GAME_DATA.skills[k].name : k}:${v}`)
            .join(", ");
        return `jour ${s.day}/${s.month}/${s.year}, réputation ${s.rep}, missions réussies ${s.missionsCompleted}, hacks ${s.hacksCompleted}, argent ${s.money}$, heat ${s.heat}, compétences : ${skills || "aucune"}`;
    }

    function contactContext() {
        const s = engine.getState();
        const map = {};
        Object.keys(GAME_DATA.contacts).forEach(id => {
            map[id] = s.contacts[id] || 0;
        });
        return map;
    }

    function validMission(m) {
        return m
            && typeof m.title === "string" && m.title.length > 2
            && typeof m.desc === "string" && m.desc.length > 5
            && GAME_DATA.skills[m.skill]
            && GAME_DATA.minigames[m.minigame]
            && typeof m.difficulty === "number"
            && m.reward && typeof m.reward.money === "number"
            && typeof m.successText === "string"
            && typeof m.failText === "string";
    }

    function normalizeMission(m) {
        const reward = { money: Math.max(100, Math.round(m.reward.money)) };
        if (typeof m.reward.rep === "number") reward.rep = Math.round(m.reward.rep);
        if (typeof m.reward.heat === "number") reward.heat = Math.round(m.reward.heat);
        return {
            title: m.title.slice(0, 80),
            desc: m.desc.slice(0, 240),
            skill: m.skill,
            minigame: m.minigame,
            difficulty: Math.min(45, Math.max(10, Math.round(m.difficulty))),
            reward,
            successText: m.successText.slice(0, 160),
            failText: m.failText.slice(0, 160)
        };
    }

    function store(kind, data) {
        if (kind === "missions" && Array.isArray(data)) {
            stash.missions.push(...data.filter(validMission).map(normalizeMission));
        } else if (kind === "news" && Array.isArray(data)) {
            stash.news.push(...data.filter(s => typeof s === "string" && s.length > 10).map(s => s.slice(0, 180)));
        } else if (kind === "contacts" && data && typeof data === "object") {
            Object.keys(data).forEach(id => {
                const line = data[id];
                if (typeof line === "string" && line.length > 5) {
                    stash.contacts[id] = [line.slice(0, 200)];
                }
            });
        } else if (kind === "rivals" && Array.isArray(data)) {
            stash.rivals.push(...data.filter(s => typeof s === "string" && s.length > 5).map(s => s.slice(0, 160)));
        }
        saveStash();
    }

    async function ask(kind, context) {
        if (busy) return null;
        if (!configured) return null;
        if (Date.now() - lastFailAt < FAIL_COOLDOWN_MS) return null;

        busy = true;
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 12000);
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind, context }),
                signal: ctrl.signal
            });
            clearTimeout(timer);
            if (!res.ok) throw new Error("HTTP " + res.status);
            const j = await res.json();
            if (!j.ok) {
                if (j.reason === "budget" || j.reason === "rate_limit") {
                    configured = false;
                    statusText = "QUOTA DU JOUR ATTEINT";
                } else if (j.reason === "nokey") {
                    configured = false;
                    statusText = "HORS LIGNE";
                }
                return null;
            }
            await new Promise(r => setTimeout(r, REQUEST_GAP_MS));
            return j.data;
        } catch (e) {
            lastFailAt = Date.now();
            configured = false;
            statusText = "HORS LIGNE";
            return null;
        } finally {
            busy = false;
        }
    }

    async function refill(kind) {
        const data = await ask(kind, { context: playerContext(), contacts: contactContext() });
        if (data) store(kind, data);
    }

    function needs(kind) {
        if (kind === "missions") return stash.missions.length < LOW_MISSION;
        if (kind === "news") return stash.news.length < LOW_NEWS;
        if (kind === "contacts") return Object.values(stash.contacts).every(a => a.length <= LOW_CONTACT);
        if (kind === "rivals") return stash.rivals.length < LOW_RIVAL;
        return false;
    }

    async function prime() {
        loadStash();
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 4000);
            const res = await fetch("/api/status", { signal: ctrl.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error("HTTP " + res.status);
            const j = await res.json();
            configured = !!j.configured;
            statusText = configured ? "EN LIGNE" : "HORS LIGNE";
        } catch (e) {
            configured = false;
            statusText = "HORS LIGNE";
        }
        if (configured) {
            for (const kind of ["missions", "news", "contacts", "rivals"]) {
                if (needs(kind)) await refill(kind);
            }
        }
    }

    return {
        prime,
        nextMission() {
            let m = null;
            while (stash.missions.length > 0) {
                const candidate = stash.missions.shift();
                if (validMission(candidate)) { m = candidate; break; }
            }
            saveStash();
            if (needs("missions")) refill("missions");
            return m;
        },
        dailyNews() {
            const out = stash.news.splice(0, 5);
            saveStash();
            if (needs("news")) refill("news");
            return out;
        },
        contactLine(id) {
            const arr = stash.contacts[id] || [];
            const line = arr.shift() || null;
            saveStash();
            if (needs("contacts")) refill("contacts");
            return line;
        },
        rivalTaunt() {
            const line = stash.rivals.shift() || null;
            saveStash();
            if (needs("rivals")) refill("rivals");
            return line;
        },
        status() {
            const n = stash.missions.length + stash.news.length + stash.rivals.length +
                Object.values(stash.contacts).reduce((a, c) => a + c.length, 0);
            return { text: statusText, cache: n };
        }
    };
})();
