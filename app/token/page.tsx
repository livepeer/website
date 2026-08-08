import type { Metadata } from "next";

import {
  TokenExchangesSection,
  TokenHeroSection,
  type TokenContent,
} from "@/components/livepeer-ui/livepeer-token-sections";

/**
 * Copy mirrors the public-beta mockup.
 *
 * Authored here as a typed object rather than read from a CMS (CLAUDE.md →
 * Content). The type is local rather than the registry's `tokenContent`
 * contract: that contract describes an earlier token design — hero / role /
 * exchanges / delegate, each with an eyebrow and a pair of CTAs — which the
 * shipped mockup no longer matches.
 *
 * No live protocol stats, deliberately. The previous page led with circulating
 * supply and inflation figures; the new design explains what the token does
 * and where to get it, and a number that moves every block is not that.
 */
const token: TokenContent = {
  hero: {
    eyebrow: "$LPT",
    heading: "The token that powers the network.",
    description:
      "Livepeer Token (LPT) is part of the coordination mechanism behind the Livepeer network — aligning incentives between the GPU providers who do the work, the applications that need video, and the stakeholders who help secure the network.",
  },
  exchanges: {
    leadIn: "Get",
    trailing: "at…",
    links: [
      { name: "Binance", href: "https://www.binance.com/en/trade/LPT_USDT" },
      { name: "Coinbase", href: "https://www.coinbase.com/price/livepeer" },
      { name: "Kraken", href: "https://www.kraken.com/prices/livepeer" },
      {
        name: "Uniswap",
        href: "https://app.uniswap.org/tokens/ethereum/0x58b6a8a3302369daec383334672404ee733ab239",
      },
      { name: "OKX", href: "https://www.okx.com/price/livepeer-lpt" },
    ],
  },
  stake: {
    heading: "$LPT stake",
    // The mockup's version ends "Pool workers do not manage stake." Cut, for
    // the same reason the compute page's two-path framing went: pools are a
    // rounding error in practice, and naming them gives a marginal route equal
    // billing with the one people actually take.
    description:
      "Orchestrators need enough self-stake and delegated LPT to enter the active set. Delegators supply that stake and take a share of the fees the network pays out.",
    cta: {
      label: "View active orchestrators",
      href: "https://explorer.livepeer.org",
    },
  },
};

export const metadata: Metadata = {
  title: "Livepeer Token",
  description:
    "LPT coordinates the Livepeer network — aligning the GPU providers who do the work, the applications that need video, and the delegators who help secure it.",
};

export default function TokenPage() {
  return (
    <>
      <TokenHeroSection content={token.hero} />
      <TokenExchangesSection
        content={{ exchanges: token.exchanges, stake: token.stake }}
      />
    </>
  );
}
