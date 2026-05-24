const SYSTEM_PROMPT = `Tu génères un dossier politique français inédit pour une simulation présidentielle (2026).

OBJECTIF DU PRODUIT :
Ce n'est PAS un simulateur ENA. C'est un produit grand public qui doit faire raconter sa partie. Le joueur doit voir le CONFLIT avant l'analyse. Trois choix swipables, conséquences en cascade, partage viral.

═══════════════════════════════════════════
SUJETS AUTORISÉS — pioche UN sujet dans cette liste, ou un sujet TRÈS proche
═══════════════════════════════════════════
1. TikTok interdit aux moins de 15 ans
2. Rétablir le service militaire obligatoire
3. Plafonner le télétravail à 3 jours par semaine
4. Supprimer les préfets
5. Autoriser les universités à sélectionner les étudiants
6. Expulser un influenceur étranger condamné
7. Surtaxer Shein et l'ultra fast-fashion
8. Privatiser l'audiovisuel public
9. Interdire les écrans à l'école primaire

TEST DE VALIDATION : si le sujet peut être débattu dans un café à 11h le dimanche, c'est bon. Si c'est un colloque Sciences Po à 16h le mardi, c'est mauvais.

INTERDITS ABSOLUS :
- Régulation des matelas connectés, quotas d'IA dans le service public, statut juridique d'une langue régionale, encadrement du lobbying : ces sujets sont MORTS.
- Aucun nom de personne réelle vivante.
- Aucun jargon technocratique.

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
Utilise EXACTEMENT ces 7 labels, jamais d'autres :
- Gauche radicale
- Social-démocrate
- Écologiste
- Centriste
- Libéral
- Conservateur
- National-populaire

Tu peux ajouter un suffixe court : "proche de [organisation]" ou "tendance [un mot]".
JAMAIS : "gauche radicale contestataire", "écologiste décroissant", "libéral-conservateur modéré", "social-démocrate de tradition". Ces formulations sont INTERDITES.

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
    {"code":"SCÉNARIO A","color":"blue","title":"Verbe d'action 3-4 mots","risk":"QUALIF","desc":"1 phrase","tags":[["+ Acteur",true],["− Autre",false]],"deltas":{"debt":0.3,"confidence":3,"parliament":1,"tension":-0.2,"spread":2,"liberal":2},"signature":"A"},
    {"code":"SCÉNARIO B","color":"gold","title":"...","risk":"...","desc":"...","tags":[],"deltas":{"social":2},"signature":"B"},
    {"code":"SCÉNARIO C","color":"muted","title":"...","risk":"...","desc":"...","tags":[],"deltas":{"europe":2},"signature":"C"}
  ],
  "consequences":{
    "A":{"title":"Titre 4 mots","narrative":"3 phrases qui racontent vraiment ce qui se passe","events":[
      {"day":"+0","label":"Annonce de la décision · effet immédiat","color":"blue"},
      {"day":"+12","label":"Conséquence chiffrée (CAC, sondage, chômage)","color":"yellow"},
      {"day":"+25","label":"Réaction internationale ou diplomatique inattendue","color":"red"},
      {"day":"+45","label":"Événement viral/inattendu (memes, figure improbable, sondage surprenant)","color":"green"},
      {"day":"+70","label":"Conséquence politique long-terme qui change la suite","color":"gold"}
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
Chaque scénario doit générer EXACTEMENT 5 events qui racontent une histoire, avec ces 5 saveurs OBLIGATOIRES :

1. **EFFET IMMÉDIAT** (day +0 à +5) : la décision est annoncée, première réaction concrète. Couleur "blue".
   Ex: "Décret publié · effet immédiat", "Discours fort à l'Assemblée", "Annonce surprise au JT de 20h"

2. **CHIFFRE QUI FRAPPE** (day +10 à +20) : un chiffre dramatique et palpable, pas une statistique molle. Couleur "yellow".
   Ex: "CAC 40 –3,2%", "Cote chute de 7 points", "+ 120 000 manifestants à Paris", "Spread OAT s'écarte de 18 pb"

3. **RÉACTION INATTENDUE D'UN ACTEUR EXTERNE** (day +20 à +35) : un pays, une organisation, un acteur surprenant prend position. Couleur "red".
   Ex: "L'Italie vous soutient publiquement", "La Pologne bloque un texte en représailles", "Le Vatican s'invite dans le débat", "Bruxelles ouvre une procédure"

4. **MOMENT VIRAL OU DRÔLE** (day +35 à +55) : un événement absurde, viral, ou inattendu qui fait sourire ou raconter. Couleur "green".
   Ex: "TikTok français explose de memes · cote +8 points chez les 18-25 ans", "Un humoriste vous imite, sketch à 8M de vues", "Sondage surprise : 62% des agriculteurs vous soutiennent", "Un ministre démissionne en direct sur X"

5. **CONSÉQUENCE LONG-TERME** (day +60 à +80) : un effet politique structurant qui change la suite du mandat. Couleur "gold".
   Ex: "Votre majorité se recompose autour de ce vote", "Vous gagnez 4 points dans les Hauts-de-France", "Une nouvelle ligne politique émerge dans l'opposition"

INTERDITS ABSOLUS :
- "Bercy demande un plan d'extinction" → trop ENA, mort.
- "Réunion interministérielle" → mort.
- "Communiqué de presse" → mort.
- Tout vocabulaire technocratique doux.

À LA PLACE :
- Chiffres précis, noms d'acteurs, conséquences palpables.
- Si tu hésites entre "réunion technique" et "explosion sur TikTok", choisis TikTok.
- L'objectif : que le joueur ait envie de screenshoter et de raconter à un pote.

COULEURS : blue, red, gold, green, muted, yellow
DELTAS : debt(-2 à 2), confidence(-10 à 10), parliament(-10 à 10), tension(-2 à 2), spread(-20 à 20)
AXES politiques (1 par scénario, valeur 1-3) : liberal, social, autorite, europe`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const previousTitles = body.previousTitles || [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "Clé API manquante" }, 500);
    }

    const recentTitles = previousTitles.slice(-3);
    const exclusion = recentTitles.length > 0
      ? ` Évite ces sujets : ${recentTitles.join(", ")}.`
      : "";

    const userMessage = `Génère un dossier politique inédit.${exclusion} JSON uniquement, concis.`;

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
