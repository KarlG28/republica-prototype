// ============================================================
// ENDPOINT API · GÉNÉRATION DE DOSSIER PAR CLAUDE
// ============================================================

export const runtime = "edge";
export const maxDuration = 25;

const SYSTEM_PROMPT = `Tu génères un dossier politique français inédit pour une simulation présidentielle (2026).

CONTRAINTES :
- Sujet original, ancré dans le réel français. Pas de cliché.
- Ton institutionnel, sobre, sérieux.
- Données chiffrées plausibles.
- Ne cite jamais de personne réelle vivante par son nom.

EXEMPLES de sujets (à ne PAS reprendre, juste pour l'esprit) : statut juridique d'une langue régionale, pédiatres dans le Massif central, aidants familiaux, encadrement du lobbying, friches industrielles, pompiers volontaires, tension Mayotte, quotas d'IA dans le service public.

FORMAT : JSON STRICT uniquement, aucun texte ni markdown autour. Sois CONCIS dans toutes les chaînes de texte.

STRUCTURE EXACTE :
{
  "id":"slug-court",
  "day":"J+XX",
  "tag":"Note d'arbitrage présidentiel",
  "title":"Titre 5-8 mots",
  "subtitle":"Sous-titre 10-15 mots",
  "urgent":false,
  "summary":{"contexte":"Contexte avec **données en gras** (2 phrases max)","enjeu":"Enjeu en 1 phrase"},
  "sources":["[1] Source · date"],
  "agents":[
    {"name":"Acteur 1","color":"blue","stance":"POSITION","quote":"Citation 10 mots max"},
    {"name":"Acteur 2","color":"red","stance":"POSITION","quote":"..."},
    {"name":"Acteur 3","color":"gold","stance":"POSITION","quote":"..."},
    {"name":"Acteur 4","color":"muted","stance":"POSITION","quote":"..."}
  ],
  "scenarios":[
    {"code":"SCÉNARIO A","color":"blue","title":"Titre 4 mots","risk":"QUALIF","desc":"1 phrase","tags":[["+ Acteur",true],["− Autre",false]],"deltas":{"debt":0.3,"confidence":3,"parliament":1,"tension":-0.2,"spread":2,"liberal":2},"signature":"A"},
    {"code":"SCÉNARIO B","color":"gold","title":"...","risk":"...","desc":"...","tags":[],"deltas":{"social":2},"signature":"B"},
    {"code":"SCÉNARIO C","color":"muted","title":"...","risk":"...","desc":"...","tags":[],"deltas":{"europe":2},"signature":"C"}
  ],
  "consequences":{
    "A":{"title":"Titre 4 mots","narrative":"2 phrases max","events":[{"day":"+5","label":"Evt 4 mots","color":"blue"},{"day":"+20","label":"...","color":"yellow"},{"day":"+45","label":"...","color":"red"},{"day":"+70","label":"...","color":"green"}]},
    "B":{"title":"...","narrative":"...","events":[...]},
    "C":{"title":"...","narrative":"...","events":[...]}
  }
}

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
