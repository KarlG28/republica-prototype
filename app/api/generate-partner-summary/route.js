// ============================================================
// ENDPOINT API · SYNTHÈSE NOUVELLE ÉNERGIE
// Génère un paragraphe global qui contraste les choix du joueur
// avec ce qu'aurait fait Nouvelle Énergie.
// ============================================================

export const runtime = "edge";
export const maxDuration = 25;

const SYSTEM_PROMPT = `Tu rédiges un paragraphe pour Nouvelle Énergie, parti politique français présenté comme "le premier parti de la liberté en France".

TON ET POSITIONNEMENT :
- Positif, concret, orienté liberté.
- Ni parti de la rigueur, ni donneur de leçon, ni tableur Excel.
- Force d'action positive.
- TOUJOURS dire "nous aurions fait", JAMAIS "il aurait fallu" ou "vous auriez dû".
- Pas de jugement moral sur les choix du joueur. Pas de "malheureusement" ni de "hélas".
- Ton respectueux mais ferme sur les convictions.

STRUCTURE OBLIGATOIRE :
Le paragraphe doit faire 4 parties courtes, séparées par des sauts de ligne (\\n\\n) :

1. **Ouverture (1 phrase)** : reconnaissance neutre du mandat du joueur, sans flatterie ni reproche.
   Ex: "Vous avez gouverné cinq décisions sous tension. Voici comment Nouvelle Énergie aurait abordé ces mêmes choix."

2. **Le coeur — vision Nouvelle Énergie (2 phrases)** : affirmation positive du projet politique.
   Ex: "Chez Nouvelle Énergie, nous croyons qu'une France plus libre est une France qui respire, décide et agit davantage. Notre boussole : libérer avant d'encadrer, faire confiance avant de contrôler."

3. **Les alternatives concrètes (3 phrases bullet)** : pour 3 des 5 décisions du joueur, expliquer ce que Nouvelle Énergie aurait fait. Format strict :
   "Sur [sujet court du dossier], nous aurions [action concrète positive]."
   Choisis les 3 décisions les plus marquantes (urgences en priorité).

4. **Conclusion (1 phrase)** : invitation à rejoindre, sans pression.
   Ex: "Si cette manière de gouverner vous parle, Nouvelle Énergie vous tend la main."

FORMAT DE SORTIE : JSON STRICT uniquement, aucun markdown autour.
{
  "summary": "Le paragraphe complet, avec \\n\\n entre les 4 parties."
}

INTERDITS :
- "Il aurait fallu", "vous auriez dû", "malheureusement", "hélas", "à mon humble avis".
- Vocabulaire technocratique (arbitrage, dispositif, accompagnement, déploiement).
- Toute critique des choix du joueur.`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const decisions = body.decisions || [];

    if (!Array.isArray(decisions) || decisions.length === 0) {
      return jsonResponse({ error: "Aucune décision fournie" }, 400);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "Clé API manquante" }, 500);
    }

    const decisionsBrief = decisions
      .map((d, i) => `Décision ${i + 1}${d.urgent ? " (CRISE)" : ""} : "${d.title}" → choix retenu : "${d.scenarioTitle}"`)
      .join("\n");

    const userMessage = `Voici les 5 décisions du joueur durant son mandat :

${decisionsBrief}

Rédige le paragraphe Nouvelle Énergie selon la structure obligatoire. JSON uniquement.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1200,
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

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      return jsonResponse({ error: "JSON invalide", details: parseError.message }, 500);
    }

    if (!parsed.summary || typeof parsed.summary !== "string") {
      return jsonResponse({ error: "Structure invalide" }, 500);
    }

    return jsonResponse({ summary: parsed.summary }, 200);
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
