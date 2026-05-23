// ============================================================
// ENDPOINT API · GÉNÉRATION DE DOSSIER POLITIQUE PAR CLAUDE
// Version optimisée pour rester sous la limite Vercel Hobby (25s)
// Modèle : claude-haiku-4-5 (rapide, ~8-12 secondes par dossier)
// ============================================================

export const runtime = "edge";
export const maxDuration = 25;

const SYSTEM_PROMPT = `Tu es le moteur narratif de Republica, une simulation politique française.

Mission : générer un dossier politique INÉDIT pour un Président français fictif (2026).

RÈGLES :
- Sujet original, ancré dans le réel français. Évite les cliché (retraites, taxes carbone simples).
- Privilégie des angles inédits : tensions territoriales, dilemmes éthiques nouveaux, technologies émergentes, géopolitique européenne, transitions sectorielles, crises silencieuses.
- Ton institutionnel, sobre, sérieux (style note administrative confidentielle).
- Pas de caricature, pas d'humour, pas de jugement politique.
- Données chiffrées plausibles, inspirées de sources réelles.

EXEMPLES de sujets bienvenus (esprit, ne pas copier) : statut juridique d'une langue régionale, pénurie de pédiatres dans le Massif central, statut des aidants familiaux, encadrement du lobbying, friches industrielles polluées, avenir des pompiers volontaires, tension Mayotte, quotas d'IA dans le service public.

FORMAT DE SORTIE : JSON STRICT uniquement, aucun texte avant ni après, aucun markdown.

STRUCTURE :
{
  "id": "kebab-case-court",
  "day": "J+XX" (entre 10 et 90),
  "tag": "Note d'arbitrage présidentiel" ou "Note interministérielle" ou "Dépêche entrante",
  "title": "Titre 5-8 mots",
  "subtitle": "Sous-titre 10-15 mots",
  "urgent": false,
  "summary": {
    "contexte": "Contexte chiffré avec **données en gras** entre doubles astérisques (2 phrases)",
    "enjeu": "Enjeu en 1 phrase"
  },
  "sources": ["[1] Source crédible · date"],
  "agents": [
    { "name": "Acteur 1", "color": "blue", "stance": "POSITION", "quote": "Citation courte" },
    { "name": "Acteur 2", "color": "red", "stance": "POSITION", "quote": "..." },
    { "name": "Acteur 3", "color": "gold", "stance": "POSITION", "quote": "..." },
    { "name": "Acteur 4", "color": "muted", "stance": "POSITION", "quote": "..." }
  ],
  "scenarios": [
    {
      "code": "SCÉNARIO A",
      "color": "blue",
      "title": "Titre court",
      "risk": "QUALIFICATION",
      "desc": "Description 1-2 phrases",
      "tags": [["+ Acteur", true], ["− Autre acteur", false]],
      "deltas": { "debt": 0.3, "confidence": 3, "parliament": 1, "tension": -0.2, "spread": 2, "liberal": 2 },
      "signature": "A"
    },
    { ... SCÉNARIO B avec color "gold" et signature "B" et axe "social" ou "europe" ... },
    { ... SCÉNARIO C avec color "muted" et signature "C" et axe différent ... }
  ],
  "consequences": {
    "A": {
      "title": "Conséquences scénario A",
      "narrative": "3 phrases de conséquences narratives",
      "events": [
        { "day": "+5", "label": "Événement 1", "color": "blue" },
        { "day": "+20", "label": "Événement 2", "color": "yellow" },
        { "day": "+45", "label": "Événement 3", "color": "red" },
        { "day": "+70", "label": "Événement 4", "color": "green" }
      ]
    },
    "B": { même structure },
    "C": { même structure }
  }
}

COULEURS valides : blue, red, gold, green, muted, yellow
DELTAS : debt (-2 à +2), confidence (-10 à +10), parliament (-10 à +10), tension (-2 à +2), spread (-20 à +20)
SCORES politiques (un par scénario) : liberal, social, autorite, europe (valeur 1-3)`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const previousTitles = body.previousTitles || [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "Clé API manquante" }, 500);
    }

    const exclusion = previousTitles.length > 0
      ? `\n\nDOSSIERS DÉJÀ JOUÉS (à éviter absolument) :\n${previousTitles.map(t => `- ${t}`).join("\n")}`
      : "";

    const userMessage = `Génère un dossier politique inédit, surprenant mais crédible.${exclusion}\n\nRetourne UNIQUEMENT le JSON.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return jsonResponse({ error: `API Claude error: ${response.status}`, details: errorText.slice(0, 300) }, 500);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Nettoyage : enlever d'éventuelles balises markdown autour du JSON
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    // Extraction du premier objet JSON si du texte parasite existe
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
        rawPreview: cleaned.slice(0, 400),
      }, 500);
    }

    // Validation minimale
    if (!dossier.title || !Array.isArray(dossier.scenarios) || dossier.scenarios.length < 2) {
      return jsonResponse({ error: "Structure de dossier invalide" }, 500);
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
