import type { LivepeerOrgSite } from "@/components/livepeer-ui/contracts";

/**
 * The Livepeer Discord, read live rather than linked by hand.
 *
 * The site linked discord.gg/livepeer everywhere, and that vanity URL was
 * taken over — every link on the site was sending people to someone else's
 * server. Discord's guild widget answers with a current invite (whatever the
 * server's widget channel is set to) and a live presence count, so the site
 * reads that at request time and never hardcodes an invite again. Marco
 * (stronk-tech) suggested it. The one dependency is "Enable Server Widget"
 * staying on in the server settings; the fallback below covers that and any
 * outage, and it is the invite the widget answered with on 2026-09-06.
 *
 * Content that cannot fetch — markdown, Notion bodies, the primer — links to
 * livepeer.org/discord, a route here that redirects to the live invite, so
 * there is one owned URL rather than an invite copied into prose.
 */

const GUILD = "423160867534929930";
const WIDGET = `https://discord.com/api/guilds/${GUILD}/widget.json`;
/** Hourly: invites rarely change, and the count is decoration. */
const REVALIDATE = 3_600;

export const DISCORD_FALLBACK_INVITE = "https://discord.com/invite/WYTNB3w7";

export type Discord = {
  /** A current invite URL. */
  invite: string;
  /** Members online right now, or null when the widget could not be read. */
  online: number | null;
};

export async function getDiscord(): Promise<Discord> {
  try {
    const res = await fetch(WIDGET, { next: { revalidate: REVALIDATE } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const widget = (await res.json()) as {
      instant_invite?: string | null;
      presence_count?: number;
    };
    return {
      invite: widget.instant_invite || DISCORD_FALLBACK_INVITE,
      online:
        typeof widget.presence_count === "number"
          ? widget.presence_count
          : null,
    };
  } catch (error) {
    console.warn(
      `discord: ${WIDGET} failed (${String(error)}); serving the fallback invite.`
    );
    return { invite: DISCORD_FALLBACK_INVITE, online: null };
  }
}

/** The site object with every Discord link pointed at `invite`. */
export function withDiscordInvite(
  site: LivepeerOrgSite,
  invite: string
): LivepeerOrgSite {
  const swap = <T extends { href: string; label: string }>(link: T): T =>
    link.label === "Discord" ? { ...link, href: invite } : link;
  return {
    ...site,
    footerGroups: site.footerGroups.map((group) => ({
      ...group,
      links: group.links.map(swap),
    })),
    socialLinks: site.socialLinks.map(swap),
  };
}
