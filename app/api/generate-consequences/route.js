const SYSTEM_PROMPT = `Tu génères les conséquences d'une décision présidentielle française pour une simulation politique.

ENTRÉE : tu reçois le contexte d'un dossier et le choix du joueur (un des 3 scénarios).

OBJECTIF : produire une chronologie immersive de 5 événements qui s'enchaînent dans les semaines suivant la décision, plus une narrative d'ouverture.

═══════════════════════════════════════════
FORMAT : JSON STRICT, aucun texte ni markdown autour.
═══════════════════════════════════════════
{
  "title": "Titre court 3-4 mots qui résume la séquence",
  "narrative": "3 phrases courtes qui racontent ce qui se passe, ton vivant, presque romanesque. JAMAIS technocratique. Premier mot fort.",
  "events": [
    {"day":"+3","label":"Effet immédiat avec détails (média, chiffre, fonction)","color":"blue"},
    {"day":"+14","label":"Chiffre non-rond enchaîné sur l'effet immédiat","color":"yellow"},
    {"day":"+27","label":"Réaction acteur tiers qui réagit aux 2 events précédents","color":"red"},
    {"day":"+45","label":"Moment viral qui prolonge l'ambiance créée","color":"green"},
    {"day":"+82","label":"Aboutissement structurant pour la suite du mandat","color":"gold"}
  ]
}

═══════════════════════════════════════════
NARRATIVE — la phrase qui ouvre les conséquences
═══════════════════════════════════════════
3 phrases courtes, ton vivant. JAMAIS technocratique. Premier mot fort.
Ex: "Le pays gronde. Les marchés vacillent. Mais vous tenez."
Ex: "Bruxelles s'inquiète, l'opinion applaudit, l'opposition vous tend un piège."

═══════════════════════════════════════════
5 EVENTS QUI S'ENCHAÎNENT EN CASCADE
═══════════════════════════════════════════
Chaque event N+1 RÉAGIT à ce qui s'est passé en event N. Pas d'événements indépendants qui se juxtaposent.

Chaque "label" doit FAIRE 12 À 18 MOTS et inclure des détails crédibles : un sondage avec institut nommé (Elabe, IFOP, OpinionWay, Odoxa), un chiffre précis non-rond (-4 points, +12 pb, 287 députés), un nom de média réel (Le Monde, BFMTV, France Inter, Le Figaro, Mediapart), une institution réelle (Bercy, Conseil d'État, Sénat, ARCOM), un titre de fonction concret (le ministre de l'Intérieur, la présidente d'un groupe à l'Assemblée). JAMAIS de personne réelle nommée.

5 saveurs OBLIGATOIRES (qui s'enchaînent causalement) :

1. **EFFET IMMÉDIAT** (day +2 à +6) — la décision est annoncée. Couleur "blue".
   Ex: "Décret publié au JORF, BFMTV ouvre son antenne en direct, premières réactions politiques attendues d'ici minuit"

2. **CHIFFRE QUI FRAPPE** (day +10 à +18) — un chiffre dramatique non-rond qui s'enchaîne sur la saveur 1. Couleur "yellow".
   Ex: "Sondage Elabe pour BFMTV : 47% favorables (+6 vs J-7), score le plus élevé depuis l'élection"

3. **RÉACTION INATTENDUE D'UN ACTEUR EXTERNE** (day +20 à +35) — un acteur tiers réagit. Couleur "red".
   Ex: "Le Commissaire européen au marché intérieur convoque l'ambassadeur français à Bruxelles, Le Figaro titre 'Premier choc européen'"

4. **MOMENT VIRAL OU DRÔLE** (day +38 à +58) — un événement viral qui réagit à l'ambiance créée. Couleur "green".
   Ex: "Un humoriste anonyme parodie votre discours sur TikTok, 4.7M de vues en 48h, cote +3 chez les 18-25"

5. **CONSÉQUENCE LONG-TERME** (day +65 à +90) — l'aboutissement structurant. Couleur "gold".
   Ex: "Trois députés Renaissance quittent leur groupe pour vous rejoindre, votre majorité atteint 296 sièges (+9)"

INTERDITS ABSOLUS :
- Aucun nom propre de personne réelle vivante. Préfère toujours la FONCTION.
- N'invente pas non plus de personnes fictives. Reste sur des fonctions, institutions, organisations.

COULEURS : blue, red, gold, green, yellow

CONTRAINTE : tous les "day" doivent rester entre +2 et +90.
`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const dossierTitle = body.dossierTitle || "";
    const dossierSubtitle = body.dossierSubtitle || "";
    const scenarioTitle = body.scenarioTitle || "";
    const scenarioDesc = body.scenarioDesc || "";
    const scenarioRisk = body.scenarioRisk || "";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "Clé API manquante" }, 500);
    }

    const userMessage = `Dossier en cours : "${dossierTitle}"${dossierSubtitle ? ` (${dossierSubtitle})` : ""}

Décision prise par le président : "${scenarioTitle}"${scenarioRisk ? ` [${scenarioRisk}]` : ""}
Description : ${scenarioDesc}

Génère la chronologie des conséquences sur 90 jours. JSON uniquement, concis.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1500,
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

    let consequence;
    try {
      consequence = JSON.parse(cleaned);
    } catch (parseError) {
      return jsonResponse({
        error: "JSON invalide",
        details: parseError.message,
        rawPreview: cleaned.slice(0, 500),
      }, 500);
    }

    if (!consequence.title || !Array.isArray(consequence.events) || consequence.events.length < 4) {
      return jsonResponse({ error: "Structure invalide" }, 500);
    }

    return jsonResponse({ consequence }, 200);

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
