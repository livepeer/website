import { NextRequest, NextResponse } from "next/server";
import { PmtHouseError } from "@pymthouse/builder-api";
import { createPmtHouseClientFromEnv } from "@pymthouse/builder-api/env";
import { formatWeiToUsd } from "@pymthouse/builder-api/format";
import { readSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type Period = "24h" | "7d" | "30d" | "3m";

function resolvePeriod(value: string | null): Period {
  if (value === "24h" || value === "7d" || value === "30d" || value === "3m") {
    return value;
  }
  return "30d";
}

function getPeriodWindow(period: Period): {
  days: number;
  startDate: string;
  endDate: string;
} {
  const days = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    days,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function distributeCounts(total: number, bucketCount: number): number[] {
  if (bucketCount <= 0) return [];
  const base = Math.floor(total / bucketCount);
  const remainder = total % bucketCount;
  return Array.from({ length: bucketCount }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

function formatDateLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const session = await readSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const period = resolvePeriod(request.nextUrl.searchParams.get("period"));
  const { days, startDate, endDate } = getPeriodWindow(period);

  try {
    const client = createPmtHouseClientFromEnv();
    const usage = await client.getUsage({
      startDate,
      endDate,
      groupBy: "user",
    });

    const totalRequests = usage.totals.requestCount;
    const totalFeeWei = usage.totals.totalFeeWei;
    const freeTierLimit = 10_000;
    const freeTierUsed = Math.min(totalRequests, freeTierLimit);
    const paymthouseRequests = Math.max(totalRequests - freeTierUsed, 0);
    const dailyBuckets = distributeCounts(totalRequests, days);

    const today = new Date();
    const daily = dailyBuckets.map((requests, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - 1 - index));
      return {
        date: formatDateLabel(date),
        freeTier: Math.min(requests, Math.max(freeTierLimit - index, 0)),
        paymthouse: requests,
        livepeerCloud: 0,
        ethWallet: 0,
      };
    });

    const tokenRows =
      session.apiTokens.length > 0
        ? session.apiTokens.map((token) => ({
            tokenId: token.id,
            tokenName: token.name,
            requests: 0,
            lastUsed: token.lastUsedAt
              ? token.lastUsedAt.slice(0, 10)
              : token.createdAt.slice(0, 10),
            spendDisplay: "$0.00",
          }))
        : [
            {
              tokenId: "default",
              tokenName: "Default",
              requests: totalRequests,
              lastUsed: "recently",
              spendDisplay: formatWeiToUsd(totalFeeWei),
            },
          ];

    const response = {
      period,
      summary: {
        requests: totalRequests,
        spendDisplay: formatWeiToUsd(totalFeeWei),
        freeTierUsed,
        freeTierLimit,
        freeTierResetIn: "in 6h",
      },
      daily,
      bySigner: [
        {
          signer: "freeTier",
          label: "Free tier",
          requests: freeTierUsed,
          percent: totalRequests > 0 ? Math.round((freeTierUsed / totalRequests) * 100) : 0,
          spendDisplay: "$0.00",
          color: "green",
        },
        {
          signer: "paymthouse",
          label: "Paymthouse",
          requests: paymthouseRequests,
          percent:
            totalRequests > 0 ? Math.round((paymthouseRequests / totalRequests) * 100) : 0,
          spendDisplay: formatWeiToUsd(totalFeeWei),
          color: "violet",
        },
        {
          signer: "livepeerCloud",
          label: "Livepeer Cloud",
          requests: 0,
          percent: 0,
          spendDisplay: "$0.00",
          color: "blue",
        },
        {
          signer: "ethWallet",
          label: "ETH wallet",
          requests: 0,
          percent: 0,
          spendDisplay: "$0.00",
          color: "neutral",
        },
      ],
      byToken: tokenRows,
      byUser: usage.byUser ?? [],
      rawUsage: usage,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof PmtHouseError) {
      return NextResponse.json(
        {
          error: error.code,
          error_description: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Usage route failed", error);
    return NextResponse.json(
      {
        error: "usage_fetch_failed",
      },
      { status: 500 },
    );
  }
}
