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
                { type: "text", content: "Et tu vois un thread qui pulse : <span class='danger'>\"RECRUTEMENT : Opération Phantom — 50 BTC\"</span>" }
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
        },
        {
            id: "first_big_heist",
            chapter: 2,
            trigger: { missions: 4 },
            text: [
                { type: "action", content: "Un fixer te contacte. La grosse espèce : une boîte de logistique laisse traîner 40 000 mots de passe en clair." },
                { type: "text", content: "\"20% pour toi. Le reste pour le client. Pas de questions.\"" },
                { type: "text", content: "Tu peux prendre les données et les vendre. Ou tout effacer. Ou les fuiter aux journalistes." }
            ],
            choices: [
                { text: "Vendre les données (le gros lot)", effects: { money: 4000, rep: 6, heat: 12 }, next: "heist_sold" },
                { text: "Tout effacer (propre)", effects: { rep: 4, heat: 3 }, next: "heist_clean" },
                { text: "Fuirter aux médias", effects: { rep: 8, heat: 15, money: 500 }, next: "heist_leaked" }
            ]
        },
        {
            id: "phantom_op",
            chapter: 3,
            trigger: { missions: 8 },
            text: [
                { type: "action", content: "LA NUIT DU PHANTOM" },
                { type: "text", content: "23h47. Le réseau de la banque s'étend devant toi. Une forteresse numérique : 3 pare-feu, 2 IDS, des milliers de capteurs." },
                { type: "text", content: "Mais tu connais la faille. La vraie. Celle que le plan t'a donnée." },
                { type: "text", content: "Tu es à l'intérieur. Les 50 BTC sont à portée de main. La preuve aussi. Tout est possible." },
                { type: "danger", content: "Chaque seconde compte. Le SOC de la banque détecte déjà une anomalie." }
            ],
            choices: [
                { text: "Installer la preuve et sortir (propre)", effects: { rep: 10, risk: 10 }, next: "phantom_pure" },
                { text: "Prendre 5% au passage (personne ne verra)", effects: { money: 2500, rep: 5, risk: 18 }, next: "phantom_gray" },
                { text: "Tout siphonner et disparaître", effects: { money: 15000, rep: 15, risk: 35, heat: 25 }, next: "phantom_black" }
            ]
        },
        {
            id: "betrayal",
            chapter: 3,
            trigger: { rep: 30 },
            text: [
                { type: "action", content: "48h après Phantom, le forum s'agite. Un message codé circule : \"Quelqu'un a parlé. La DGSI sait tout.\"" },
                { type: "text", content: "Shadow se tait. Viper se cache. Le Comptable a disparu." },
                { type: "danger", content: "Et toi, tu viens de voir une voiture noire garée en bas de chez toi. Pour la deuxième fois aujourd'hui." }
            ],
            choices: [
                { text: "Accuser Shadow", effects: { contact_shadow: -30, rep: -5 }, next: "accuse_shadow" },
                { text: "Accuser Viper", effects: { contact_viper: -30, risk: 5 }, next: "accuse_viper" },
                { text: "Enquêter toi-même sur les traces", effects: { tech: 8, risk: 10 }, next: "investigate_mole" }
            ]
        },
        {
            id: "the_mole",
            chapter: 4,
            trigger: { heat: 45 },
            text: [
                { type: "action", content: "Le compte fantôme se connecte. Tu le sais parce que tu l'attendais. Il est là, maintenant." },
                { type: "text", content: "Trois personnes pouvaient connaître l'heure exacte de la descente. Trois." },
                { type: "text", content: "Doc, le vendeur d'outils. La Rouge, la trader de données. Le Renard, l'intermédiaire." }
            ],
            choices: [
                { text: "Confronter Doc", effects: { contact_doc: -20 }, next: "mole_doc" },
                { text: "Confronter La Rouge", effects: { contact_rouge: -20 }, next: "mole_rouge" },
                { text: "Confronter Le Renard", effects: { contact_fox: -20 }, next: "mole_fox" }
            ]
        },
        {
            id: "final_choice",
            chapter: 5,
            trigger: { missions: 15 },
            text: [
                { type: "action", content: "LES TROIS PORTES" },
                { type: "text", content: "La police, le milieu, ta propre conscience : tout converge vers un choix. Il n'y a plus de demi-mesure." },
                { type: "text", content: "Trois portes s'ouvrent. Une seule mène quelque part où tu pourras te regarder dans un miroir." }
            ],
            choices: [
                { text: "🚪 LA SORTIE — passer un accord avec la DGSI", effects: {}, next: "final_white" },
                { text: "🚪 L'OMBRE — prendre l'argent et disparaître", effects: {}, next: "final_gray" },
                { text: "🚪 LE TOUT POUR LE TOUT — le dernier gros coup", effects: {}, next: "final_black" }
            ]
        }
    ],

    monthEvents: [
        {
            id: "police_knock",
            chapter: 4,
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
            chapter: 2,
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

    chapters: {
        1: { title: "ACTE I — L'ÉVEIL", goal: "Survis. Apprends. Quelqu'un t'a vu sur le site de la PME." },
        2: { title: "ACTE II — LA DESCENTE", goal: "Fais tes preuves. Une grosse opération se prépare sur le darknet." },
        3: { title: "ACTE III — LA CRISE", goal: "L'Opération Phantom approche. Choisis ton camp." },
        4: { title: "ACTE IV — LA TRAQUE", goal: "La police te cherche. Trouve la taupe avant qu'elle ne te livre." },
        5: { title: "ACTE V — LA RÉSOLUTION", goal: "Choisis ta sortie. Une dernière fois." }
    },

    chapterIntros: {
        2: [
            { type: "divider" },
            { type: "action", content: "ACTE II — LA DESCENTE" },
            { type: "text", content: "Le Forum des Ombres bourdonne. Des rumeurs de grosse opération circulent : quelqu'un prépare quelque chose de gros, et tout le monde veut une part." },
            { type: "text", content: "Ton nom commence à circuler. Pas seulement sur le forum. Ailleurs aussi." },
            { type: "system", content: "Objectif : faire tes preuves. Une opération majeure se prépare." }
        ],
        3: [
            { type: "divider" },
            { type: "action", content: "ACTE III — LA CRISE" },
            { type: "text", content: "Le jour de l'Opération Phantom approche. La rumeur devient réelle : le réseau d'une banque, un PoC, 50 BTC. Tout le milieu retient son souffle." },
            { type: "danger", content: "Mais tu n'es plus seul. Quelqu'un te suit. Tu sens les regards dans la rue, les voitures garées trop longtemps." },
            { type: "system", content: "Objectif : survivre à l'Opération Phantom. Choisis ton camp." }
        ],
        4: [
            { type: "divider" },
            { type: "action", content: "ACTE IV — LA TRAQUE" },
            { type: "text", content: "La DGSI a ouvert un dossier. Ton quartier est quadrillé. Le heat est partout, dans les journaux, dans tes rêves." },
            { type: "text", content: "Et il y a une taupe sur le forum. Quelqu'un vend du monde. Quelqu'un te vend, peut-être déjà." },
            { type: "system", content: "Objectif : identifier la taupe avant qu'elle ne te livre." }
        ],
        5: [
            { type: "divider" },
            { type: "action", content: "ACTE V — LA RÉSOLUTION" },
            { type: "text", content: "Tout converge. L'argent, la gloire, la peur. Le milieu ne pardonne pas la demi-mesure, et la loi non plus." },
            { type: "text", content: "Il est temps de choisir ta sortie. Une dernière fois." },
            { type: "system", content: "Objectif : choisir ta voie et t'y tenir." }
        ]
    },

    safe_learning: {
        text: [
            { type: "text", content: "Tu restes dans les tutoriels. SQLi, XSS, evasion AV. Tu dévores tout." },
            { type: "system", content: "Compétence Web Hacking +10. La théorie, c'est la moitié du jeu." },
            { type: "text", content: "Mais au fond de toi, le thread Phantom te brûle encore. 50 BTC. Tu y repenseras." }
        ],
        choices: [
            { text: "Reprendre le travail", effects: { skill_web_hacking: 10 }, next: null }
        ]
    },

    phantom_join: {
        text: [
            { type: "action", content: "Tu réponds au post. 3 minutes plus tard, un canal chiffré s'ouvre." },
            { type: "speaker", content: "??" },
            { type: "text", content: "\"Bienvenue à bord. Contacte Le Comptable. Il te donnera les détails.\"" },
            { type: "text", content: "Le Comptable. Encore un pseudonyme. Encore un inconnu." },
            { type: "system", content: "Tu es sur les rôles de l'Opération Phantom. Le risque est réel. La promesse : 50 BTC." }
        ],
        choices: [
            { text: "Préparer le terrain", effects: { skill_exploits: 5, money: -150 }, next: null },
            { text: "Continuer à bosser en attendant", effects: { rep: 3 }, next: null }
        ]
    },

    phantom_refuse: {
        text: [
            { type: "text", content: "Tu fermes le post. 50 BTC. Tu préfères rester en vie." },
            { type: "system", content: "Shadow avait raison : choisir, c'est survivre. Ta prudence te rend service." }
        ],
        choices: [
            { text: "Continuer sa route", effects: {}, next: null }
        ]
    },

    phantom_negotiate: {
        text: [
            { type: "action", content: "Tu réponds : \"100 BTC, ou je passe mon tour.\"" },
            { type: "action", content: "Silence. Puis une réponse glaciale." },
            { type: "speaker", content: "??" },
            { type: "text", content: "\"Tu as du culot. 70. Dernière offre.\"" },
            { type: "text", content: "Tu as doublé ta mise. Le milieu retiendra ton nom." },
            { type: "system", content: "L'Opération Phantom te considère désormais comme un acteur." }
        ],
        choices: [
            { text: "Accepter les 70 BTC", effects: { rep: 7, risk: 10 }, next: null }
        ]
    },

    viper_job: {
        text: [
            { type: "speaker", content: "Viper" },
            { type: "text", content: "\"Un transfert. 200 BTC. La cible : un fonds d'investissement qui blanchit de l'argent sale. Tu piges le réseau, tu ouvres une porte, tu sors. Moi je m'occupe du reste.\"" },
            { type: "text", content: "C'est du gros. Du très gros. Si ça pue, ça pue jusqu'au fond." },
            { type: "danger", content: "Mais Viper ne paie pas pour rien. Et 200 BTC, c'est une vie entière." }
        ],
        choices: [
            { text: "Accepter — \"Je suis partant.\"", effects: { rep: 8, risk: 15, money: 3000 }, next: "viper_accepted" },
            { text: "Refuser poliment", effects: { rep: -3 }, next: null },
            { text: "En parler à Shadow", effects: { contact_shadow: 10 }, next: "shadow_warning_viper" }
        ]
    },

    viper_accepted: {
        text: [
            { type: "text", content: "Trois jours plus tard, un colis arrive. Une clé USB blindée. Un fichier : les plans du réseau." },
            { type: "text", content: "Tu passes la semaine à cartographier la cible. Chaque nœud, chaque pare-feu, chaque faille." },
            { type: "system", content: "Tu as appris plus en une semaine que dans toute ta carrière." }
        ],
        choices: [
            { text: "Continuer", effects: { skill_reseaux: 10, heat: 5 }, next: null }
        ]
    },

    shadow_warning_viper: {
        text: [
            { type: "speaker", content: "Shadow" },
            { type: "text", content: "\"Viper vendrait sa mère pour un fichier. Si tu bosses pour lui, tu bosses pour personne.\"" },
            { type: "system", content: "Shadow t'a mis en garde. Viper t'en voudra peut-être." }
        ],
        choices: [
            { text: "Noter le conseil", effects: {}, next: null }
        ]
    },

    heist_sold: {
        text: [
            { type: "system", content: "Le client est satisfait. Mais des boîtes entières de données volées circulent maintenant." },
            { type: "danger", content: "Quelqu'un, quelque part, a fait le lien entre cette fuite et toi." }
        ],
        choices: [
            { text: "Continuer", effects: {}, next: null }
        ]
    },

    heist_clean: {
        text: [
            { type: "text", content: "Tu effaces tout. Les serveurs, les sauvegardes, les logs. Quarante mille mots de passe qui ne verront jamais le jour." },
            { type: "system", content: "Personne ne saura ce que tu as fait. Sauf toi. Et Shadow, peut-être." }
        ],
        choices: [
            { text: "Continuer", effects: { contact_shadow: 5 }, next: null }
        ]
    },

    heist_leaked: {
        text: [
            { type: "text", content: "Le lendemain, la boîte fait la une : \"Fuite massive chez un géant de la logistique — des données de clients exposées\"." },
            { type: "text", content: "Les journalistes crient à l'alerte. La boîte s'excuse. Le milieu te respecte." },
            { type: "danger", content: "Et la DGSI ajoute une ligne à ton dossier." }
        ],
        choices: [
            { text: "Continuer", effects: {}, next: null }
        ]
    },

    phantom_pure: {
        text: [
            { type: "text", content: "Tu installes la preuve. Un screencap, un fichier de logs, la signature du PoC. Puis tu sors comme une ombre." },
            { type: "speaker", content: "??" },
            { type: "text", content: "\"Tu as tenu parole. La preuve est propre. 50 BTC pour toi.\"" },
            { type: "system", content: "L'Opération Phantom est un succès. Le milieu te voit comme quelqu'un de fiable." },
            { type: "text", content: "Mais dans l'ombre, quelqu'un a pris ton empreinte. Et il n'oublie jamais." }
        ],
        choices: [
            { text: "Disparaître dans la nuit", effects: { rep: 10 }, next: null }
        ]
    },

    phantom_gray: {
        text: [
            { type: "text", content: "Tu copies 5% des transactions. Une goutte d'eau dans l'océan de la banque. Personne ne le verra. Personne ne devrait." },
            { type: "text", content: "Mais les comptes ne collent pas exactement. Et le SOC est déjà en alerte." },
            { type: "danger", content: "Tu es sorti. Avec l'argent. Mais la balance de la banque ne ferme pas à zéro." }
        ],
        choices: [
            { text: "Espérer que ça se tasse", effects: { heat: 10 }, next: null }
        ]
    },

    phantom_black: {
        text: [
            { type: "text", content: "Tu ouvres les vannes. Des millions glissent vers tes adresses intermédiaires. Le SOC s'affole. Les alarmes crépitent." },
            { type: "action", content: "Tu cours. Littéralement. Chaque saut de proxy te rapproche de la sortie." },
            { type: "danger", content: "Le lendemain, la banque annonce un vol de 14 millions d'euros. Ta photo est sur tous les écrans du monde." },
            { type: "system", content: "Tu es devenu l'homme le plus recherché de la cybercriminalité française." }
        ],
        choices: [
            { text: "Réfléchir à la suite", effects: {}, next: null }
        ]
    },

    accuse_shadow: {
        text: [
            { type: "speaker", content: "Shadow" },
            { type: "text", content: "\"Tu me prends pour une taupe ? Moi ? Après tout ce que j'ai fait pour toi ?\"" },
            { type: "action", content: "La connexion se coupe. Shadow ne te reparle plus jamais." },
            { type: "danger", content: "Et le lendemain, tu comprends : ce n'était pas Shadow. C'était Viper. Tu as perdu ton seul vrai mentor." }
        ],
        choices: [
            { text: "Vivre avec", effects: {}, next: null }
        ]
    },

    accuse_viper: {
        text: [
            { type: "speaker", content: "Viper" },
            { type: "text", content: "\"Moi ? Une taupe ? J'ai des clients qui paient pour rester discrets, pas pour parler.\"" },
            { type: "danger", content: "Le soir même, ton appartement est cambriolé. Rien n'est pris. Juste un message : \"Range ta langue.\"" },
            { type: "text", content: "C'était une menace. Tu comprends que tu as visé juste, ou presque." }
        ],
        choices: [
            { text: "Baisser la tête", effects: { heat: 8 }, next: null }
        ]
    },

    investigate_mole: {
        text: [
            { type: "action", content: "Tu passes 3 nuits à tracer les logs du forum. Les timestamps, les adresses, les habitudes." },
            { type: "text", content: "Et tu trouves quelque chose : un compte qui se connecte toujours 10 minutes avant les descentes. Toujours." },
            { type: "system", content: "Tu as trouvé le schéma. Tu sais où chercher, maintenant." }
        ],
        choices: [
            { text: "Garder le secret", effects: { skill_osint: 8 }, next: null }
        ]
    },

    mole_doc: {
        text: [
            { type: "speaker", content: "Doc" },
            { type: "text", content: "\"Moi ? La taupe ? Je vends des clés USB, pas des gens !\"" },
            { type: "action", content: "Son indignation est sincère. Mais ton accusation a laissé une trace." },
            { type: "system", content: "Doc est innocent. Tu l'as vexé. Relation Doc -20." }
        ],
        choices: [
            { text: "Continuer la traque", effects: {}, next: null }
        ]
    },

    mole_rouge: {
        text: [
            { type: "speaker", content: "La Rouge" },
            { type: "text", content: "\"Je trade des données, je ne trahis pas. Mais toi, tu viens de faire un choix.\"" },
            { type: "danger", content: "Ses yeux ne mentent pas. Elle est froide, mais pas traîtresse. Le Renard, lui..." }
        ],
        choices: [
            { text: "Comprendre", effects: {}, next: null }
        ]
    },

    mole_fox: {
        text: [
            { type: "speaker", content: "Le Renard" },
            { type: "text", content: "\"Tu es plus malin que je pensais.\"" },
            { type: "action", content: "Le Renard sourit. Largement. Trop largement." },
            { type: "text", content: "\"Mais je ne suis pas la taupe, mon petit. Je suis le courtier. Les deux camps me paient. C'est mieux, comme business.\"" },
            { type: "danger", content: "La vraie taupe, c'était Viper. Toujours Viper. Le Renard te le confirme sans le vouloir." },
            { type: "system", content: "Tu sais enfin. La traque peut commencer." }
        ],
        choices: [
            { text: "Reconstruire la vérité", effects: { rep: 5 }, next: null }
        ]
    },

    police_calm: {
        text: [
            { type: "text", content: "Tu ouvres. Deux agents de la DGSI. Cartes badgées, regards fatigués." },
            { type: "speaker", content: "Agent" },
            { type: "text", content: "\"Bonsoir. On mène une enquête sur une série de piratages dans le quartier. Vous n'avez rien remarqué d'anormal ?\"" },
            { type: "text", content: "Ton cœur tape dans ta poitrine. Mais tu souris. \"Rien du tout, désolé.\"" },
            { type: "system", content: "Ils partent sans insister. Cette fois. Le heat retombe légèrement." }
        ],
        choices: [
            { text: "Souffler", effects: { heat: -10 }, next: null }
        ]
    },

    police_flee: {
        text: [
            { type: "text", content: "Tu sors par la fenêtre arrière. Le vent glacial. Tu cours pieds nus dans la ruelle." },
            { type: "text", content: "Derrière toi, la porte claque. Les agents rentrent. Ils ne trouvent que ton appartement vide." },
            { type: "danger", content: "Mais ils ont vu ton visage. Et ils ont un mandat." }
        ],
        choices: [
            { text: "Disparaître quelques jours", effects: { risk: 20, heat: 10, money: -200 }, next: null }
        ]
    },

    police_destroy: {
        text: [
            { type: "text", content: "Tu jettes tout le matériel dans le broyeur. Les disques, les clés USB, le routeur, tout." },
            { type: "text", content: "Les agents fouillent. Trois heures. Ils repartent bredouilles." },
            { type: "system", content: "Tu as perdu ton matos, mais tu es libre. Pour l'instant." }
        ],
        choices: [
            { text: "Reconstruire", effects: { heat: -15 }, next: "destroy_aftermath" }
        ]
    },

    destroy_aftermath: {
        text: [
            { type: "text", content: "La semaine suivante, un mot glissé sous ta porte : une adresse, un horaire, un code." },
            { type: "speaker", content: "Shadow" },
            { type: "text", content: "\"Un ami t'a vu sans matos. Viens, j'ai un truc pour toi.\"" },
            { type: "system", content: "Shadow t'offre un vieux laptop blindé. Contact Shadow +15." }
        ],
        choices: [
            { text: "Accepter", effects: { contact_shadow: 15, skill_python: 3 }, next: null }
        ]
    },

    final_white: {
        text: [
            { type: "text", content: "Tu appelles le numéro que tu as gardé précieusement. Celui de l'agent qui t'avait rendu visite." },
            { type: "speaker", content: "Agent" },
            { type: "text", content: "\"Vous avez pris votre décision ?\"" },
            { type: "text", content: "\"Oui. J'ai des informations. Beaucoup d'informations.\"" },
            { type: "text", content: "Tu déroules tout : le forum, Viper, les opérations, les noms, les adresses." },
            { type: "system", content: "La DGSI remonte le réseau en 48 heures. 14 arrestations. Ta tête reste sur tes épaules." }
        ],
        choices: [
            { text: "Signer la déposition", effects: {}, endPath: "white" }
        ]
    },

    final_gray: {
        text: [
            { type: "text", content: "Tu vides les comptes. Les wallets, les cachettes, les coffres. Tout." },
            { type: "text", content: "Un billet d'avion. Une destination sans extradition. Un nouveau nom, un nouveau visage, une nouvelle vie." },
            { type: "system", content: "Quelque part dans le monde, un homme sirote un café en regardant l'océan. Personne ne sait qui il est. Personne." }
        ],
        choices: [
            { text: "Disparaître", effects: {}, endPath: "gray" }
        ]
    },

    final_black: {
        text: [
            { type: "action", content: "LE DERNIER COUP" },
            { type: "text", content: "Tu prépares la plus grande opération de ta carrière : le réseau central d'une banque, les transferts internationaux, une seule nuit." },
            { type: "text", content: "Six heures de tension pure. Trois alarmes. Deux sauvegardes inespérées." },
            { type: "system", content: "À l'aube, tu es plus riche que tu ne l'as jamais rêvé. Et ton nom est gravé dans l'histoire du darknet." }
        ],
        choices: [
            { text: "Devenir la légende", effects: {}, endPath: "black" }
        ]
    },

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
