"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { raleway } from "@/lib/fonts";
import type { ProtocolStats } from "@/lib/subgraph";
import InflationMeter from "@/components/primer/InflationMeter";
import MintingDiagram from "@/components/primer/MintingDiagram";

/**
 * Livepeer 10-Minute Primer
 *
 * Faithful recreation of the original livepeer.org/primer with polish:
 * - Contents dropdown with chapter navigation
 * - Section-based background color transitions via IntersectionObserver
 * - Editorial side-by-side layout with rotated section headings
 * - All original SVG illustrations
 */

const IMG = "/images/primer";

const CHAPTERS = [
  { id: "intro", label: "Introduction", bg: "#97f2ef" },
  { id: "what", label: "What is Livepeer?", bg: "#c8b8f0" },
  { id: "who", label: "Who is Livepeer for?", bg: "#ffca71" },
  { id: "how", label: "How Does Livepeer Work?", bg: "#95f58c" },
  { id: "orchestrators", label: "Orchestrators", bg: "#a6adeb" },
  { id: "token", label: "Livepeer Token", bg: "#d4b9e4" },
  { id: "delegators", label: "Delegators", bg: "#ffc37b" },
  { id: "rewarding", label: "Rewarding Participation", bg: "#ffa3a3" },
  { id: "rounds", label: "Rounds & Inflation", bg: "#97f2ef" },
  { id: "involved", label: "Get Involved", bg: "#95f58c" },
] as const;

export default function PrimerContent({ stats }: { stats: ProtocolStats }) {
  const [bgColor, setBgColor] = useState<string>(CHAPTERS[0].bg);
  const [tocOpen, setTocOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for background color transitions
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-chapter");
            const chapter = CHAPTERS.find((c) => c.id === id);
            if (chapter) setBgColor(chapter.bg);
          }
        }
      },
      { threshold: 0.15, rootMargin: "-10% 0px -10% 0px" }
    );

    document.querySelectorAll("[data-chapter]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Close TOC on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(e.target as Node)) {
        setTocOpen(false);
      }
    };
    if (tocOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tocOpen]);

  const scrollTo = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setTocOpen(false);
    },
    []
  );

  return (
    <div
      className="primer relative min-h-screen"
      style={{
        color: "#131418",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      {/* Fixed background with smooth color transition */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: bgColor,
          transition: "background-color 0.8s ease",
        }}
      />


      {/* ─── Fixed Contents button — top right, aligned with nav bar ─── */}
      <div className="fixed top-[19px] right-4 z-50 md:top-[18px] md:right-6" ref={tocRef}>
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className={`flex items-center justify-center uppercase transition-all
            h-12 w-12 rounded-full border border-white/40 bg-white/20 backdrop-blur-2xl shadow-[0_2px_16px_rgba(0,0,0,0.1)]
            md:h-[44px] md:w-auto md:gap-3 md:px-5 md:border-[1.5px] md:border-black md:bg-[#a6adeb]/80 md:backdrop-blur-xl ${tocOpen ? "md:shadow-[0_0_#000]" : "md:shadow-[3px_3px_#000]"} md:hover:shadow-none`}
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "16px",
            lineHeight: "19px",
          }}
        >
          {/* Mobile: book/chapters icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="md:hidden"
          >
            <path
              d="M2 2.5C2 2.5 4 1.5 6.5 1.5C9 1.5 9 2.5 9 2.5V15.5C9 15.5 9 14.5 6.5 14.5C4 14.5 2 15.5 2 15.5V2.5Z"
              stroke="#131418"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 2.5C9 2.5 9 1.5 11.5 1.5C14 1.5 16 2.5 16 2.5V15.5C16 15.5 14 14.5 11.5 14.5C9 14.5 9 15.5 9 15.5V2.5Z"
              stroke="#131418"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Desktop: full label */}
          <span className="hidden md:inline">CHAPTERS</span>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className="hidden transition-transform md:block"
            style={{
              transform: tocOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="#131418"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dropdown — opens downward */}
        {tocOpen && (
          <div
            className="absolute top-[calc(100%+8px)] right-0 w-[300px] rounded-lg border-[1.5px] border-black bg-white p-2 shadow-lg"
            style={{
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            {CHAPTERS.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => scrollTo(ch.id)}
                className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors hover:bg-black/5"
              >
                <span
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black/60"
                  style={{ backgroundColor: ch.bg }}
                >
                  {i + 1}
                </span>
                <span className="text-[15px] font-medium text-black/80">
                  {ch.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Hero ─── */}
      <section
        data-chapter="intro"
        id="intro"
        className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6"
      >
        <div className="flex flex-col items-center gap-[10px]">
          <div
            className="text-center uppercase"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "clamp(21px, 3vw, 28px)",
              lineHeight: "38px",
              fontWeight: 100,
              transform: "rotate(2deg)",
            }}
          >
            A 10-MINUTE PRIMER
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/hero-illustration.svg`}
            alt="Livepeer Primer"
            className="w-[320px] lg:w-[550px]"
          />
        </div>

        {/* Decorative side elements — flush with bottom, hidden on mobile */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/hero-right.svg`}
          alt=""
          className="pointer-events-none absolute bottom-0 right-0 hidden w-[20%] lg:block lg:w-[30%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/hero-left.svg`}
          alt=""
          className="pointer-events-none absolute bottom-0 left-0 hidden w-[10%] lg:block lg:w-[20%]"
        />

        {/* Scroll arrow — above the fold with bounce animation */}
        <button
          onClick={() => scrollTo("intro-content")}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          style={{ animation: "bounceDown 2s ease-in-out infinite" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/arrow-down.svg`}
            alt="Scroll down"
            className="w-9 opacity-60"
          />
        </button>
      </section>

      {/* ─── Content ─── */}
      <div className="overflow-hidden pb-24 pt-24">
        {/* ════════════════════════════════════════════════
            INTRODUCTION
           ════════════════════════════════════════════════ */}
        <div id="intro-content" data-chapter="intro">
          {/* Image left, text right — contained */}
          <FlexSection reverse>
            <TextBlock>
              <Text28>
                Today, roughly 80% of all internet bandwidth is consumed by
                video.
              </Text28>
              <Text18>
                It&rsquo;s already the dominant share of all internet traffic
                &mdash; and AI is making it even more dominant. A growing
                wave of applications now use AI models to create, transform,
                and interpret video in real-time, requiring continuous GPU
                inference on every frame.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/pie-chart.svg`}
              alt="AI video is the fastest-growing GPU workload"
              className="w-full max-w-[420px] lg:max-w-[500px]"
            />
          </FlexSection>

          {/* Text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                But running AI on video is compute-intensive &mdash; and
                expensive. Real-time video AI requires continuous{" "}
                <strong>GPU inference</strong> &mdash; processing every frame
                through AI models as it arrives, with no room for delay.
                Centralized GPU clouds aren&rsquo;t built for this. They&rsquo;re
                optimized for batch processing &mdash; not the continuous,
                low-latency inference that real-time video demands.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/transcoding-in.svg`}
              alt="Video AI processing"
              className="w-full max-w-[750px] flex-shrink-0"
            />
          </FlexSection>

          {/* Image left, text right */}
          <FlexSection reverse>
            <TextBlock className="max-w-[360px]">
              <Text18>
                AI-generated worlds, real-time video analysis, AI-driven
                avatars and agents &mdash; demand for these applications is
                accelerating. The developers building them &mdash; creative
                technologists, startups, independent builders &mdash; need GPU
                infrastructure that&rsquo;s fast, affordable, and always
                available.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/bob_gpu.svg`}
              alt="GPU compute demand"
              className="w-full max-w-[260px] flex-shrink-0"
            />
          </FlexSection>

          <ContentBlock className="mb-40 !max-w-[580px]">
            <Text28 center>
              What if there were an open network purpose-built for
              this?
            </Text28>
          </ContentBlock>
        </div>

        {/* ════════════════════════════════════════════════
            WHAT IS LIVEPEER?
           ════════════════════════════════════════════════ */}
        <div data-chapter="what" id="what">
          <ContentBlock className="mb-16">
            <SectionHeading rotate={-6}>What is Livepeer?</SectionHeading>
          </ContentBlock>

          {/* Text left, image right — contained */}
          <FlexSection className="mb-40">
            <TextBlock>
              <Text18>
                <strong>Livepeer is a specialized GPU network for real-time
                video AI.</strong> It coordinates a global pool of GPU
                providers to deliver low-latency AI inference on video streams
                &mdash; frame-by-frame processing, not batch jobs.
              </Text18>
              <Text18>
                The network is open-source, built on Ethereum for coordination
                and permissionless access, and 60&ndash;85% cheaper than
                centralized cloud alternatives.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/livepeer-ethereum.svg`}
              alt="Livepeer and Ethereum"
              className="w-full max-w-[500px]"
            />
          </FlexSection>
        </div>

        {/* ════════════════════════════════════════════════
            WHO IS LIVEPEER FOR?
           ════════════════════════════════════════════════ */}
        <div data-chapter="who" id="who">
          <ContentBlock className="mb-16">
            <SectionHeading rotate={3}>
              Who is Livepeer for?
            </SectionHeading>
          </ContentBlock>

          <ContentBlock className="mb-40">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10 md:max-w-[740px] mx-auto">
              <PersonaCard
                icon={`${IMG}/icon-developers.svg`}
                title="Developers"
                description="building real-time AI video applications — generative worlds, live video analysis, AI avatars, interactive streaming — can use Livepeer to access GPU compute via simple API calls."
              />
              <PersonaCard
                icon={`${IMG}/icon-gpu.svg`}
                title="GPU Providers"
                description="contribute GPU compute to the network by running nodes. Anyone with capable hardware can join and earn fees for running AI inference workloads."
              />
            </div>
          </ContentBlock>
        </div>

        {/* ════════════════════════════════════════════════
            HOW DOES LIVEPEER WORK?
           ════════════════════════════════════════════════ */}
        <div data-chapter="how" id="how">
          <ContentBlock className="mb-16">
            <SectionHeading rotate={-3}>
              How does Livepeer work?
            </SectionHeading>
          </ContentBlock>

          {/* Meet Alice — contained, image left, text right */}
          <FlexSection reverse>
            <TextBlock maxW="350px">
              <Text28>Meet: Alice</Text28>
              <Text18>
                Alice is a developer building an interactive world model
                &mdash; an AI-generated environment that responds to user
                input in real-time, rendering 30&ndash;60 frames per second
                of generated video, continuously.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/alice.svg`}
              alt="Alice"
              className="w-full max-w-[330px]"
            />
          </FlexSection>

          {/* Meet Bob — contained, text left, image right */}
          <FlexSection>
            <TextBlock maxW="350px">
              <Text28>Meet: Bob</Text28>
              <Text18>
                Bob is a gamer. He&rsquo;s exploring Alice&rsquo;s world model
                &mdash; an AI-generated environment that reacts to his every
                move in real-time.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/bob.svg`}
              alt="Bob"
              className="w-full max-w-[420px]"
            />
          </FlexSection>

          {/* Devices — image flush left, text right */}
          <FlexSection flush="left" reverse>
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                When Bob plays, every input he makes triggers a new frame of
                AI-generated video. Alice&rsquo;s app sends these requests to
                Livepeer, which routes the GPU-intensive work across the
                network and returns generated frames in real-time &mdash;
                inference, encoding, and delivery in one pipeline.
              </Text18>
              <Text18>
                Bob&rsquo;s experience is seamless. But behind the scenes,
                Alice needs massive GPU compute to keep up &mdash; and her
                app is gaining users fast. How does Livepeer make this
                affordable?
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/devices.svg`}
              alt="Multiple devices"
              className="w-full max-w-[850px] flex-shrink-0"
            />
          </FlexSection>

          {/* Two key actors — text left, image right — contained */}
          <FlexSection className="mb-40">
            <TextBlock>
              <Text18>
                There are two key roles in the Livepeer protocol that make
                this work:{" "}
                <strong>Orchestrators</strong> (GPU providers who run the
                compute) and{" "}
                <strong>Delegators</strong> (token holders who help secure
                the network).
              </Text18>
              <Text18>
                Let&rsquo;s start with Orchestrators.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/actors.svg`}
              alt="Orchestrators and Delegators"
              className="w-full max-w-[580px]"
            />
          </FlexSection>
        </div>

        {/* ════════════════════════════════════════════════
            ORCHESTRATORS
           ════════════════════════════════════════════════ */}
        <div data-chapter="orchestrators" id="orchestrators">
          <ContentBlock className="mb-16">
            <SectionHeading rotate={-3}>Orchestrators</SectionHeading>
          </ContentBlock>

          <ContentBlock className="mb-16">
            <TextBlock maxW="700px">
              <Text18>
                In the Livepeer protocol, GPU providers are called{" "}
                <strong>orchestrators</strong>. They run the AI models
                &mdash; image generation, video analysis, style transfer,
                depth estimation &mdash; and earn fees in ETH or stablecoins
                for the work they perform. Anyone with capable GPU hardware
                can join the network and become an orchestrator.
              </Text18>
            </TextBlock>
          </ContentBlock>

          {/* Orchestration diagram — full bleed */}
          <ContentBlock className="mb-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/orchestration.svg`}
              alt="Orchestration diagram"
              className="w-full max-w-[1000px]"
            />
          </ContentBlock>

          <ContentBlock className="mb-40">
            <TextBlock maxW="700px">
              <Text18>
                Sounds good, right? But wait, there&rsquo;s a catch! In order
                to earn the right to do this type of work on the network, you
                must first earn or acquire <strong>Livepeer Token</strong>,
                also known as <strong>LPT</strong>.
              </Text18>
            </TextBlock>
          </ContentBlock>
        </div>

        {/* ════════════════════════════════════════════════
            LIVEPEER TOKEN
           ════════════════════════════════════════════════ */}
        <div data-chapter="token" id="token" className="relative">
          <ContentBlock className="mb-8">
            {/* Decorative SVGs — hidden on mobile */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/token-decoration-1.svg`}
              alt=""
              className="pointer-events-none absolute -left-16 top-0 hidden lg:block"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/token-decoration-2.svg`}
              alt=""
              className="pointer-events-none absolute -right-16 top-0 hidden lg:block"
            />
            <SectionHeading rotate={3}>Livepeer Token</SectionHeading>
          </ContentBlock>

          <ContentBlock className="mb-40">
            <TextBlock maxW="640px">
              <Text18>
                The purpose of the Livepeer token (LPT) is to coordinate,
                bootstrap, and incentivize participants to make sure the
                Livepeer network is as cheap, effective, secure, reliable and
                useful as possible. In the Livepeer protocol, LPT is required
                to perform AI inference work on the network. The more LPT you
                own, the more work you&rsquo;re able to perform on the network
                in exchange for fees.
              </Text18>
              <Text18>
                As the network&rsquo;s usage grows, so does the demand for
                orchestrators and thus LPT.
              </Text18>
              <Text18>
                Of course, not everyone has the expertise required to perform
                the job of an Orchestrator. It requires serious technical
                knowledge and can be a full-time job. What if you&rsquo;re a
                Livepeer tokenholder but don&rsquo;t have the time or
                expertise to run the necessary infrastructure 24x7?
              </Text18>
              <Text18>
                There&rsquo;s another set of actors in the Livepeer protocol
                who play a less active albeit equally important role within
                the protocol &mdash; <strong>Livepeer Delegators</strong>.
              </Text18>
            </TextBlock>
          </ContentBlock>
        </div>

        {/* ════════════════════════════════════════════════
            DELEGATORS
           ════════════════════════════════════════════════ */}
        <div data-chapter="delegators" id="delegators">
          {/* Image flush left, text right */}
          <FlexSection flush="left" reverse className="mb-40">
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <SectionHeading rotate={-3}>Delegators</SectionHeading>
              <Text18>
                Delegators are Livepeer tokenholders who participate in the
                network by <strong>staking</strong> their tokens towards
                orchestrators who they believe are doing good and honest work.
                You can think about staking like putting a deposit down. When
                you stake, your tokens become locked up for a period of time
                and then you can take them back or stake them to a different
                Orchestrator. Doing this helps ensure that the network is more
                secure.
              </Text18>
              <div className="text-[22px] leading-relaxed lg:text-[28px] lg:leading-relaxed">
                You may be wondering, why would a Livepeer tokenholder choose
                stake their tokens? What&rsquo;s in it for them?
              </div>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/staking.svg`}
              alt="Delegator illustration"
              className="w-full max-w-[790px] flex-shrink-0"
            />
          </FlexSection>
        </div>

        {/* ════════════════════════════════════════════════
            REWARDING PARTICIPATION
           ════════════════════════════════════════════════ */}
        <div data-chapter="rewarding" id="rewarding">
          <ContentBlock className="mb-16">
            <SectionHeading rotate={3}>
              Rewarding Participation
            </SectionHeading>
          </ContentBlock>

          {/* Text left, image right — contained */}
          <FlexSection>
            <TextBlock>
              <Text18>
                When a developer pays fees for AI inference on the network,
                both orchestrators and delegators earn a portion of those fees
                as a reward for ensuring a high-quality and secure network.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/fees.svg`}
              alt="Fee distribution"
              className="w-full max-w-[510px]"
            />
          </FlexSection>

          {/* Image flush left, text right */}
          <div className="mb-20 flex flex-col items-center gap-8 overflow-hidden lg:flex-row-reverse lg:items-center lg:gap-6">
            <TextBlock className="px-6 lg:min-w-[380px] lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                In addition to earning fees, Livepeer mints new token over
                time, much like Bitcoin and Ethereum block rewards, which are
                split amongst delegators and orchestrators in proportion to
                their total stake relative to others in the network.
              </Text18>
              <Text18>
                This has the effect of growing network ownership amongst those
                who participate and shrinking it amongst those who do not.
              </Text18>
              <Text18>
                It also gives orchestrators a powerful economic advantage over
                centralized GPU cloud providers since the value of the token
                offsets what they need to charge developers to break even.
                This is a key reason Livepeer can offer GPU compute at
                60&ndash;85% lower cost than centralized alternatives.
              </Text18>
            </TextBlock>
            <MintingDiagram
              participationRate={stats.participationRate}
              inflationRate={stats.inflationRate}
            />
          </div>

          <ContentBlock className="mb-40">
            <TextBlock maxW="500px">
              <Text18>
                Neat right? Next, let&rsquo;s go over how often new tokens
                are minted.
              </Text18>
            </TextBlock>
          </ContentBlock>
        </div>

        {/* ════════════════════════════════════════════════
            ROUNDS & INFLATION
           ════════════════════════════════════════════════ */}
        <div data-chapter="rounds" id="rounds">
          {/* Text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <SectionHeading rotate={-3}>
                Rounds &amp; Inflation
              </SectionHeading>
              <Text28>Rounds</Text28>
              <Text18>
                In Livepeer, new tokens are minted every so-called{" "}
                <strong>round</strong>. Rounds are measured in Ethereum
                blocks, where one round is equal to <strong>5,760</strong>{" "}
                Ethereum blocks. In Ethereum, one block is mined on average
                every <strong>12.69</strong> seconds, which means one Livepeer
                round lasts roughly <strong>20.31</strong> hours. Assuming the
                Orchestrator you&rsquo;re staked to is doing its job, this is
                how often you can expect to receive reward tokens.
              </Text18>
              <Text18>
                Next, let&rsquo;s go over the Livepeer inflation rate, or in
                other words, the way by which the Livepeer protocol determines
                how many new tokens to mint each round.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/rounds.svg`}
              alt="Rounds illustration"
              className="w-full max-w-[580px]"
            />
          </FlexSection>

          {/* Image left, text right — contained */}
          <FlexSection reverse>
            <TextBlock>
              <Text28>Inflation</Text28>
              <Text18>
                The current rate of inflation as of today&rsquo;s round is{" "}
                <strong>{stats.inflationRate}</strong> and there are currently
                a total of <strong>{stats.totalSupply}</strong> Livepeer tokens
                in supply. So, if you do the math, a total of{" "}
                <strong>{stats.mintableTokens}</strong> newly minted Livepeer
                tokens will be rewarded to all participants during the next
                round.
              </Text18>
              <Text18>
                The cool thing about Livepeer is the inflation rate adjusts
                automatically depending on how many tokens are staked out of
                the total circulating supply. Currently, the total supply of
                Livepeer tokens stands at <strong>{stats.totalSupply}</strong>{" "}
                and of those, <strong>{stats.totalStaked}</strong> are staked.
                Livepeer refers to this ratio (
                <strong>{stats.participationRate}</strong>) as its
                &lsquo;participation rate&rsquo;.
              </Text18>
            </TextBlock>
            <InflationMeter
              participationRate={stats.participationRate}
              inflationRate={stats.inflationRate}
            />
          </FlexSection>

          <ContentBlock className="mb-40">
            <TextBlock maxW="600px">
              <Text18 center>
                Livepeer presupposes that a target rate of 50% is a healthy
                trade-off between network security and token liquidity, so in
                order to hit this target, the protocol incentivizes
                participation by increasing the inflation rate by{" "}
                <strong>{stats.inflationChange}</strong> for every round the
                participation rate is below 50% and decreasing it{" "}
                <strong>{stats.inflationChange}</strong> for every round the
                participation rate is above 50%.
              </Text18>
            </TextBlock>
          </ContentBlock>
        </div>

        {/* ════════════════════════════════════════════════
            GET INVOLVED
           ════════════════════════════════════════════════ */}
        <div data-chapter="involved" id="involved">
          <ContentBlock className="relative mb-16">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: "#ffd184",
                width: "215px",
                height: "215px",
                opacity: 0.5,
              }}
            />
            <div className="relative z-10">
              <SectionHeading rotate={3}>
                LIVEPEER IS GROWING!
              </SectionHeading>
            </div>
          </ContentBlock>

          {/* Text left, image right — contained */}
          <FlexSection>
            <TextBlock>
              <Text18>
                Today, there are <strong>{stats.delegatorsCount}</strong> delegators securing
                the network, with more and more participants joining every
                day.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/growing.svg`}
              alt="Network growth"
              className="w-full max-w-[360px]"
            />
          </FlexSection>

          <ContentBlock className="mb-20">
            <Text28 center>
              Livepeer is open GPU infrastructure for real-time video AI
              &mdash; specialized, affordable, and built to scale. Here&rsquo;s
              how to get involved.
            </Text28>
          </ContentBlock>

          {/* Three columns */}
          <ContentBlock className="mb-40">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
              <InvolvedCard
                icon={`${IMG}/icon-developers.svg`}
                title="Want to build with Livepeer?"
              >
                <Text18>
                  Build real-time AI video applications with affordable GPU
                  compute. Get an API key and start building with Livepeer.
                </Text18>
                <InvolvedButton
                  href="https://docs.livepeer.org"
                  label="Start building"
                />
              </InvolvedCard>
              <InvolvedCard
                icon={`${IMG}/icon-mining.svg`}
                title="Want to provide GPU compute?"
              >
                <Text18>
                  Run an orchestrator node and earn fees for performing AI
                  inference on video streams. Contribute your GPU hardware to
                  the network.
                </Text18>
                <InvolvedButton
                  href="https://docs.livepeer.org"
                  label="Run a node"
                />
              </InvolvedCard>
              <InvolvedCard
                icon={`${IMG}/icon-wallet.svg`}
                title="Want to participate in the network?"
              >
                <Text18>Get Livepeer token</Text18>
                <InvolvedButton
                  href="https://explorer.livepeer.org"
                  label="Get token"
                />
                <Text18>Stake token towards an Orchestrator</Text18>
                <InvolvedButton
                  href="https://explorer.livepeer.org"
                  label="Stake"
                />
              </InvolvedCard>
            </div>
          </ContentBlock>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="flex items-center justify-between px-6 py-7">
        <span className="text-sm text-black/50">
          Livepeer: A 10-minute Primer
        </span>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
        >
          Back to the top
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/arrow-down.svg`}
            alt=""
            className="w-[14px]"
            style={{ transform: "rotate(180deg)" }}
          />
        </button>
      </footer>

    </div>
  );
}

/* ── Reusable sub-components ── */

/**
 * FlexSection — side-by-side layout.
 * `flush="right"` → image (last child) touches the right viewport edge.
 * `flush="left"`  → image (last child on mobile, first visually via reverse) touches the left viewport edge.
 * No flush → standard centred content block.
 */
function FlexSection({
  children,
  className = "",
  reverse = false,
  flush,
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  flush?: "left" | "right";
}) {
  if (flush) {
    // Full-width container, no horizontal padding — images can touch edges
    return (
      <div
        className={`mb-20 flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12 ${
          // When flush="left", the image is first in DOM, text second.
          // `reverse` means: on desktop show image-left text-right (image first visually).
          // When flush="right", text is first, image second (natural order).
          reverse ? "lg:flex-row-reverse" : ""
        } ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`mx-auto mb-20 flex max-w-[1024px] flex-col items-center gap-12 px-6 lg:flex-row lg:items-center lg:justify-center lg:gap-20 ${
        reverse ? "lg:flex-row-reverse" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Centered content block with max-width container */
function ContentBlock({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex max-w-[960px] justify-center px-6 text-center ${className}`}
    >
      {children}
    </div>
  );
}

function TextBlock({
  children,
  maxW,
  className = "",
}: {
  children: React.ReactNode;
  maxW?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-1 flex-col gap-6 ${className}`}
      style={maxW ? { maxWidth: maxW } : undefined}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  children,
  rotate = 0,
}: {
  children: React.ReactNode;
  rotate?: number;
}) {
  return (
    <h2
      className={`mb-2 text-[40px] uppercase leading-tight tracking-tight sm:text-[50px] lg:text-[60px] ${raleway.className}`}
      style={{
        fontWeight: 400,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </h2>
  );
}

function Text28({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={`text-[28px] leading-relaxed lg:text-[36px] lg:leading-relaxed ${raleway.className} ${
        center ? "text-center" : ""
      }`}
      style={{ fontWeight: 400 }}
    >
      {children}
    </div>
  );
}

function Text18({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={`text-[16px] leading-relaxed text-black/70 lg:text-[20px] lg:leading-relaxed ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </div>
  );
}

function PersonaCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-black/[0.04] p-6">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" className="w-[50px] lg:w-[64px]" />
        <div className="text-[22px] font-bold lg:text-[26px]">{title}</div>
      </div>
      <Text18>{description}</Text18>
    </div>
  );
}

function InvolvedCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl bg-black/[0.04] p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" className="w-[50px] lg:w-[64px]" />
        <div className="text-[22px] font-bold lg:text-[26px]">{title}</div>
      </div>
      {children}
    </div>
  );
}

function InvolvedButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block self-center rounded-md border-2 border-black px-6 py-2.5 text-sm font-bold uppercase text-black no-underline transition-all hover:bg-black hover:text-white"
      style={{ backgroundColor: "#ffd184" }}
    >
      {label}
    </Link>
  );
}
