"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

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
  { id: "what", label: "What is Livepeer?", bg: "#97f2ef" },
  { id: "who", label: "Who is Livepeer for?", bg: "#ffca71" },
  { id: "how", label: "How Does Livepeer Work?", bg: "#95f58c" },
  { id: "orchestrators", label: "Orchestrators", bg: "#a6adeb" },
  { id: "token", label: "Livepeer Token", bg: "#d4b9e4" },
  { id: "delegators", label: "Delegators", bg: "#ffc37b" },
  { id: "rewarding", label: "Rewarding Participation", bg: "#ffa3a3" },
  { id: "rounds", label: "Rounds & Inflation", bg: "#97f2ef" },
  { id: "involved", label: "Get Involved", bg: "#95f58c" },
] as const;

export default function PrimerPage() {
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
      <div className="fixed top-[18px] right-6 z-50" ref={tocRef}>
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="flex items-center gap-[18px] rounded-[5px] border-[1.5px] border-black px-[17px] py-3 uppercase transition-shadow hover:shadow-none"
          style={{
            backgroundColor: "#a6adeb",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "16px",
            lineHeight: "19px",
            boxShadow: tocOpen ? "0 0 #000" : "3px 3px #000",
          }}
        >
          <span>CONTENTS</span>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className="transition-transform"
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
          {/* Text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text28>
                Today, 80% of all internet bandwidth is consumed by video
                streaming.
              </Text28>
              <Text18>
                It&rsquo;s easy to understand why: video is engaging,
                educational, illuminating, and empowering.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/pie-chart.svg`}
              alt="80% of bandwidth is video"
              className="w-full max-w-[420px] flex-shrink-0 lg:max-w-[490px]"
            />
          </FlexSection>

          {/* Image flush left, text right */}
          <FlexSection flush="left" reverse>
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                But, for companies, video is insanely expensive to stream
                &mdash; and even more expensive to live stream.
              </Text18>
              <Text18>
                Why? Because broadcasters who want to distribute video on the
                internet need to first <strong>transcode</strong> it.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/transcoding-in.svg`}
              alt="Transcoding illustration"
              className="w-full max-w-[500px] flex-shrink-0"
            />
          </FlexSection>

          {/* Text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                Transcoding is the process of taking a raw video file and
                reformatting it so that no matter what bandwidth you have
                &mdash; whether 2g or 5g &mdash; and no matter what device,
                you&rsquo;re ensured the most optimal viewing experience.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/transcoder-pickup.svg`}
              alt="Transcoder pickup"
              className="w-full max-w-[440px] flex-shrink-0"
            />
          </FlexSection>

          {/* Image flush left, text right */}
          <FlexSection flush="left" reverse>
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                Today, this process costs around $3 per stream per hour to a
                cloud service such as Amazon, up to $4,500 per month for one
                media server, and up to $1,500 per month before bandwidth for
                a content delivery network. That&rsquo;s a lot!
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/transcoder-running.svg`}
              alt="Transcoder running"
              className="w-full max-w-[500px] flex-shrink-0"
            />
          </FlexSection>

          {/* Text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                Due to such high infrastructure costs, it&rsquo;s become
                commonplace for aspiring social video startups to find initial
                success upon launch, adding hundreds of thousands of users in
                a single month, only to end up with multi-million dollar
                streaming bills that drain their funding prior to finding a
                working business model. As a result, startups are forced to
                tax their users by selling their data, bombard them with ads,
                or shut down operations completely.
              </Text18>
              <Text18>
                Demand for video services is increasing exponentially on the
                infrastructure side with the arrival of 4k video, ultra-HD, VR
                streaming, and all the cord-cutting that&rsquo;s moving
                broadcasts off of the traditional broadcast pipes and on to
                the internet.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/scissors.svg`}
              alt="Cost cutting"
              className="w-full max-w-[440px] flex-shrink-0"
            />
          </FlexSection>

          <ContentBlock className="mb-40">
            <Text28 center>
              Video infrastructure needs a more scalable and cost-effective
              solution to keep up with this growth.
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

          {/* Text left, image flush right */}
          <FlexSection flush="right" className="mb-40">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                Livepeer is a protocol for developers who want to add live or
                on-demand video to their project. It aims to increase the
                reliability of video streaming while reducing costs associated
                with it by up to 50x.
              </Text18>
              <Text18>
                To achieve this Livepeer is building p2p infrastructure that
                interacts through a marketplace secured by the Ethereum
                blockchain.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/livepeer-ethereum.png`}
              alt="Livepeer and Ethereum"
              className="w-full max-w-[400px] flex-shrink-0"
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
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
              <PersonaCard
                icon={`${IMG}/icon-developers.svg`}
                title="Developers"
                description="who want to build applications that include live or on demand video can use Livepeer to power their video functionality."
              />
              <PersonaCard
                icon={`${IMG}/icon-users.svg`}
                title="Users"
                description="who want to stream video, gaming, coding, entertainment, educational courses, and other types of content can use applications built on Livepeer to do so."
              />
              <PersonaCard
                icon={`${IMG}/icon-broadcasters.svg`}
                title="Broadcasters"
                description="such as Twitch who have large audiences and high streaming bills or infrastructure costs can use Livepeer to reduce costs or infrastructure overhead."
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

          {/* Meet Alice — image flush left, text right */}
          <FlexSection flush="left" reverse>
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text28>Meet: Alice</Text28>
              <Text18>
                Alice is an app developer. She&rsquo;s using Livepeer to add
                live video streaming capabilities to an app she&rsquo;s
                building for high schools that want to broadcast their
                team&rsquo;s sporting events.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/alice.svg`}
              alt="Alice"
              className="w-full max-w-[280px] flex-shrink-0"
            />
          </FlexSection>

          {/* Meet Bob — text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text28>Meet: Bob</Text28>
              <Text18>
                Bob is an event coordinator in charge of broadcasting his high
                school&rsquo;s basketball games using Alice&rsquo;s app.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/bob.svg`}
              alt="Bob"
              className="w-full max-w-[280px] flex-shrink-0"
            />
          </FlexSection>

          {/* Devices — image flush left, text right */}
          <FlexSection flush="left" reverse>
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                When Bob opens the app and taps &lsquo;Record&rsquo; at the
                start of each game, the app sends the live video along with
                broadcaster fees into the Livepeer network. Livepeer then
                transcodes the video into all the formats and bitrates that
                his viewers can consume.
              </Text18>
              <Text18>
                Today is a really important broadcast for Bob. It&rsquo;s the
                championship game! How can Alice be sure that the live
                streaming experience will be high-quality for Bob&rsquo;s
                viewers?
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/devices.svg`}
              alt="Multiple devices"
              className="w-full max-w-[500px] flex-shrink-0"
            />
          </FlexSection>

          {/* Two key actors — text left, image flush right */}
          <FlexSection flush="right" className="mb-40">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                There are two key actors in the Livepeer network that ensure
                the quality of the live stream:{" "}
                <strong>Orchestrators</strong> and{" "}
                <strong>Delegators</strong>.
              </Text18>
              <Text18>
                First, let&rsquo;s go over the role of Orchestrators.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/actors.svg`}
              alt="Orchestrators and Delegators"
              className="w-full max-w-[500px] flex-shrink-0"
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
                In Livepeer, anyone can join the network and become what&rsquo;s
                known as an <strong>orchestrator</strong> by running software
                that allows you to contribute your computer&rsquo;s resources
                (CPU, GPU, and bandwidth) in service of transcoding and
                distributing video for paying broadcasters and developers like
                Alice.
              </Text18>
              <Text18>
                For doing so, you earn fees in the form of a cryptocurrency
                like ETH or a stablecoin pegged to the US dollar like DAI.
              </Text18>
            </TextBlock>
          </ContentBlock>

          {/* Orchestration diagram — full bleed */}
          <ContentBlock className="mb-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/orchestration.svg`}
              alt="Orchestration diagram"
              className="w-full max-w-[800px]"
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
                to perform the work of transcoding and distributing video on
                the network. The more LPT you own, the more work you&rsquo;re
                able to perform on the network in exchange for fees.
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
              <Text18>
                You may be wondering, why would a tokenholder stake their
                tokens? What&rsquo;s in it for them?
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/delegator.svg`}
              alt="Delegator illustration"
              className="w-full max-w-[480px] flex-shrink-0"
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

          {/* Text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                When a broadcaster pays fees into the network, both
                orchestrators and Delegators earn a portion of those fees as
                a reward for ensuring a high-quality and secure network.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/minting.svg`}
              alt="Fee distribution"
              className="w-full max-w-[400px] flex-shrink-0"
            />
          </FlexSection>

          {/* Image flush left, text right */}
          <FlexSection flush="left" reverse>
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                In addition to earning fees, Livepeer mints new token over
                time, much like Bitcoin and Ethereum block rewards, which are
                split amongst Delegators and orchestrators in proportion to
                their total stake relative to others in the network.
              </Text18>
              <Text18>
                This has the effect of growing network ownership amongst those
                who participate and shrinking it amongst those who do not.
              </Text18>
              <Text18>
                It also gives orchestrators a powerful economic advantage over
                traditional centralized video providers since the value of the
                token offsets what they need to charge broadcasters to break
                even. With traditional centralized video providers, they have
                to charge you their cost of service for transcoding and
                distributing video plus a margin.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/minting.svg`}
              alt="Token minting"
              className="w-full max-w-[480px] flex-shrink-0"
            />
          </FlexSection>

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
              className="w-full max-w-[440px] flex-shrink-0"
            />
          </FlexSection>

          {/* Image flush left, text right */}
          <FlexSection flush="left" reverse>
            <TextBlock className="px-6 lg:pr-[max(2rem,calc((100vw-960px)/2))]">
              <Text28>Inflation</Text28>
              <Text18>
                The current rate of inflation as of today&rsquo;s round is
                0.0224% and there are currently a total of 27,440,696.99
                Livepeer tokens in supply. So, if you do the math, a total of
                6,146.72 newly minted Livepeer tokens will be rewarded to all
                participants during the next round.
              </Text18>
              <Text18>
                The cool thing about Livepeer is the inflation rate adjusts
                automatically depending on how many tokens are staked out of
                the total circulating supply. Currently, the total supply of
                Livepeer tokens stands at 27,440,696.99 and of those,
                12,199,512.94 are staked. Livepeer refers to this ratio
                (44.46%) as its &lsquo;participation rate&rsquo;.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/inflation.svg`}
              alt="Inflation rate visualization"
              className="w-full max-w-[340px] flex-shrink-0"
            />
          </FlexSection>

          <ContentBlock className="mb-40">
            <TextBlock maxW="600px">
              <Text18 center>
                Livepeer presupposes that a target rate of 50% is a healthy
                trade-off between network security and token liquidity, so in
                order to hit this target, the protocol incentivizes
                participation by increasing the inflation rate by 0.00005% for
                every round the participation rate is below 50% and decreasing
                it 0.00005% for every round the participation rate is above
                50%.
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

          {/* Text left, image flush right */}
          <FlexSection flush="right">
            <TextBlock className="px-6 lg:pl-[max(2rem,calc((100vw-960px)/2))]">
              <Text18>
                Today, there are 5,308 delegators securing the network, with
                more and more participants joining the network every day.
              </Text18>
            </TextBlock>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/growing.svg`}
              alt="Network growth"
              className="w-full max-w-[360px] flex-shrink-0"
            />
          </FlexSection>

          {/* Three columns */}
          <ContentBlock className="mb-40">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
              <InvolvedCard
                icon={`${IMG}/icon-wallet.svg`}
                title="Interested in participating?"
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
              <InvolvedCard
                icon={`${IMG}/icon-video.svg`}
                title="Are you a video engineer?"
              >
                <Text18>
                  Learn how to build and scale next generation streaming
                  platforms and services at an industry shattering price through
                  quick and reliable API access to the Livepeer network.
                </Text18>
                <InvolvedButton
                  href="https://docs.livepeer.org"
                  label="Learn more"
                />
              </InvolvedCard>
              <InvolvedCard
                icon={`${IMG}/icon-mining.svg`}
                title="Are you a cryptocurrency miner?"
              >
                <Text18>
                  Learn how you can earn additional income on Livepeer&rsquo;s
                  open marketplace by renting out the idle capacity on your GPU
                  mining rig.
                </Text18>
                <InvolvedButton
                  href="https://docs.livepeer.org"
                  label="Learn more"
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
        className={`mb-20 flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-0 ${
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
      className={`mx-auto mb-20 flex max-w-[960px] flex-col items-center gap-12 px-6 lg:flex-row lg:items-center lg:gap-20 ${
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
      className={`flex flex-col gap-6 ${className}`}
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
      className="mb-2 text-[28px] uppercase leading-tight tracking-tight sm:text-[34px] lg:text-[40px]"
      style={{
        fontWeight: 700,
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
      className={`text-[22px] leading-relaxed lg:text-[28px] lg:leading-relaxed ${
        center ? "text-center" : ""
      }`}
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
    <div className="flex flex-col gap-5 rounded-xl bg-black/[0.04] p-6">
      <div className="flex flex-col gap-3">
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
      className="inline-block self-start rounded-md border-2 border-black px-6 py-2.5 text-sm font-bold uppercase text-black no-underline transition-all hover:bg-black hover:text-white"
      style={{ backgroundColor: "#ffd184" }}
    >
      {label}
    </Link>
  );
}
