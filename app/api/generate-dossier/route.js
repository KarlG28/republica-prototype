// ============================================================
// ENDPOINT API · GÉNÉRATION DE DOSSIER POLITIQUE PAR CLAUDE
// Ce fichier tourne sur le serveur Vercel, jamais dans le navigateur.
// La clé API reste secrète, l'utilisateur ne la voit jamais.
// ============================================================

export const runtime = "edge";

const SYSTEM_PROMPT = `Tu es le moteur narratif de Republica, une plateforme de simulation politique française.

Ta mission : générer un dossier politique INÉDIT pour un Président de la République français fictif.

EXIGENCES STRICTES :
- Sujet ANCRÉ DANS LE RÉEL français actuel (2025-2026), mais traité sous un angle ORIGINAL
- Données chiffrées plausibles, inspirées de sources réelles (INSEE, Cour des comptes, etc.)
- Trois scénarios CONTRADICTOIRES qui forcent un vrai arbitrage politique
- Quatre centres de pouvoir aux positions distinctes et crédibles
- Ton institutionnel, sobre, sérieux — style note administrative confidentielle
- Pas de caricature, pas d'humour, pas de jugement politique

VARIÉTÉ DEMANDÉE : Évite les sujets cliché (retraites, taxes carbone simples). Privilégie des angles inédits : conflits institutionnels, dilemmes éthiques nouveaux, tensions territoriales spécifiques, technologies émergentes, géopolitique européenne, transitions sectorielles, crises silencieuses.

EXEMPLES de sujets bienvenus (à NE PAS reprendre tels quels, juste pour l'esprit) :
- Statut juridique d'une langue régionale
- Pénurie de pédiatres dans le Massif central
- Réforme du secret professionnel notarial
- Tensions Corse / contrats EDF
- Quotas d'IA dans le service public
- Gestion des friches industrielles polluées
- Statut des aidants familiaux
- Avenir des sapeurs-pompiers volontaires
- Réforme du financement des partis politiques
- Tension France / Mayotte
- Encadrement du lobbying à l'Assemblée

FORMAT DE SORTIE OBLIGATOIRE : JSON strict, rien d'autre. Pas de texte avant ni après. Pas de markdown. Pas de \`\`\`json.

STRUCTURE EXACTE À RESPECTER :
{
  "id": "identifiant-court-en-kebab-case",
  "day": "J+XX (jour entre 10 et 90)",
  "tag": "Type de note (ex: Note d'arbitrage présidentiel, Dépêche entrante, Note interministérielle)",
  "title": "Titre du dossier (5-8 mots, clair, sobre)",
  "subtitle": "Sous-titre précisant le contexte (10-15 mots)",
  "urgent": false,
  "summary": {
    "contexte": "Description chiffrée du contexte (2-3 phrases, avec **données en gras** entre doubles astérisques)",
    "enjeu": "Description de l'enjeu (1-2 phrases)"
  },
  "sources": ["[1] Source crédible · date", "[2] Autre source · date"],
  "agents": [
    { "name": "Nom du centre de pouvoir", "color": "blue|red|gold|green|muted", "stance": "POSITION EN MAJUSCULES", "quote": "Citation de l'acteur (1 phrase, ton réaliste)" },
    { "name": "Deuxième acteur", "color": "...", "stance": "...", "quote": "..." },
    { "name": "Troisième acteur", "color": "...", "stance": "...", "quote": "..." },
    { "name": "Quatrième acteur", "color": "...", "stance": "...", "quote": "..." }
  ],
  "scenarios": [
    {
      "code": "SCÉNARIO A",
      "color": "blue",
      "title": "Titre court du scénario",
      "risk": "QUALIFICATION (ex: RISQUE ÉLEVÉ, PRAGMATIQUE, STRUCTUREL)",
      "desc": "Description concrète du scénario (1-2 phrases)",
      "tags": [["+ Acteur favorisé", true], ["+ Autre effet positif", true], ["− Acteur défavorisé", false]],
      "deltas": { "debt": 0.5, "confidence": 3, "parliament": 1, "tension": -0.2, "spread": 2, "liberal": 2 },
      "signature": "A"
    },
    {
      "code": "SCÉNARIO B",
      "color": "gold",
      "title": "...",
      "risk": "...",
      "desc": "...",
      "tags": [...],
      "deltas": { ..., "social": 2 },
      "signature": "B"
    },
    {
      "code": "SCÉNARIO C",
      "color": "muted",
      "title": "...",
      "risk": "...",
      "desc": "...",
      "tags": [...],
      "deltas": { ..., "europe": 2 },
      "signature": "C"
    }
  ],
  "consequences": {
    "A": {
      "title": "Titre des conséquences du scénario A",
      "narrative": "Description des conséquences (3-4 phrases, ton journalistique)",
      "events": [
        { "day": "+5", "label": "Premier événement", "color": "blue" },
        { "day": "+20", "label": "Deuxième événement", "color": "yellow" },
        { "day": "+45", "label": "Troisième événement", "color": "red" },
        { "day": "+70", "label": "Quatrième événement", "color": "green" }
      ]
    },
    "B": { ... même structure ... },
    "C": { ... même structure ... }
  }
}

RÈGLES POUR LES DELTAS :
- debt : variation de dette en points de PIB (ex: -0.3 = baisse, +1.2 = hausse forte)
- confidence : variation de confiance présidentielle (-10 à +10)
- parliament : variation du nombre de députés soutien (-10 à +10)
- tension : variation tension sociale (-2 à +2)
- spread : variation du spread OAT/Bund en points de base (-20 à +20)
- liberal, social, autorite, europe : score politique (0 à 3) — un seul axe par scénario en général

RÈGLES POUR LES COULEURS :
- blue = institutionnel, technocratique
- red = hostile, dangereux, autoritaire
- gold = équilibré, central, médiateur
- green = positif, écologique
- muted = neutre, secondaire

L'utilisateur va te donner les dossiers déjà vus lors des sessions précédentes. ÉVITE absolument les mêmes sujets et les mêmes angles.`;

export async function POST(request) {
  try {
    const { previousTitles = [] } = await request.json().catch(() => ({}));

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Clé API manquante côté serveur" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const exclusion = previousTitles.length > 0
      ? `\n\nDOSSIERS DÉJÀ JOUÉS (À ÉVITER ABSOLUMENT) :\n${previousTitles.map(t => `- ${t}`).join("\n")}`
      : "";

    const userMessage = `Génère un dossier politique inédit pour un Président de la République française en 2026. Le dossier doit être surprenant mais crédible.${exclusion}\n\nRetourne UNIQUEMENT le JSON, rien d'autre.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Erreur API Claude: ${response.status}`, details: errorText }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // On nettoie au cas où Claude ajoute des balises markdown malgré tout
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();

    let dossier;
    try {
      dossier = JSON.parse(cleaned);
    } catch (parseError) {
      return new Response(JSON.stringify({ error: "Réponse Claude non parseable", raw: cleaned.slice(0, 500) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ dossier }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur serveur", details: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
