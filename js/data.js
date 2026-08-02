const GAME_DATA = {
    origins: {
        dev: {
            name: "Développeur freelance",
            desc: "Tu代码了5 ans pour des clients, mais la routine te tue. La nuit, tu explores des failles.",
            bonuses: { tech: 15, social: 5, risk: 0 },
            startSkills: ["python", "linux"],
            startItems: ["laptop_perso", "vpn_1mois"]
        },
        student: {
            name: "Étudiant en info",
            desc: "L3 informatique, passionné mais sans expérience. Tu apprends vite, trop vite.",
            bonuses: { tech: 8, social: 10, risk: 0 },
            startSkills: ["html_css", "python_basics"],
            startItems: ["laptop_perso", "cafe_x5"]
        },
        gamer: {
            name: "Gamer professionnel",
            desc: "Tu montais en rank, mais le gaming t'a appris la stratégie et la rapidité.",
            bonuses: { tech: 5, social: 12, risk: 0 },
            startSkills: ["reseaux_basics", "social_engineering"],
            startItems: ["pc_gaming", "vpn_1mois"]
        },
        fixer: {
            name: "Dépanneur informatique",
            desc: "Tu connais les failles des PME parce que tu les répares... ou tu les crées.",
            bonuses: { tech: 10, social: 8, risk: 0 },
            startSkills: ["windows", "reseaux_basics"],
            startItems: ["kit_outils", "acces_pme"]
        }
    },

    skills: {
        python: { name: "Python", maxLevel: 100, category: "code" },
        javascript: { name: "JavaScript", maxLevel: 100, category: "code" },
        linux: { name: "Linux/Unix", maxLevel: 100, category: "system" },
        windows: { name: "Windows", maxLevel: 100, category: "system" },
        reseaux: { name: "Réseaux", maxLevel: 100, category: "infra" },
        crypto: { name: "Cryptographie", maxLevel: 100, category: "crypto" },
        social_engineering: { name: "Social Engineering", maxLevel: 100, category: "social" },
        reverse: { name: "Reverse Engineering", maxLevel: 100, category: "code" },
        web_hacking: { name: "Web Hacking", maxLevel: 100, category: "web" },
        forensics: { name: "Forensics", maxLevel: 100, category: "system" },
        stealth: { name: "Furtivité", maxLevel: 100, category: "stealth" },
        exploits: { name: "Exploitation", maxLevel: 100, category: "offensive" },
        anonymat: { name: "Anonymat", maxLevel: 100, category: "stealth" },
        pentest: { name: "Pentest", maxLevel: 100, category: "offensive"},
        malware: { name: "Malware Dev", maxLevel: 100, category: "offensive" },
        mobile_hacking: { name: "Mobile Hacking", maxLevel: 100, category: "web" },
        cloud: { name: "Cloud Security", maxLevel: 100, category: "infra" },
        hardware: { name: "Hardware/HackRF", maxLevel: 100, category: "system" },
        osint: { name: "OSINT", maxLevel: 100, category: "social" },
        ia: { name: "IA / Prompt Injection", maxLevel: 100, category: "web" }
    },

    items: [
        { id: "laptop_perso", name: "Laptop personnel", desc: "Un PC moyen, suffisant pour débuter", rarity: "common" },
        { id: "pc_gaming", name: "PC Gaming", desc: "Puissant, bon pour le cracking", rarity: "common" },
        { id: "kit_outils", name: "Kit d'outils", desc: "Clés USB, adaptateurs réseau", rarity: "common" },
        { id: "vpn_1mois", name: "VPN 1 mois", desc: "Protège ton IP pendant 30 jours", rarity: "common" },
        { id: "vpn_1an", name: "VPN 1 an", desc: "Couverture complète pour 12 mois", rarity: "rare" },
        { id: "tor_browser", name: "Tor Browser Pro", desc: "Anonymat avancé, nœuds multiples", rarity: "rare" },
        { id: "cafe_x5", name: "Cafés (x5)", desc: "Redonnent de l'énergie", rarity: "common" },
        { id: "zero_day", name: "Zero-Day (inconnu)", desc: "Une faille inédite, très précieuse", rarity: "epic" },
        { id: "exploit_kit", name: "Exploit Kit", desc: "Collection de failles connues", rarity: "rare" },
        { id: "rootkit", name: "Rootkit custom", desc: "Accès persistant sur une cible", rarity: "epic" },
        { id: "keylogger", name: "Keylogger hardware", desc: "Petit device physique, indétectable", rarity: "rare" },
        { id: "proxy_chain", name: "Proxy Chain", desc: "5 sauts de proxy, quasi-tracable", rarity: "rare" },
        { id: "flash_drive", name: "Clé USB armée", desc: "Payload Rubber Ducky", rarity: "rare" },
        { id: "sim_card", name: "SIM prepaid", desc: "Numéro jetable, non traçable", rarity: "common" },
        { id: "server_bot", name: "Botnet (10 zombies)", desc: "10 machines compromises pour attaques DDoS", rarity: "epic" },
        { id: "ledger", name: "Ledger Nano", desc: "Wallet crypto matériel", rarity: "rare" },
        { id: "drone_recon", name: "Drone de recon", desc: "Mini drone pour surveillance physique", rarity: "legendary" },
        { id: "ai_tool", name: "Outil IA offensif", desc: "Générateur de phishing automatisé", rarity: "legendary" },
        { id: "radio_sdr", name: "HackRF One", desc: "Software Defined Radio, pour sniffing GSM", rarity: "legendary" }
    ],

    contacts: {
        shadow: {
            name: "Shadow",
            role: "Hacker anonymous",
            avatar: "?",
            personality: "mystérieux",
            startRelation: 30
        },
        nova: {
            name: "Nova",
            role: "Experte en crypto",
            avatar: "N",
            personality: "brillante mais parano",
            startRelation: 20
        },
        blade: {
            name: "Blade",
            role: "Pentester freelance",
            avatar: "B",
            personality: "arrogant mais loyal",
            startRelation: 15
        },
        ghost: {
            name: "Ghost",
            role: "Ancien du FBI cyber",
            avatar: "G",
            personality: "calme, manipulateur",
            startRelation: 0
        },
        viper: {
            name: "Viper",
            role: "Cracker russe",
            avatar: "V",
            personality: "dangereux, imprévisible",
            startRelation: 0
        },
        echo: {
            name: "Echo",
            role: "Journaliste investigative",
            avatar: "E",
            personality: "idéaliste, courageuse",
            startRelation: 10
        },
        zen: {
            name: "Zen",
            role: "Sysadmin parano",
            avatar: "Z",
            personality: "méfiant, très compétent",
            startRelation: 5
        }
    },

    newsPool: [
        "🔒 Apple corrige une faille critique dans iOS — des millions d'appareils encore vulnérables",
        "📰 Un groupe Anonymous dévoile des documents classifiés du gouvernement",
        "💰 Bitcoin atteint un nouveau sommet à 120 000$",
        "🏛️ Le Parlement vote une nouvelle loi sur la surveillance numérique",
        "🕵️ La NSA admet avoir espionné des alliés européens",
        "🔓 Une fuite massive touche 50 millions d'utilisateurs d'une appli dating",
        "💻 Le ransomware 'Phantom' paralyse des hôpitaux en Europe",
        "🌐 Starlink signale des perturbations suspectes en Asie du Sud-Est",
        "📱 Samsung bloque le root sur ses derniers appareils",
        "⚖️ Un hacker éthique condamné à 5 ans pour avoir testé une faille sans autorisation",
        "🎮 Valve supprime un jeu crypto-frauduleux de Steam",
        "🔍 Europol démantèle un réseau de darknet — 40 arrestations",
        "📡 Une attaque BGP redirige le trafic européen vers la Russie pendant 12 minutes",
        "🕵️‍♂️ Le Pentagone recrute massivement des hackers éthiques — salaires à 250k$",
        "💼 Le marché noir des zero-days explose — une faille iOS vaut 2,5M$",
        "🌍 Une cyberattaque cible le réseau électrique ukrainien"
    ],

    locations: [
        { id: "chambre", name: "Ta chambre", safe: true },
        { id: "cafe", name: "Café wifi", safe: true },
        { id: "fablab", name: "Fablab local", safe: true },
        { id: "hackerspace", name: "Hackerspace", safe: true },
        { id: "datacenter", name: "Datacenter", safe: false },
        { id: "bureau_entreprise", name: "Bureau d'entreprise", safe: false },
        { id: "boite_nuit", name: "Boîte de nuit VIP", safe: false },
        { id: "banque", name: "Banque (physique)", safe: false }
    ]
};
