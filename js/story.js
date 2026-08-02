const STORY = {
    prologue: [
        { type: "text", content: "Tu es assis devant ton écran. 2h37 du matin." },
        { type: "text", content: "Le ventilateur de ton PC ronronne. Une canette de Red Bull à moitié vide. Un terminal ouvert." },
        { type: "text", content: "Tu n'as pas dormi. Pas parce que tu travailles. Parce que tu <em>cherches</em>." },
        { type: "divider" },
        { type: "text", content: "Il y a 3 mois, tu as découvert un article sur un forum : <strong>\"Comment j'ai gagné 50 000€ en vendant des failles\"</strong>. Depuis, tu ne dors plus pareil." },
        { type: "text", content: "Ce soir, tu as trouvé quelque chose. Un petit site d'une PME locale. Un formulaire de contact sans validation. Un champ de recherche SQL injectable." },
        { type: "text", content: "Tu connais la théorie. Tu as lu les tutos. Mais là... c'est <em>vraiment</em> là." },
        { type: "divider" },
        { type: "action", content: "Ta main tremble au-dessus du clavier." },
        { type: "text", content: "Tu regardes autour de toi. Personne. Juste toi et l'écran." },
        { type: "text", content: "Le formulaire d'erreur dit : <span class='danger'>\"Erreur 500 — Contactez l'administrateur\"</span>" },
        { type: "text", content: "L'administrateur. C'est toi. Demain matin. Au bureau." }
    ],

    firstHack: {
        dev: [
            { type: "text", content: "Tu connais ce CMS. Tu l'as installé pour 3 clients déjà. Tu sais exactement où chercher." },
            { type: "action", content: "Tu tapes : <span class='danger'>' OR 1=1--</span>" },
            { type: "action", content: "La page se charge. La base de données te sourit." },
            { type: "text", content: "Des noms. Des emails. Des mots de passe hashés. Des factures." },
            { type: "text", content: "Tu n'as rien volé. Tu as juste <em>regardé</em>. Mais maintenant tu sais que c'est possible." }
        ],
        student: [
            { type: "text", content: "Tu as fait un CTF la semaine dernière. Tu te souviens de la syntaxe." },
            { type: "action", content: "Tu tapes : <span class='danger'>' OR 1=1--</span>" },
            { type: "text", content: "Ça marche. Tu n'en reviens pas." },
            { type: "text", content: "Des noms. Des emails. Des mots de passe. Tu commences à comprendre l'ampleur de ce que tu viens de faire." }
        ],
        gamer: [
            { type: "text", content: "En tant que gamer, tu connais les cheats. Les scripts. L'injection de code." },
            { type: "action", content: "Tu essaies une injection SQL basique. <span class='danger'>' OR 1=1--</span>" },
            { type: "text", content: "La page plante. Puis elle affiche tout." },
            { type: "text", content: "Des données sensibles. Des comptes admin. Tu es dans le labyrinthe." }
        ],
        fixer: [
            { type: "text", content: "Tu as dépanné cette boîte il y a 2 semaines. Tu connais le mot de passe admin. Mais là, tu ne l'utilises pas." },
            { type: "action", content: "Tu testes une injection SQL. <span class='danger'>' OR 1=1--</span>" },
            { type: "text", content: "Ça marche. Les données coulent." },
            { type: "text", content: "Tu aurais pu utiliser le mot de passe admin. Mais là, tu as prouvé quelque chose à toi-même." }
        ]
    },

    earlyEvents: [
        {
            id: "first_contact",
            trigger: { rep: 5 },
            text: [
                { type: "action", content: "Un message apparaît sur ton terminal. Encodé en base64." },
                { type: "action", content: "Tu le décodes : <span class='speaker'>[ANONYME]</span> \"J'ai vu ce que tu as fait avec le site de la PME. Pas mal pour un débutant. Tu veux apprendre ?\"" },
                { type: "text", content: "L'adresse IP est masquée. Derrière 7 proxys. Tu ne peux pas tracer." },
                { type: "text", content: "C'est probablement une arnaque. Ou un piège. Ou... une opportunité." }
            ],
            choices: [
                { text: "Répondre \"Qui es-tu ?\"", effects: { contact_shadow: 20, rep: 3 }, next: "shadow_intro" },
                { text: "Ignorer et fermer le terminal", effects: { rep: 1 }, next: null },
                { text: " tracer l'IP (traceroute avancé)", effects: { tech: 5, risk: 10 }, next: "trace_fail" }
            ]
        },
        {
            id: "shadow_intro",
            text: [
                { type: "speaker", content: "Shadow" },
                { type: "text", content: "\"Je m'appelle Shadow. Ou du moins, c'est ce que les gens m'appellent.\"" },
                { type: "speaker", content: "Shadow" },
                { type: "text", content: "\"Tu as du talent brut. Mais tu es dangereux. Tu laisses des traces partout.\"" },
                { type: "speaker", content: "Shadow" },
                { type: "text", content: "\"Si tu veux survivre dans ce milieu, il faut apprendre les règles.\"" }
            ],
            choices: [
                { text: "\"Enseigne-moi.\"", effects: { contact_shadow: 10, tech: 3 }, next: "shadow_mentor" },
                { text: "\"Je n'ai pas besoin d'aide.\"", effects: { rep: 5, risk: 5 }, next: "shadow_reject" }
            ]
        },
        {
            id: "shadow_mentor",
            text: [
                { type: "action", content: "Shadow t'envoie un lien Tor. Un forum privé. 47 membres actifs." },
                { type: "speaker", content: "Shadow" },
                { type: "text", content: "\"Bienvenue sur le Forum. Ici, on partage des connaissances. Pas des exploits. Pas encore.\"" },
                { type: "system", content: "Tu débloques le Forum des Ombres. Nouveaux contacts disponibles." },
                { type: "system", content: "Compétence \"Anonymat\" débloquée." }
            ],
            choices: [
                { text: "Explorer le forum", effects: { rep: 5, skill_anonymat: 15 }, next: "forum_intro" }
            ]
        },
        {
            id: "shadow_reject",
            text: [
                { type: "speaker", content: "Shadow" },
                { type: "text", content: "\"D'accord. Mais quand la police te frappera à la porte, ne dis pas que je ne t'avais pas prévenu.\"" },
                { type: "action", content: "La connexion se coupe. Définitivement." },
                { type: "system", content: "Tu as perdu Shadow comme contact." }
            ],
            choices: [
                { text: "Continuer seul", effects: {}, next: null }
            ]
        },
        {
            id: "trace_fail",
            text: [
                { type: "action", content: "Tu lances un traceroute. Le paquet traverse 7 pays. Puis..." },
                { type: "danger", content: "Une alerte s'affiche sur ton écran." },
                { type: "system", content: "\"WARNING: Your IP has been logged by [REDACTED]. We know where you live.\"" },
                { type: "text", content: "Tu as fait une erreur. Une grande erreur." },
                { type: "system", content: "Risque +15. La police pourrait te trouver." }
            ],
            choices: [
                { text: "Paniquer et débrancher le PC", effects: { risk: -5 }, next: null },
                { text: "Essayer de masquer l'IP maintenant", effects: { tech: 3, risk: 5 }, next: null }
            ]
        },
        {
            id: "forum_intro",
            text: [
                { type: "action", content: "Le forum est minimaliste. Fond noir. Texte vert. Comme une console." },
                { type: "text", content: "Des threads : \"Tutoriels SQLi\", \"Evasion d'antivirus\", \"OSINT pour débutants\"." },
                { type: "text", content: "Un thread pinclé : <strong>\"Règle n°1 : Ne jamais hack pour le plaisir. Hack pour apprendre.\"</strong>" },
                { type: "text", content: "Tu scrolles. Tu vois des noms. Des skills. Des réputations." },
                { type: "text", content: "Et tu vois un thread qui pulse : <span class='danger'>\"RECUTEMENT : Opération Phantom — 50 BTC\"</span>" }
            ],
            choices: [
                { text: "Lire le thread Phantom", effects: { rep: 3, risk: 5 }, next: "phantom_offer" },
                { text: "Rester dans les tutoriels", effects: { skill_web_hacking: 10 }, next: "safe_learning" },
                { text: "Quitter le forum", effects: { rep: 2 }, next: null }
            ]
        },
        {
            id: "phantom_offer",
            text: [
                { type: "action", content: "Le post est chiffré. Tu le déchiffres en 10 minutes." },
                { type: "text", content: "\"On cherche quelqu'un pour pénétrer le réseau d'une banque. Pas pour voler. Pour prouver que c'est possible.\"" },
                { type: "text", content: "\"50 BTC si tu réussis. Pas de violence. Pas de vol. Juste un proof of concept.\"" },
                { type: "danger", content: "C'est illegal. Même si tu ne vols rien." },
                { type: "text", content: "50 BTC. À ce taux, ça fait plus de 3 millions d'euros." }
            ],
            choices: [
                { text: "Rejoindre l'opération", effects: { rep: 10, risk: 20, money: 0 }, next: "phantom_join" },
                { text: "Refuser et signaler le post", effects: { rep: -5, risk: 5 }, next: "phantom_refuse" },
                { text: "Doubler la mise : \"Je veux 100 BTC\"", effects: { rep: 8, risk: 15 }, next: "phantom_negotiate" }
            ]
        }
    ],

    monthEvents: [
        {
            id: "police_knock",
            trigger: { risk: 30, month: 3 },
            text: [
                { type: "action", content: "3h du matin. Un coup à la porte." },
                { type: "text", content: "Tu te figes. Personne ne vient à 3h. Personne." },
                { type: "action", content: "Un autre coup. Plus fort." },
                { type: "speaker", content: "??" },
                { type: "text", content: "\"Police. Ouvrez.\"" },
                { type: "text", content: "Ton cœur s'emballé. Tu as 3 secondes pour décider." }
            ],
            choices: [
                { text: "Ouvrir la porte calmement", effects: { risk: 10 }, next: "police_calm" },
                { text: "Fuir par la fenêtre", effects: { risk: 25, rep: 5 }, next: "police_flee" },
                { text: "Détruire le disque dur (shred)", effects: { risk: 15, tech: 5 }, next: "police_destroy" }
            ]
        },
        {
            id: "rival_offer",
            trigger: { rep: 20, month: 4 },
            text: [
                { type: "action", content: "Un email chiffré. De Viper." },
                { type: "speaker", content: "Viper" },
                { type: "text", content: "\"Tu gagnes bien ta vie. Mais tu pourrais gagner plus.\"" },
                { type: "speaker", content: "Viper" },
                { type: "text", content: "\"J'ai un job. 200 BTC. C'est du vrai travail. Pas des conneries de script kiddie.\"" }
            ],
            choices: [
                { text: "\"De quel genre de travail ?\"", effects: { contact_viper: 20, risk: 10 }, next: "viper_job" },
                { text: "Ignorer", effects: { rep: 3 }, next: null },
                { text: "Signaler à Shadow", effects: { contact_shadow: 10, rep: 5 }, next: "shadow_warning_viper" }
            ]
        }
    ],

    endings: {
        white_hat: {
            title: "LE GARDIEN",
            text: "Tu es devenu un expert en cybersécurité reconnu. Les entreprises te paient pour tester leurs systèmes. Tu sauves des vies en trouvant des failles avant les criminels. Tu as choisi le bon chemin."
        },
        gray_hat: {
            title: "L'OMBRE",
            text: "Tu vis dans la-zone grise. Parfois tu aides, parfois tu profites. Personne ne sait vraiment qui tu es. Tu es libre, mais tu ne seras jamais en sécurité."
        },
        black_hat: {
            title: "LE FANTÔME",
            text: "Tu es devenu une légende. Et un fantôme. La police te cherche sur 4 continents. Tu vis dans des pays sans extradition. Tu as tout l'argent du monde, mais plus de visage."
        },
        burnout: {
            title: "LE BRÛLÉ",
            text: "Tu as fait trop. Trop vite. Trop loin. Tu as tout perdu. Ton travail, tes amis, ta santé. Tu as arrêté. Parfois, la meilleure victoire, c'est de s'arrêter."
        },
        caught: {
            title: "PRISONNIER",
            text: "Ils t'ont trouvé. Les agents du FBI. Interpol. La DGSI. Peu importe. Tu as passé 7 ans en prison. Mais tu sors bientôt. Et tu sais des choses qu'ils ne savent pas."
        },
        legend: {
            title: "LA LÉGENDE",
            text: "Tu es devenu ce que tout le monde voulait être. Une légende du hacking. Anonymous te respecte. Les gouvernements te craignent. Les hackers te citent. Tu as trouvé l'équilibre parfait."
        }
    }
};
