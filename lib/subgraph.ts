const SUBGRAPH_ID = "FE63YgkzcpVocxdCEyEYbvjYqEf2kb1A6daMYRxmejYC";

/** Shape of the formatted protocol data used by the Primer page */
export type ProtocolStats = {
  inflationRate: string; // e.g. "0.0628%"
  inflationChange: string; // e.g. "0.00005%"
  totalSupply: string; // e.g. "50,476,551.95"
  totalStaked: string; // e.g. "26,662,719.24"
  participationRate: string; // e.g. "52.82%"
  mintableTokens: string; // e.g. "31,654.81"
  delegatorsCount: string; // e.g. "2,503"
};

/** Hardcoded fallbacks — used when the subgraph is unreachable */
export const FALLBACK_STATS: ProtocolStats = {
  inflationRate: "0.0224%",
  inflationChange: "0.00005%",
  totalSupply: "27,440,696.99",
  totalStaked: "12,199,512.94",
  participationRate: "44.46%",
  mintableTokens: "6,146.72",
  delegatorsCount: "5,308",
};

const QUERY = `{
  protocol(id: "0") {
    inflation
    inflationChange
    participationRate
    totalSupply
    totalActiveStake
    currentRound {
      mintableTokens
      delegatorsCount
    }
  }
}`;

type SubgraphResponse = {
  data: {
    protocol: {
      inflation: string;
      inflationChange: string;
      participationRate: string;
      totalSupply: string;
      totalActiveStake: string;
      currentRound: {
        mintableTokens: string;
        delegatorsCount: string;
      };
    };
  };
};

/**
 * Format a decimal LPT string (e.g. "50476551.949818955527504532") to
 * a human-readable number with commas and 2 decimal places.
 */
function formatLPT(value: string): string {
  const num = parseFloat(value);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Convert a protocol inflation/inflationChange value to a percentage string.
 * The protocol stores these as integer values where dividing by 10^7 yields
 * the percentage. e.g. 627500 → 0.0628%, 500 → 0.00005%
 */
function formatInflation(raw: string): string {
  const pct = parseInt(raw, 10) / 1e7;
  // Use enough decimal places to show meaningful digits
  if (pct < 0.001) return pct.toFixed(5) + "%";
  if (pct < 0.01) return pct.toFixed(4) + "%";
  return pct.toFixed(4) + "%";
}

function formatInflationChange(raw: string): string {
  const pct = parseInt(raw, 10) / 1e7;
  return pct.toFixed(5) + "%";
}

/**
 * Convert participation rate ratio (0-1 decimal string) to percentage.
 * e.g. "0.5282199003887097871217892214956749" → "52.82%"
 */
function formatParticipation(ratio: string): string {
  const pct = parseFloat(ratio) * 100;
  return pct.toFixed(2) + "%";
}

/**
 * Fetch live protocol stats from the Livepeer subgraph.
 * Returns FALLBACK_STATS if the request fails.
 */
export async function fetchProtocolStats(): Promise<ProtocolStats> {
  try {
    const apiKey = process.env.THEGRAPH_API_KEY;
    const url = apiKey
      ? `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${SUBGRAPH_ID}`
      : `https://gateway.thegraph.com/api/subgraphs/id/${SUBGRAPH_ID}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`Subgraph request failed: ${res.status}`);
      return FALLBACK_STATS;
    }

    const json: SubgraphResponse = await res.json();
    const protocol = json.data?.protocol;

    if (!protocol) {
      console.warn("Subgraph returned no protocol data");
      return FALLBACK_STATS;
    }

    return {
      inflationRate: formatInflation(protocol.inflation),
      inflationChange: formatInflationChange(protocol.inflationChange),
      totalSupply: formatLPT(protocol.totalSupply),
      totalStaked: formatLPT(protocol.totalActiveStake),
      participationRate: formatParticipation(protocol.participationRate),
      mintableTokens: formatLPT(protocol.currentRound.mintableTokens),
      delegatorsCount: parseInt(
        protocol.currentRound.delegatorsCount,
        10
      ).toLocaleString("en-US"),
    };
  } catch (error) {
    console.warn("Failed to fetch subgraph data:", error);
    return FALLBACK_STATS;
  }
}
