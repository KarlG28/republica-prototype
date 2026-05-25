// ============================================================
// ENDPOINT API · ENREGISTREMENT D'UNE SESSION
// Stocke les données du joueur dans Airtable.
// Peut être appelé deux fois :
//  1. À la fin du mandat (anonyme, pas d'email)
//  2. Si le joueur soumet son email (UPDATE de la ligne)
// ============================================================

export const runtime = "edge";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, family, adjective, decisions, urgentIdx, indicators, scores, email } = body;

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      return jsonResponse({ error: "Configuration Airtable manquante" }, 500);
    }

    if (!sessionId) {
      return jsonResponse({ error: "sessionId requis" }, 400);
    }

    // Si on a un email, on cherche d'abord la ligne existante par sessionId pour l'UPDATE
    if (email) {
      const existingRecord = await findRecordBySessionId(apiKey, baseId, sessionId);

      if (existingRecord) {
        // UPDATE : on ajoute l'email à la session existante
        const updateResponse = await fetch(
          `https://api.airtable.com/v0/${baseId}/Sessions/${existingRecord.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              fields: {
                email,
                subscribed_at: new Date().toISOString(),
              },
            }),
          }
        );
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text().catch(() => "");
          return jsonResponse({ error: "Erreur UPDATE Airtable", details: errorText.slice(0, 200) }, 500);
        }
        return jsonResponse({ success: true, mode: "updated" }, 200);
      }
      // Pas de session trouvée : on crée une nouvelle ligne avec tout
    }

    // CREATE : nouvelle ligne
    const fields = {
      session_id: sessionId,
      created_at: new Date().toISOString(),
    };
    if (family) fields.family = family;
    if (adjective) fields.adjective = adjective;
    if (decisions) fields.decisions = JSON.stringify(decisions);
    if (typeof urgentIdx === "number") fields.urgent_idx = urgentIdx;
    if (indicators) fields.final_indicators = JSON.stringify(indicators);
    if (scores) fields.final_scores = JSON.stringify(scores);
    if (email) {
      fields.email = email;
      fields.subscribed_at = new Date().toISOString();
    }

    const createResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/Sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text().catch(() => "");
      return jsonResponse({ error: "Erreur CREATE Airtable", details: errorText.slice(0, 200) }, 500);
    }

    return jsonResponse({ success: true, mode: "created" }, 200);
  } catch (err) {
    return jsonResponse({ error: "Erreur serveur", details: err.message }, 500);
  }
}

async function findRecordBySessionId(apiKey, baseId, sessionId) {
  const filterFormula = encodeURIComponent(`{session_id} = "${sessionId}"`);
  const url = `https://api.airtable.com/v0/${baseId}/Sessions?filterByFormula=${filterFormula}&maxRecords=1`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.records && data.records.length > 0 ? data.records[0] : null;
}

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
