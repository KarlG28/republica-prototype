// ============================================================
// ENDPOINT API · STATS COMMUNAUTAIRES
// Renvoie les % de chaque famille politique sur l'ensemble des joueurs.
// Cache "lazy" : si les stats datent de moins de 24h on les ressert,
// sinon on les recalcule, on les sauve, puis on les renvoie.
// ============================================================

export const runtime = "edge";

const MIN_SESSIONS = 30;
const CACHE_TTL_HOURS = 24;
const STATS_KEY = "global_family_distribution";

export async function GET() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      return jsonResponse({ error: "Configuration Airtable manquante" }, 500);
    }

    // 1. Chercher la ligne de cache
    const cached = await findCacheRecord(apiKey, baseId);

    // 2. Si cache valide (< 24h), on renvoie
    if (cached && cached.fields.updated_at) {
      const ageMs = Date.now() - new Date(cached.fields.updated_at).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      if (ageHours < CACHE_TTL_HOURS && cached.fields.data) {
        try {
          const parsed = JSON.parse(cached.fields.data);
          return jsonResponse({
            ready: parsed.total >= MIN_SESSIONS,
            total: parsed.total,
            distribution: parsed.distribution,
            cached: true,
            ageHours: Math.round(ageHours * 10) / 10,
          }, 200);
        } catch (e) {
          // JSON corrompu, on recalcule
        }
      }
    }

    // 3. Cache absent ou périmé : on recalcule
    const stats = await recalculateStats(apiKey, baseId);

    // 4. On sauve le cache
    await saveCache(apiKey, baseId, cached, stats);

    return jsonResponse({
      ready: stats.total >= MIN_SESSIONS,
      total: stats.total,
      distribution: stats.distribution,
      cached: false,
    }, 200);
  } catch (err) {
    return jsonResponse({ error: "Erreur serveur", details: err.message }, 500);
  }
}

async function findCacheRecord(apiKey, baseId) {
  const filterFormula = encodeURIComponent(`{key} = "${STATS_KEY}"`);
  const url = `https://api.airtable.com/v0/${baseId}/Stats?filterByFormula=${filterFormula}&maxRecords=1`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.records && data.records.length > 0 ? data.records[0] : null;
}

async function recalculateStats(apiKey, baseId) {
  // On récupère toutes les sessions, paginé (Airtable renvoie max 100/page)
  const distribution = {}; // { "Libéral": 5, "Écologiste": 3, ... }
  let total = 0;
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/Sessions`);
    url.searchParams.set("fields[]", "family");
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) throw new Error(`Erreur Airtable: ${response.status}`);
    const page = await response.json();

    for (const record of page.records || []) {
      const family = record.fields.family;
      if (family) {
        distribution[family] = (distribution[family] || 0) + 1;
        total += 1;
      }
    }
    offset = page.offset || null;
  } while (offset);

  return { total, distribution };
}

async function saveCache(apiKey, baseId, existingRecord, stats) {
  const fields = {
    key: STATS_KEY,
    data: JSON.stringify(stats),
    updated_at: new Date().toISOString(),
    total_sessions: stats.total,
  };

  if (existingRecord) {
    // UPDATE
    await fetch(
      `https://api.airtable.com/v0/${baseId}/Stats/${existingRecord.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ fields }),
      }
    );
  } else {
    // CREATE
    await fetch(
      `https://api.airtable.com/v0/${baseId}/Stats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ fields }),
      }
    );
  }
}

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
