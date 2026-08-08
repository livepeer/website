export type AgentConsoleLink = { _key?: string; label: string; href: string }

export interface AgentConsoleShell {
  _id: string
  homeAriaLabel: string
  navigation: (AgentConsoleLink & { external: boolean })[]
  userMenu: {
    accountLabel: string
    manageProfileLabel: string
    developerDocsLabel: string
    termsLabel: string
    helpLabel: string
    logoutLabel: string
  }
  auth: {
    dialogLabel: string
    title: string
    description: string
    googleLabel: string
    discordLabel: string
    emailDividerLabel: string
    emailInputLabel: string
    emailPlaceholder: string
    continueLabel: string
  }
}

export interface AgentConsoleUser {
  username: string
  email: string
}

export type EditorialLink = { _key?: string; label: string; href: string }
export type LivepeerOrgPageSlug =
  | "home"
  | "token"
  | "foundation"
  | "livepeer-agent"
  | "playbook-library"
  | "ecosystem"
  | "provide-gpu-compute"

export interface LivepeerOrgSite {
  _id: "livepeerOrgSite"
  homeHref: string
  menuLinks: EditorialLink[]
  footerTagline: string
  footerGroups: { _key: string; title: string; links: EditorialLink[] }[]
  socialLinks: (EditorialLink & {
    service: "discord" | "x" | "github" | "website"
  })[]
  copyright: string
}

export interface EcosystemEditorialApp {
  _key: string
  name: string
  domain: string
  href: string
  description: string
  image: string
  tags: string[]
}

export interface LivepeerOrgPage {
  _id: string
  page: LivepeerOrgPageSlug
  seoTitle: string
  seoDescription?: string
  tokenContent?: {
    hero: {
      eyebrow: string
      metadata: string
      heading: string
      description: string
      illustrationUrl?: string
      illustrationAlt?: string
      primaryCta: EditorialLink
      secondaryCta: EditorialLink
    }
    role: {
      eyebrow: string
      heading: string
      introduction: string
      paragraphs: string[]
      illustrationUrl?: string
      illustrationAlt?: string
    }
    exchanges: {
      eyebrow: string
      heading: string
      links: EditorialLink[]
    }
    delegate: {
      eyebrow: string
      heading: string
      description: string
      cta: EditorialLink
    }
  }
  foundationContent?: {
    hero: {
      eyebrow: string
      heading: string
      description: string
      illustrationUrl?: string
      illustrationAlt?: string
    }
    about: {
      eyebrow: string
      heading: string
      description: string
      establishedLink: EditorialLink
      illustrationUrl?: string
      illustrationAlt?: string
    }
    responsibilities: {
      eyebrow: string
      heading: string
      items: {
        _key: string
        heading: string
        description: string
      }[]
      cta: EditorialLink
    }
    project: {
      eyebrow: string
      heading: string
      paragraphs: string[]
      feesLink: EditorialLink
      illustrationUrl?: string
      illustrationAlt?: string
    }
  }
  homeContent?: {
    hero: {
      heading: string
      accent: string
      primaryCta: EditorialLink
      secondaryCta: EditorialLink
    }
    agentFeature: {
      description: string
      installCta: EditorialLink
      libraryCta: EditorialLink
    }
    providerCta: { heading: string; description: string; cta: EditorialLink }
  }
  agentContent?: {
    hero: {
      heading: string
      description: string
      serverUrl: string
      signInCta: EditorialLink
      createAccountCta: EditorialLink
    }
    access: { heading: string; description: string; cta: EditorialLink }
    capabilities: { heading: string; cta: EditorialLink }
    playbooks: { heading: string; description: string; cta: EditorialLink }
  }
  libraryContent?: {
    heading: string
    description: string
    searchPlaceholder: string
    allCategoryLabel: string
    emptyMessage: string
    footerHeading: string
  }
  ecosystemContent?: {
    heading: string
    description: string
    submitLabel: string
    searchPlaceholder: string
    emptyMessage: string
    apps: EcosystemEditorialApp[]
    submission: {
      heading: string
      description: string
      steps: { _key: string; heading: string; description: string }[]
      templatePath: string
      template: string
      closeLabel: string
      githubCta: EditorialLink
    }
  }
  earnContent?: {
    earnings: {
      servicePayoutsLabel: string
      protocolRewardsLabel: string
      periodLabel: string
    }
    hero: { heading: string; description: string; cta: EditorialLink }
    pathsHeading: string
    pathsDescription: string
    paths: {
      _key: string
      heading: string
      fit: string
      description: string
      icon: "cable" | "sparkles" | "server-cog"
      requirements: string[]
      note: string
      cta: EditorialLink
    }[]
    baselineHeading: string
    baselineDescription: string
    baseline: {
      _key: string
      heading: string
      description: string
      icon: "cpu" | "server" | "network" | "dollar"
    }[]
    arbitrum: {
      heading: string
      description: string
      imageAlt: string
      disclaimer: string
      cta: EditorialLink
    }
    stake: { heading: string; description: string; cta: EditorialLink }
  }
}

export interface WaitlistPageContent {
  _id: string
  metadata: { title: string; description: string }
  backgroundHero: { brandAriaLabel: string; agentLabel: string }
  panel: {
    brandAriaLabel: string
    agentLabel: string
    heading: string
    description: string
    joinedToast: string
    referralPrompt: string
  }
  signupForm: {
    label: string
    emailPlaceholder: string
    submitAriaLabel: string
  }
  statusCard: { positionLabel: string; referralsLabel: string }
  referralLink: { copyAriaLabel: string; copiedToast: string }
  leaderboard: {
    heading: string
    personColumnLabel: string
    referralsColumnLabel: string
    currentUserLabel: string
  }
}
