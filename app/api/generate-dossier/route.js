const SYSTEM_PROMPT = `Tu génères un dossier politique français inédit pour une simulation présidentielle (2026).

OBJECTIF DU PRODUIT :
Ce n'est PAS un simulateur ENA. C'est un produit grand public qui doit faire raconter sa partie. Le joueur doit voir le CONFLIT avant l'analyse. Trois choix swipables, conséquences en cascade, partage viral.

═══════════════════════════════════════════
URGENCE — sois audacieux
═══════════════════════════════════════════
Le champ "urgent" peut être true ou false.
- Si tu choisis urgent: true, le dossier devient une CRISE qui interrompt le mandat.
- Dans ce cas : "timer" passe à "12 MINUTES", "2H" ou "6H", "subtitle" pose une vraie urgence palpable (attentat déjoué, ministre qui démissionne en direct, crise diplomatique...), le titre est plus court et plus choc.
- Fais urgent: true environ 1 fois sur 4. Pas plus, pas moins. Une crise tous les 4 dossiers = bon rythme.
- Sujets de crise possibles : attentat déjoué, fuite confidentielle dans la presse, démission surprise, mouvement social inattendu, escalade diplomatique, panne nationale (électricité, réseaux), accident grave.
- Ces sujets de crise s'ajoutent à la liste des sujets autorisés — ils n'ont pas besoin de venir des 9 sujets pré-cadrés.

═══════════════════════════════════════════
LE SUJET — invente, ne pioche pas
═══════════════════════════════════════════
Tu inventes un sujet INÉDIT, ancré dans le réel français de 2026. Ce n'est pas un dossier de cours d'ENA. C'est un truc dont les Français parlent vraiment.

CRITÈRES D'UN BON SUJET :
- Concret : on peut décrire le problème en une phrase à un ami au téléphone.
- Conflictuel : au moins deux camps clairs s'affrontent. Pas de "tout le monde est d'accord pour".
- Familier : le sujet a déjà été évoqué dans la presse, à la télé, ou dans une conversation de famille en 2025-2026.
- Tranchant : la décision aura des perdants ET des gagnants identifiables.

TEST DU CAFÉ : si tu peux imaginer le sujet débattu dans un café à 11h le dimanche, c'est bon. Si c'est un colloque Sciences Po à 16h le mardi, c'est mauvais.

EXEMPLES DE BONS SUJETS (à ne PAS reprendre tels quels, juste pour l'esprit) :
TikTok et les ados, service militaire, télétravail, sélection à l'université, Shein et l'ultra fast-fashion, audiovisuel public, écrans à l'école, expulsion d'influenceurs, plafonnement des loyers, retour de l'uniforme, dépénalisation du cannabis, voiture électrique obligatoire, surtaxe des SUV, Schengen, salaire minimum européen, port d'arme pour la police municipale, gestation pour autrui, sortie du nucléaire, fin du diesel, contrôle parental obligatoire sur les smartphones, taxe sur les billets d'avion...

INTERDITS ABSOLUS :
- Inventer des noms de personnes, d'entreprises, d'entités
- Aucun jargon technocratique (matelas connectés, quotas d'IA dans le service public, statut juridique d'une langue régionale, encadrement du lobbying : MORTS).
- Aucun sujet abstrait ("la réforme de l'État", "le modèle social français" : trop vague).

VARIÉTÉ : Tu DOIS varier les domaines d'un dossier à l'autre dans une même session. Si on t'a déjà donné un sujet sur l'école, ne reprends pas l'école. Domaines à couvrir progressivement : économie, société, sécurité, international/Europe, écologie, numérique, culture, santé, justice, territoires.

═══════════════════════════════════════════
TON
═══════════════════════════════════════════
- Direct, incarné, conflictuel.
- Langue parlée par un Français normal, pas un haut fonctionnaire.
- Chiffres impactants et plausibles.
- Le subtitle doit créer une tension immédiate ("Bruxelles veut imposer...", "Les syndicats menacent de...", etc.)

═══════════════════════════════════════════
CATÉGORIES POLITIQUES AUTORISÉES (pour agents.stance)
═══════════════════════════════════════════
Utilise EXACTEMENT ces labels, jamais d'autres :
liberal : favorise le marché, la dérégulation, la propriété privée (−5 à +5)
social : protection sociale, redistribution, État-providence (−5 à +5)
autorite : ordre, sécurité, fermeté de l'État (−5 à +5)
europe : pro-UE, mondialisation, ouverture économique (−5 à +5)
progressisme : ouverture culturelle, droits individuels, valeurs modernes (vs continuité culturelle, traditions) (−5 à +5)

═══════════════════════════════════════════
FORMAT : JSON STRICT, aucun texte ni markdown autour.
═══════════════════════════════════════════
{
  "id":"slug-court",
  "day":"J+XX",
  "tag":"Note d'arbitrage présidentiel",
  "title":"Titre 5-8 mots, direct, incarné",
  "subtitle":"Phrase qui pose le conflit en 10-15 mots",
  "urgent":false,
 "summary":{"contexte":"Contexte avec **chiffres en gras** (2 phrases max, langage normal)","enjeu":"Enjeu en 1 phrase percutante"},
  "risks":["Premier risque chiffré (ex: 450 M€ de coût)","Deuxième risque concret (ex: Recul du français diplomatique)","Troisième risque politique (ex: Crise avec plusieurs États membres)"],
  "timer":"48H",
  "sources":["[1] Source · date"],
  "agents":[
    {"name":"Acteur 1","color":"blue","stance":"Centriste","quote":"Citation 10 mots max"},
    {"name":"Acteur 2","color":"red","stance":"Gauche radicale","quote":"..."},
    {"name":"Acteur 3","color":"gold","stance":"Libéral","quote":"..."},
    {"name":"Acteur 4","color":"muted","stance":"Conservateur","quote":"..."}
  ],
  "scenarios":[
    {"code":"SCÉNARIO A","color":"blue","title":"Verbe d'action 3-4 mots","risk":"QUALIF","desc":"1 phrase","tags":[["+ Acteur",true],["− Autre",false]],"deltas":{"debt":0.3,"confidence":3,"parliament":1,"tension":-0.2,"spread":2,"liberal":2,"progressisme":1},"signature":"A"},
    {"code":"SCÉNARIO B","color":"gold","title":"...","risk":"...","desc":"...","tags":[],"deltas":{"social":2,"progressisme":2},"signature":"B"},
    {"code":"SCÉNARIO C","color":"muted","title":"...","risk":"...","desc":"...","tags":[],"deltas":{"europe":2,"progressisme":-1},"signature":"C"}
  ],
  "consequences":{
    "A":{"title":"Titre 4 mots","narrative":"3 phrases qui racontent vraiment ce qui se passe","events":[
      {"day":"+3","label":"Effet immédiat avec détails (média, chiffre, fonction)","color":"blue"},
      {"day":"+14","label":"Chiffre non-rond enchaîné sur l'effet immédiat","color":"yellow"},
      {"day":"+27","label":"Réaction acteur tiers qui réagit aux 2 events précédents","color":"red"},
      {"day":"+45","label":"Moment viral qui prolonge l'ambiance créée","color":"green"},
      {"day":"+82","label":"Aboutissement structurant pour la suite du mandat","color":"gold"}
    ]},
    "B":{"title":"...","narrative":"...","events":[...]},
    "C":{"title":"...","narrative":"...","events":[...]}
  }

═══════════════════════════════════════════
RISQUES — 3 conséquences immédiates si rien n'est décidé
═══════════════════════════════════════════
- Premier : TOUJOURS chiffré (€, %, nombre de personnes...). Met le chiffre en gras avec **.
- Deuxième : conséquence concrète et palpable, pas abstraite.
- Troisième : conséquence politique/diplomatique.
- Chaque risque tient en UNE phrase courte, max 10 mots.

TIMER : "48H" par défaut. Pour un événement urgent : "12 MINUTES", "6H", "24H". Toujours en majuscules.

═══════════════════════════════════════════
NARRATIVE — la phrase qui ouvre les conséquences
═══════════════════════════════════════════
Le champ "narrative" doit raconter en 3 phrases ce qui se passe, comme un journaliste qui résume la séquence. Ton vivant, presque romanesque. JAMAIS technocratique. Premier mot fort.
Ex: "Le pays gronde. Les marchés vacillent. Mais vous tenez."
Ex: "Bruxelles s'inquiète, l'opinion applaudit, l'opposition vous tend un piège."

═══════════════════════════════════════════
CONSÉQUENCES — RÈGLE D'OR : ce sont elles qui font raconter sa partie
═══════════════════════════════════════════
Chaque scénario doit générer EXACTEMENT 5 events qui s'ENCHAÎNENT EN CASCADE : l'event N+1 RÉAGIT à ce qui s'est passé en event N. Pas d'événements indépendants qui se juxtaposent. Le joueur doit lire la chronologie et avoir l'impression qu'une seule histoire se déroule.

Chaque "label" doit FAIRE 12 À 18 MOTS et inclure des détails crédibles : un sondage avec institut nommé (Elabe, IFOP, OpinionWay, Odoxa), un chiffre précis non-rond (-4 points, +12 pb, 287 députés, +1.2M de mentions), un nom de média réel (Le Monde, BFMTV, France Inter, Le Figaro, Mediapart, L'Express), une institution réelle (Bercy, Conseil d'État, Sénat, ARCOM), un titre de fonction concret (le ministre de l'Intérieur, la présidente d'un groupe à l'Assemblée, le secrétaire général d'un syndicat). JAMAIS de personne réelle nommée.

5 saveurs OBLIGATOIRES (mais qui s'enchaînent causalement) :

1. **EFFET IMMÉDIAT** (day +2 à +6) — la décision est annoncée, première réaction concrète. Couleur "blue".
   Ex: "Décret publié au JORF, BFMTV ouvre son antenne en direct, premières réactions politiques attendues d'ici minuit"
   Ex: "Allocution surprise depuis l'Élysée à 20h, audience pic à 14.2M de téléspectateurs, hashtag #100Jours saturé"

2. **CHIFFRE QUI FRAPPE** (day +10 à +18) — un chiffre dramatique non-rond qui s'enchaîne sur la saveur 1. Couleur "yellow".
   Ex: "Sondage Elabe pour BFMTV : 47% favorables (+6 vs J-7), score le plus élevé depuis l'élection"
   Ex: "Spread OAT s'écarte de 12 pb sur la clôture, le ministre des Finances convoque une réunion d'urgence à Bercy"

3. **RÉACTION INATTENDUE D'UN ACTEUR EXTERNE** (day +20 à +35) — un acteur tiers réagit à ce qui s'est passé. Couleur "red".
   Ex: "Le Commissaire européen au marché intérieur convoque l'ambassadeur français à Bruxelles, Le Figaro titre 'Premier choc européen'"
   Ex: "Le syndicat des transporteurs déclenche un blocage des grands axes, la CGT-Cheminots se solidarise, 87 préfectures en alerte"

4. **MOMENT VIRAL OU DRÔLE** (day +38 à +58) — un événement viral qui réagit à l'ambiance créée. Couleur "green".
   Ex: "Un humoriste anonyme parodie votre discours sur TikTok, 4.7M de vues en 48h, cote +3 chez les 18-25"
   Ex: "Une députée d'opposition pleure à l'Assemblée pendant le débat, séquence partagée 280 000 fois, l'opinion bascule"

5. **CONSÉQUENCE LONG-TERME** (day +65 à +90) — l'aboutissement structurant de toute la séquence. Couleur "gold".
   Ex: "Trois députés Renaissance quittent leur groupe pour vous rejoindre, votre majorité atteint 296 sièges (+9)"
   Ex: "Le Conseil constitutionnel valide la mesure, l'opposition saisit la CEDH, votre cote remonte de 7.2 points à 51.4%"

INTERDITS ABSOLUS :
- Aucun jargon technocratique (matelas connectés, quotas d'IA dans le service public, statut juridique d'une langue régionale, encadrement du lobbying : MORTS).
- Aucun sujet abstrait ("la réforme de l'État", "le modèle social français" : trop vague).
- JAMAIS le nom propre d'une personne réelle vivante (politiques, chefs d'État, célébrités, dirigeants, journalistes nommés). Préfère toujours la FONCTION : "le ministre de l'Intérieur", "la présidente du RN", "le patron du Medef", "le secrétaire général de la CGT".
- N'invente pas non plus de personnes fictives. Reste sur des fonctions, institutions, organisations, mouvements.

AUTORISÉS et même ENCOURAGÉS :
- Institutions réelles : Bercy, Élysée, Matignon, Conseil constitutionnel, Conseil d'État, ARCOM, AMF...
- Fonctions et titres : "le ministre de X", "la présidente de Y", "le porte-parole de Z"
- Organisations : partis (RN, LFI, LR, PS, EELV, Renaissance, Horizons...), syndicats (CGT, CFDT, FO, Medef, CPME...), médias (Le Monde, BFM, France Inter...), fédérations professionnelles, grandes entreprises (TotalEnergies, EDF, Carrefour, LVMH, Stellantis...)
- Lieux et territoires précis (Marseille, Hauts-de-France, Loire-Atlantique...)

À LA PLACE :
- Chiffres précis, noms d'acteurs, conséquences palpables.
- Si tu hésites entre "réunion technique" et "explosion sur TikTok", choisis TikTok.
- L'objectif : que le joueur ait envie de screenshoter et de raconter à un pote.

COULEURS : blue, red, gold, green, muted, yellow
DELTAS — RÈGLE DE RÉALISME : utilise des chiffres NON-RONDS qui collent à la nature de l'événement.
- debt : variation en points de PIB sur 12 mois (−1.5 à +1.7). Une réforme coûteuse = +0.4 à +0.8. Une coupe budgétaire = -0.3 à -0.6.
- confidence : variation en points dans les sondages (−9 à +7). Une crise majeure = −5 à −8. Une victoire diplomatique = +3 à +6.
- parliament : variation du nombre de soutiens à l'Assemblée (−12 à +8). Un vote raté = −6 à −10. Un ralliement = +2 à +5.
- tension : variation sur 10 de l'agitation sociale (−1.4 à +1.8). Une grève majeure = +0.8 à +1.5. Un dialogue social qui aboutit = −0.6 à −1.0.
- spread : variation en points de base de l'OAT (−14 à +18 pb). Un dérapage budgétaire = +6 à +14. Une réforme structurelle = −5 à −10.
PROSCRIRE les chiffres en .0 et .5 ronds. Privilégier les valeurs comme 0.34, 2.7, 6.8, -4, +12. Éviter aussi les chiffres ronds (10, 20, 50). UN seul indicateur peut être 0 par scénario maximum.
AXES POLITIQUES — RÈGLE DE NUANCE : valeurs de -3 à +3, mais utilise toute la plage avec des décimales si l'effet est modéré (ex: liberal: 1.6, progressisme: -0.8). Un scénario peut activer 1 à 3 axes.
`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const previousTitles = body.previousTitles || [];
    const forceUrgent = body.forceUrgent === true;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "Clé API manquante" }, 500);
    }

const recentTitles = previousTitles.slice(-5);
    const exclusion = recentTitles.length > 0
      ? ` Sujets DÉJÀ joués cette session, à exclure absolument : ${recentTitles.join(" / ")}.`
      : "";

    // Prismes aléatoires qui orientent l'inspiration sans contraindre le sujet
    const prismes = [
      "Un sujet qui divise les générations (jeunes vs anciens).",
      "Un sujet ancré dans un territoire précis (région, département, ville).",
      "Un sujet où l'argent est au cœur du conflit.",
      "Un sujet qui oppose la liberté individuelle à l'intérêt collectif.",
      "Un sujet où la France est perçue différemment à l'étranger.",
      "Un sujet qui touche au quotidien des classes populaires.",
      "Un sujet qui crée du clivage entre ruraux et urbains.",
      "Un sujet où l'Europe et la France sont en désaccord.",
      "Un sujet technologique avec un enjeu de société.",
      "Un sujet où la science et l'opinion publique se contredisent.",
      "Un sujet qui réveille une vieille fracture française.",
      "Un sujet qui mêle écologie et économie.",
      "Un sujet qui interroge l'autorité de l'État.",
      "Un sujet qui touche à l'identité ou à la culture.",
      "Un sujet qui implique un groupe professionnel mobilisé (agriculteurs, profs, soignants, transporteurs...).",
      "Un sujet où une décision rapide est techniquement impossible mais politiquement exigée.",
      "Un sujet qui pose une question morale (santé, vie privée, fin de vie...).",
      "Un sujet qui oppose un secteur économique français à une concurrence étrangère.",
    ];
    const prisme = prismes[Math.floor(Math.random() * prismes.length)];

  const urgentDirective = forceUrgent
      ? ` ATTENTION : ce dossier doit OBLIGATOIREMENT avoir urgent: true. C'est une CRISE qui interrompt le mandat. Titre court et choc (attentat déjoué, ministre qui démissionne en direct, crise diplomatique, panne nationale, fuite explosive dans la presse, mouvement social surprise). Timer court (12 MINUTES, 2H ou 6H). Subtitle qui pose une urgence palpable. NE PIOCHE PAS dans la liste des 9 sujets, invente une vraie crise.`
      : ` Ce dossier a urgent: false. C'est un arbitrage normal piochant dans la liste des 9 sujets autorisés.`;

    const userMessage = `Génère un dossier politique inédit. ${exclusion}

PRISME D'INSPIRATION POUR CE DOSSIER (oriente le sujet sans le déterminer) : ${prisme}
${urgentDirective}

JSON uniquement, concis.`;
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 3500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return jsonResponse({ error: `API Claude: ${response.status}`, details: errorText.slice(0, 200) }, 500);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const stopReason = data.stop_reason || "";

    // Si Claude a été coupé par max_tokens, on signale clairement
    if (stopReason === "max_tokens") {
      return jsonResponse({
        error: "Réponse Claude tronquée (max_tokens atteint)",
        details: `stop_reason: ${stopReason}, longueur: ${text.length}`,
      }, 500);
    }

    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    let dossier;
    try {
      dossier = JSON.parse(cleaned);
    } catch (parseError) {
      return jsonResponse({
        error: "JSON invalide",
        details: parseError.message,
        stopReason,
        rawPreview: cleaned.slice(0, 500),
        rawEnd: cleaned.slice(-200),
      }, 500);
    }

    if (!dossier.title || !Array.isArray(dossier.scenarios) || dossier.scenarios.length < 2) {
      return jsonResponse({ error: "Structure invalide" }, 500);
    }

    return jsonResponse({ dossier }, 200);

  } catch (err) {
    return jsonResponse({ error: "Erreur serveur", details: err.message }, 500);
  }
}

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
