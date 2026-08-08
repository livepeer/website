const SUBGRAPH_ID = "FE63YgkzcpVocxdCEyEYbvjYqEf2kb1A6daMYRxmejYC";

/** A rolling 24h window of what the network paid out, formatted for display. */
export type ComputeMetrics = {
  servicePayoutsUsd: string; // e.g. "$981.1"
  protocolRewardsUsd: string; // e.g. "$11.3K"
};

// Events are capped per request. If a window ever returns a full page we have
// no way to know how much was left behind, and an undercounted payout figure
// is worse than no figure — so that case is treated as a failure, not a total.
const EVENT_PAGE_SIZE = 1000;

const QUERY = `query ComputeMetrics($since: Int!, $limit: Int!) {
  protocol(id: "0") {
    lptPriceEth
  }
  # volumeETH and volumeUSD are the same fees denominated two ways, so their
  # ratio is the subgraph's own ETH/USD rate. Using it avoids a price feed and
  # keeps both figures on one consistent rate.
  days(first: 1, orderBy: date, orderDirection: desc) {
    volumeETH
    volumeUSD
  }
  # Service payouts: broadcaster fees actually redeemed by orchestrators.
  winningTicketRedeemedEvents(
    first: $limit
    where: { timestamp_gte: $since }
  ) {
    faceValueUSD
  }
  # Protocol rewards: inflationary LPT actually claimed, priced below.
  rewardEvents(first: $limit, where: { timestamp_gte: $since }) {
    rewardTokens
  }
}`;

type Response = {
  data?: {
    protocol: { lptPriceEth: string } | null;
    days: { volumeETH: string; volumeUSD: string }[];
    winningTicketRedeemedEvents: { faceValueUSD: string }[];
    rewardEvents: { rewardTokens: string }[];
  };
  errors?: unknown;
};

/** "$981.1", "$11.3K", "$1.2M" — the compact form the metric cards expect. */
function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(1)}`;
}

function sum(values: string[], pick: (v: string) => number): number {
  return values.reduce((total, value) => total + pick(value), 0);
}

/**
 * A rolling 24h of network payouts, or `null` when it can't be established.
 *
 * Null is a real outcome, not just an error path: the caller renders nothing
 * rather than a placeholder. These are figures people read while deciding
 * whether to buy hardware, so a stale or undercounted number would be worse
 * than an absent one. That is also why there is no FALLBACK constant here, in
 * contrast to lib/subgraph.ts — its stats are descriptive, these are money.
 */
export async function fetchComputeMetrics(): Promise<ComputeMetrics | null> {
  const apiKey = process.env.THEGRAPH_API_KEY;
  if (!apiKey) {
    // The gateway rejects unauthenticated reads, so without a key there is
    // nothing to show. Explicit so a missing env var is obvious in logs.
    console.warn("THEGRAPH_API_KEY unset — compute metrics omitted");
    return null;
  }

  try {
    const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    const res = await fetch(
      `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${SUBGRAPH_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: QUERY,
          variables: { since, limit: EVENT_PAGE_SIZE },
        }),
        // Hourly is well inside the cards' "24h" claim and keeps the page
        // static for almost every request.
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.warn(`Compute metrics request failed: ${res.status}`);
      return null;
    }

    const json: Response = await res.json();
    if (json.errors || !json.data) {
      console.warn("Compute metrics query returned errors");
      return null;
    }

    const { protocol, days, winningTicketRedeemedEvents, rewardEvents } =
      json.data;

    if (
      winningTicketRedeemedEvents.length >= EVENT_PAGE_SIZE ||
      rewardEvents.length >= EVENT_PAGE_SIZE
    ) {
      console.warn("Compute metrics hit the event page cap — omitting");
      return null;
    }

    const servicePayoutsUsd = sum(
      winningTicketRedeemedEvents.map((e) => e.faceValueUSD),
      Number
    );

    // Rewards are claimed in LPT, so they need pricing. lptPriceEth is quoted
    // in ETH and only refreshed each round; converting through the day's own
    // ETH/USD rate keeps it on the same basis as the fees above.
    const day = days[0];
    const volumeEth = Number(day?.volumeETH ?? 0);
    const volumeUsd = Number(day?.volumeUSD ?? 0);
    const ethUsd = volumeEth > 0 ? volumeUsd / volumeEth : 0;
    const lptUsd = Number(protocol?.lptPriceEth ?? 0) * ethUsd;

    if (!Number.isFinite(lptUsd) || lptUsd <= 0) {
      console.warn("Compute metrics could not price LPT — omitting");
      return null;
    }

    const protocolRewardsUsd =
      sum(
        rewardEvents.map((e) => e.rewardTokens),
        Number
      ) * lptUsd;

    return {
      servicePayoutsUsd: formatUsd(servicePayoutsUsd),
      protocolRewardsUsd: formatUsd(protocolRewardsUsd),
    };
  } catch (error) {
    console.warn("Compute metrics request threw", error);
    return null;
  }
}
