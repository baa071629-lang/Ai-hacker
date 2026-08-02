const GAME_DATA = {
    VERSION: 2,

    origins: {
        dev: {
            name: "Développeur freelance",
            desc: "5 ans de missions client, mais la routine te tue. La nuit, tu explores des failles.",
            bonuses: { tech: 15, social: 5, risk: 0 },
            startSkills: ["python", "linux"],
            startItems: ["phone", "laptop_perso", "vpn_1mois"]
        },
        student: {
            name: "Étudiant en info",
            desc: "L3 informatique, passionné mais sans expérience. Tu apprends vite, trop vite.",
            bonuses: { tech: 8, social: 10, risk: 0 },
            startSkills: ["python", "linux"],
            startItems: ["phone", "laptop_perso", "cafe_x5"]
        },
        gamer: {
            name: "Gamer professionnel",
            desc: "Le rank push t'a appris la stratégie et la rapidité. Le réseau en plus.",
            bonuses: { tech: 5, social: 12, risk: 0 },
            startSkills: ["reseaux", "social_engineering"],
            startItems: ["phone", "pc_gaming", "vpn_1mois"]
        },
        fixer: {
            name: "Dépanneur informatique",
            desc: "Tu connais les failles des PME parce que tu les répares... ou tu les crées.",
            bonuses: { tech: 10, social: 8, risk: 0 },
            startSkills: ["windows", "reseaux"],
            startItems: ["phone", "kit_outils", "acces_pme"]
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
        pentest: { name: "Pentest", maxLevel: 100, category: "offensive" },
        malware: { name: "Malware Dev", maxLevel: 100, category: "offensive" },
        mobile_hacking: { name: "Mobile Hacking", maxLevel: 100, category: "web" },
        cloud: { name: "Cloud Security", maxLevel: 100, category: "infra" },
        hardware: { name: "Hardware/HackRF", maxLevel: 100, category: "system" },
        osint: { name: "OSINT", maxLevel: 100, category: "social" },
        ia: { name: "IA / Prompt Injection", maxLevel: 100, category: "web" }
    },

    items: [
        { id: "phone", name: "Téléphone", desc: "Ton téléphone — messages, notifications, contacts. Toujours dans ta poche.", rarity: "common", value: 0, effect: {}, type: "phone" },
        { id: "laptop_perso", name: "Laptop perso", desc: "PC moyen, suffisant pour débuter", rarity: "common", value: 0, effect: { skill: "python", bonus: 0 }, type: "gear" },
        { id: "pc_gaming", name: "PC Gaming", desc: "Puissant — +5 Exploitation, +5 Malware", rarity: "common", value: 400, effect: { skills: { exploits: 5, malware: 5 } }, type: "gear" },
        { id: "kit_outils", name: "Kit d'outils", desc: "Clés USB armées, adaptateurs — utile sur le terrain", rarity: "common", value: 120, effect: { skills: { hardware: 3 } }, type: "gear" },
        { id: "acces_pme", name: "Accès PME locale", desc: "Des identifiants dormants dans une PME", rarity: "common", value: 0, effect: {}, type: "data" },
        { id: "vpn_1mois", name: "VPN 1 mois", desc: "Protège ton IP pendant 30 jours — réduit le heat", rarity: "common", value: 50, effect: { heat: -10 }, type: "consumable" },
        { id: "vpn_1an", name: "VPN 1 an", desc: "Couverture complète 12 mois — réduit le heat fortement", rarity: "rare", value: 400, effect: { heat: -35 }, type: "consumable" },
        { id: "tor_browser", name: "Tor Pro", desc: "3 nœuds de relais — +15 Anonymat", rarity: "rare", value: 600, effect: { skills: { anonymat: 15 } }, type: "gear" },
        { id: "cafe_x5", name: "Cafés (x5)", desc: "Redonnent 20 d'énergie", rarity: "common", value: 30, effect: { energy: 20 }, type: "consumable" },
        { id: "exploit_kit", name: "Exploit Kit", desc: "Collection de failles — +10 Exploitation", rarity: "rare", value: 800, effect: { skills: { exploits: 10 } }, type: "gear" },
        { id: "rootkit", name: "Rootkit custom", desc: "Accès persistant — +10 Furtivité", rarity: "epic", value: 2000, effect: { skills: { stealth: 10 } }, type: "gear" },
        { id: "keylogger", name: "Keylogger HW", desc: "Petit device physique — +10 OSINT", rarity: "rare", value: 900, effect: { skills: { osint: 10 } }, type: "gear" },
        { id: "proxy_chain", name: "Proxy Chain", desc: "5 sauts de proxy — +10 Anonymat", rarity: "rare", value: 700, effect: { skills: { anonymat: 10 } }, type: "gear" },
        { id: "flash_drive", name: "Rubber Ducky", desc: "Payload USB auto — +10 Hardware", rarity: "rare", value: 500, effect: { skills: { hardware: 10 } }, type: "gear" },
        { id: "sim_card", name: "SIM prepaid", desc: "Numéro jetable — +5 Anonymat", rarity: "common", value: 40, effect: { skills: { anonymat: 5 } }, type: "consumable" },
        { id: "server_bot", name: "Botnet (10 zombies)", desc: "Pour DDoS ou relais — +10 Stealth", rarity: "epic", value: 2500, effect: { skills: { stealth: 10, reseaux: 10 } }, type: "gear" },
        { id: "ledger", name: "Ledger Nano", desc: "Wallet crypto matériel — sécurise ton cash", rarity: "rare", value: 150, effect: { money_mult: 0.1 }, type: "gear" },
        { id: "drone_recon", name: "Drone de recon", desc: "Mini drone — +15 Hardware, recon physique", rarity: "legendary", value: 5000, effect: { skills: { hardware: 15, osint: 10 } }, type: "gear" },
        { id: "ai_tool", name: "Outil IA offensif", desc: "Génère des payloads de phishing — +15 Social Eng.", rarity: "legendary", value: 8000, effect: { skills: { social_engineering: 15, ia: 15 } }, type: "gear" },
        { id: "radio_sdr", name: "HackRF One", desc: "Software Defined Radio — +20 Hardware, sniff GSM", rarity: "legendary", value: 6500, effect: { skills: { hardware: 20 } }, type: "gear" }
    ],

    shop: [
        { itemId: "vpn_1mois", price: 50, min: 1 },
        { itemId: "vpn_1an", price: 400, min: 1 },
        { itemId: "cafe_x5", price: 30, min: 1 },
        { itemId: "sim_card", price: 40, min: 1 },
        { itemId: "tor_browser", price: 600, min: 2 },
        { itemId: "kit_outils", price: 120, min: 1 },
        { itemId: "pc_gaming", price: 400, min: 3 },
        { itemId: "proxy_chain", price: 700, min: 3 },
        { itemId: "exploit_kit", price: 800, min: 4 },
        { itemId: "flash_drive", price: 500, min: 3 },
        { itemId: "keylogger", price: 900, min: 4 },
        { itemId: "rootkit", price: 2000, min: 5 },
        { itemId: "server_bot", price: 2500, min: 6 },
        { itemId: "ledger", price: 150, min: 1 },
        { itemId: "drone_recon", price: 5000, min: 8 },
        { itemId: "ai_tool", price: 8000, min: 9 },
        { itemId: "radio_sdr", price: 6500, min: 8 }
    ],

    contacts: {
        shadow: { name: "Shadow", role: "Mentor du Forum des Ombres", personality: "Caché, prudent, exigeant.", avatar: "👤" },
        viper: { name: "Viper", role: "Fixer du darknet", personality: "Sans pitié, toujours pragmatique.", avatar: "🐍" },
        zen: { name: "Zen", role: "Sysadmin paranoïaque", personality: "Calme, loyal, obsédé par la sécurité.", avatar: "🧘" },
        doc: { name: "Doc", role: "Vendeur d'outils hardware", personality: "Bavard, gentil, un peu flippant.", avatar: "🔧" },
        rouge: { name: "La Rouge", role: "Trader de données volées", personality: "Froide, précise, méfiante.", avatar: "🔴" },
        mika: { name: "Mika", role: "Journaliste tech", personality: "Curieuse, idéaliste, bien connectée.", avatar: "📰" },
        fox: { name: "Le Renard", role: "Intermédiaire anonyme", personality: "Insaisissable, fourbe, très cher.", avatar: "🦊" }
    },

    rivalNames: ["N0va_Cr4ck", "ZeroCool", "W1reD0g", "Mr_StealYoData", "K3rn3l_P4nic", "ByteBandit", "SysAdminNoir", "Ph4nt0m_Traff1c", "R00tK1t_K!ng", "L1nux_L3gend", "Sp4m_M4ster", "0xDeadB33f"],

    achievements: [
        { id: "first_hack", name: "Premier sang", desc: "Réaliser ton premier hack", icon: "🔑" },
        { id: "pentester", name: "Pentester", desc: "Réussir 10 missions", icon: "🛡️" },
        { id: "rich", name: "À la barbe des banques", desc: "Posséder 10 000$", icon: "💰" },
        { id: "legend", name: "Légende du darknet", desc: "Atteindre 50 de réputation", icon: "👑" },
        { id: "ghost", name: "Le Fantôme", desc: "Hacker 20 fois sans jamais te faire prendre", icon: "👻" },
        { id: "caught_once", name: "Brûlé mais pas cuit", desc: "Subir une perquisition et survivre", icon: "🔥" },
        { id: "social_butterfly", name: "Papillon social", desc: "Rencontrer tous les contacts", icon: "🦋" },
        { id: "whale", name: "Grosse prise", desc: "Réussir une mission très difficile", icon: "🐋" },
        { id: "streak_7", name: "Assidu", desc: "7 jours de connexion consécutifs", icon: "📅" },
        { id: "zero_day", name: "Zero-Day Hunter", desc: "Trouver une faille zero-day", icon: "💥" },
        { id: "untouchable", name: "Intouchable", desc: "Terminer le jeu avec un heat bas", icon: "❄️" },
        { id: "fallen", name: "La chute", desc: "Se faire arrêter", icon: "⛓️" }
    ],

    rivals: [
        { name: "N0va_Cr4ck", rep: 12, style: "bruteforce" },
        { name: "ZeroCool", rep: 30, style: "social" },
        { name: "W1reD0g", rep: 45, style: "malware" },
        { name: "Mr_StealYoData", rep: 20, style: "data" },
        { name: "K3rn3l_P4nic", rep: 55, style: "exploit" },
        { name: "ByteBandit", rep: 8, style: "bruteforce" },
        { name: "SysAdminNoir", rep: 25, style: "social" },
        { name: "Ph4nt0m_Traff1c", rep: 60, style: "data" },
        { name: "R00tK1t_K!ng", rep: 40, style: "malware" },
        { name: "L1nux_L3gend", rep: 35, style: "exploit" },
        { name: "Sp4m_M4ster", rep: 5, style: "data" },
        { name: "0xDeadB33f", rep: 50, style: "bruteforce" }
    ],

    newsPool: [
        "🔒 Apple corrige une faille critique dans iOS — des millions d'appareils encore vulnérables",
        "📰 Un groupe Anonymous dévoile des documents classifiés du gouvernement",
        "💰 Bitcoin atteint un nouveau sommet à 120 000$",
        "🏛️ Le Parlement vote une nouvelle loi sur la surveillance numérique",
        "🕵️ La NSA admet avoir espionné des alliés européens",
        "🔓 Une fuite massive touche 50 millions d'utilisateurs d'une appli dating",
        "💻 Le ransomware 'Phantom' paralyse des hôpitaux en Europe",
        "📱 Samsung bloque le root sur ses derniers appareils",
        "⚖️ Un hacker éthique condamné à 5 ans pour avoir testé une faille sans autorisation",
        "🎮 Valve supprime un jeu crypto-frauduleux de Steam",
        "🔍 Europol démantèle un réseau de darknet — 40 arrestations",
        "📡 Une attaque BGP redirige le trafic européen vers la Russie pendant 12 minutes",
        "🕵️‍♂️ Le Pentagone recrute massivement des hackers éthiques — salaires à 250k$",
        "💼 Le marché noir des zero-days explose — une faille iOS vaut 2,5M$",
        "🌍 Une cyberattaque cible le réseau électrique ukrainien",
        "🏦 Un groupe inconnu pirate une banque suisse — 200M$ évaporés",
        "🧑‍💻 Un développeur français arrêté pour avoir vendu des données de patients",
        "📶 Une faille WiFi géante découverte dans les routeurs domestiques",
        "🚀 Une start-up IA admet avoir entraîné ses modèles sur des données volées",
        "🔐 Un ex-employé de Twitter condamné pour espionnage",
        "🕹️ Un serveur de jeu piraté — les sauvegardes de millions de joueurs effacées",
        "📉 Le cours du Bitcoin chute après un hack d'échange — panique sur le marché",
        "👮 La DGSI lance une cellule spécialisée 'Cybercrime Junior'",
        "📊 Une étude révèle : 78% des PME françaises sont vulnérables aux attaques",
        "⚡ Un blackout numérique frappe Lisbonne — revendiqué par un groupe anonyme"
    ],

    worldEvents: [
        { day: 3, text: "🌐 Un groupe de hackers russes revendique une attaque sur 3 banques européennes" },
        { day: 7, text: "🔍 Interpol lance une opération mondiale contre les ransomwares" },
        { day: 12, text: "💻 Microsoft publie un patch d'urgence pour une faille zero-day" },
        { day: 18, text: "🕵️ Un ancien agent de la NSA publie ses mémoires" },
        { day: 25, text: "📡 Une faille dans les routeurs WiFi de Xiaomi exposée" },
        { day: 32, text: "🏦 Un hack massif touche les distributeurs automatiques en France" },
        { day: 40, text: "🔓 Des données médicales de 100 000 patients fuitées en ligne" },
        { day: 48, text: "⚖️ Le Parlement européen durcit les peines pour cybercriminalité" },
        { day: 55, text: "📱 Des chercheurs découvrent une faille dans les puces Qualcomm" },
        { day: 65, text: "💰 Le darknet atteint un record de transactions en 24h" }
    ],

    heatEvents: [
        { threshold: 30, text: "🚨 Une unité de cybersécurité te signale — tu as été repéré par un bot de surveillance" },
        { threshold: 50, text: "🔍 Un agent du FBI a ouvert un dossier sur un hacker actif dans ta région" },
        { threshold: 70, text: "🕵️ Tu es désormais sur une liste de surveillance. La police surveille tes connexions" },
        { threshold: 90, text: "⛓️ PERQUISITION — Ils ont identifié ta ville. Ils peuvent frapper à tout moment" }
    ],

    minigames: {
        bruteforce: {
            name: "BRUTE-FORCE",
            desc: "Casse le hash MD5 en testant des combinaisons. Trouve le bon symbole à chaque position.",
            difficulty: { easy: 3, medium: 4, hard: 5 }
        },
        sequence: {
            name: "SÉQUENCE DE MÉMOIRE",
            desc: "Mémorise la séquence de commandes puis reproduis-la dans l'ordre.",
            difficulty: { easy: 3, medium: 4, hard: 5 }
        },
        timing: {
            name: "INTERCEPTION DE PAQUET",
            desc: "Appuie au bon moment pour intercepter le paquet réseau dans la zone cible.",
            difficulty: { easy: 5, medium: 6, hard: 7 }
        },
        osint: {
            name: "OSINT",
            desc: "À partir des indices publics, déduis le mot de passe le plus probable.",
            difficulty: { easy: 1, medium: 1, hard: 1 }
        },
        evasion: {
            name: "ÉVASION",
            desc: "Choisis la bonne route pour échapper à la traçabilité avant la fin du compte à rebours.",
            difficulty: { easy: 3, medium: 4, hard: 5 }
        }
    }
};
