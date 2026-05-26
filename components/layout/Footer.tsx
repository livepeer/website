import Link from "next/link";
import { LivepeerLockup } from "@/components/icons/LivepeerLogo";
import {
  DiscordIcon,
  XIcon,
  GitHubIcon,
  ForumIcon,
} from "@/components/icons/SocialIcons";
import Container from "@/components/ui/Container";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { EXTERNAL_LINKS } from "@/lib/constants";

const footerNav = [
  {
    title: "Network",
    links: [
      { label: "Ecosystem", href: "/ecosystem" },
      { label: "Livepeer Token", href: "/token" },
      { label: "Delegate LPT", href: EXTERNAL_LINKS.explorer },
      { label: "Provide GPUs", href: "https://docs.livepeer.org/v1/orchestrators/guides/get-started" },
      { label: "Roadmap", href: "https://roadmap.livepeer.org/roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Primer", href: "/primer" },
      { label: "Blog", href: "/blog" },
      { label: "Foundation", href: "/foundation" },
      { label: "Brand", href: "/brand" },
      { label: "Documentation", href: "https://docs.livepeer.org" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: EXTERNAL_LINKS.discord },
      { label: "X / Twitter", href: EXTERNAL_LINKS.twitter },
      { label: "Forum", href: EXTERNAL_LINKS.forum },
    ],
  },
];

const socialLinks = [
  {
    label: "Discord",
    href: EXTERNAL_LINKS.discord,
    icon: <DiscordIcon className="h-5 w-5" />,
  },
  {
    label: "X / Twitter",
    href: EXTERNAL_LINKS.twitter,
    icon: <XIcon className="h-5 w-5" />,
  },
  {
    label: "GitHub",
    href: EXTERNAL_LINKS.github,
    icon: <GitHubIcon className="h-5 w-5" />,
  },
  {
    label: "Forum",
    href: EXTERNAL_LINKS.forum,
    icon: <ForumIcon className="h-5 w-5" />,
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-foreground/5 bg-background">
      <div className="divider-gradient absolute top-0 left-0 right-0" />
      <Container className="py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" aria-label="Livepeer home">
              <LivepeerLockup className="h-5 w-auto text-foreground" />
            </Link>
            <p className="mt-4 text-sm text-foreground/50">
              The open network for real-time AI video.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/40 transition-colors hover:text-foreground"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerNav.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-foreground/80">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-foreground/40 transition-colors hover:text-foreground"
                        >
                          {link.label}
                          <svg
                            className="h-3 w-3 text-foreground/30"
                            fill="none"
                            viewBox="0 0 12 12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path
                              d="M3.5 2H10v6.5M10 2L2 10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-foreground/40 transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col-reverse items-center gap-6 border-t border-foreground/5 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-foreground/30">
            &copy; {new Date().getFullYear()} Livepeer Foundation. All rights
            reserved.
          </p>
          <ThemeToggle />
        </div>
      </Container>
    </footer>
  );
}
