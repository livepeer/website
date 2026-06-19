---
title: "Rip it up and Start Again: A Life at the Dawn of the Internet"
description: "How Mike Zupper went from architecture student to systems architect for the internet age"
date: "2026-06-18"
category: "Ecosystem"
tags: ["builder-spotlight", "blueclaw", "cloud-spe", "ai-inference"]
image: "/images/blog/builder-spotlight-mike-zupper-card.png"
heroImage: "/images/blog/builder-spotlight-mike-zupper.png"
imageAlt: "Mike Zupper - Builder Spotlight"
draft: false
---

It's 2am in southeastern Pennsylvania and Mike Zupper is in what he calls his dojo. The kids are asleep upstairs. He is on his laptop, cloning a repository he wants to understand, intending to take it apart and put it back together by sunrise. He has been doing some version of this for nearly thirty years.

Mike is one of Livepeer's longest-tenured network contributors, a co-founder of the Livepeer ecosystem project, Cloud SPE, and the builder behind BlueClaw, an OpenAI-compatible platform that runs on the network's distributed GPU base. He arrived in crypto in 2017 after a quarter-century building enterprise systems for some of the largest companies in the United States. Mike's seen the internet built, broken, and built again. He believes we are in the middle of doing it for a third time.

## Analog origins

For a man whose career would center around having a front seat to the evolution of the internet and the digital world as we know it, Mike Zupper certainly didn't see it coming.

Mike's main passion as a kid was taking apart whatever toys he could get his hands on. Broken games, clocks and anything lying around the Zupper household ended up getting disassembled. Together with outstanding math and systems thinking skills, this pastime would go a long way towards his decision to study architecture at college.

But this was not to be. Not long into his freshman year, Mike had an encounter that would prove fatal for his architecture career: the internet.

Back then, the internet was an elusive creature that had to be sought out. The moment of Mike's conversion came when he was shown an early version of an internet browser:

> "Looking back, it was really cryptic and old school. But it blew my mind…you mean I can just look up a sports score, or check the news? Back in the day you had to go out and buy a newspaper. I knew right away that this was going to be something really hot."

And with this brief flirtation with the internet, Mike's career as an architect went up in flames.

## Down the rabbit hole

![Mike Zupper on ripping apart and rebuilding his first Pentium Gateway computer](/images/blog/builder-spotlight-mike-zupper/02_rabbit-hole.webp)

Mike knew that the world was about to experience a cambrian explosion of technological advancement through the internet. At the age of 18, he got his hands on his first personal computer:

> "My first machine was a hand-me-down Pentium PC. It was a total piece of crap, already considered old school. I happened to get it from a friend who upgraded to something new."

Though this device was new, Mike went back to the first principles he developed taking things apart as a child: in order to understand something, you need to be able to build it yourself from the bottom up. Not long after he got the Pentium, it was totally disassembled.

Once he'd put it back together, Mike knew for certain that computers would shape the rest of his life and officially transferred to a computer science major.

## Hyperscaling

![Mike Zupper: "I'm a free spirit. I don't like to be tamed."](/images/blog/builder-spotlight-mike-zupper/03_free-spirit.webp)

While still in college, Mike was offered an internship at Trifecta Technologies, an IBM Business Partner specialising in early e-commerce builds during the heady days of the Dotcom Boom where speculation around internet-based companies created a stock market bubble at the turn of the millennium.

By the time Mike left college, people had started to realise that the internet was going to affect everything, from e-commerce to politics. That's how Mike came to build out the first ever online donation system for then U.S. presidential hopeful John McCain's campaign. After this, the big names soon rolled in: Ralph Lauren, Dick's Sporting Goods, and the online stores of the NFL, MLB, MLS, and NHL.

Mike's next role at United Healthcare would be his home for a decade. While this period was the pinnacle of his corporate career, his role as an enterprise architect leading a 60 person team was also a throwback to the young boy that wanted to build and design structures, as well as the young man that deconstructed and rebuilt his computer. But his time as a freewheeling builder for hire in the early days of the internet had given him the spirit of an adventurer:

> "I'm a free spirit. I don't like to be tamed. The bureaucracy, the corporate structure just made everything so slow. Malaise and apathy…I really felt that. Hierarchy is definitely not for me."

## Unchained, on-chain

Mike was due another sea change and this time it came from a friend who asked a seemingly innocuous question: Have you ever heard of Bitcoin?

It turns out he had, but thought it was just shady stuff for drug dealers and career criminals. At the behest of his friend (known to the online world as Speedybird), Mike did his own research and realised it was the next evolution of the internet. Before long, he was mining Bitcoin and readily admits that, despite being early, he never made a nickel on the world's first cryptocurrency.

Mike's corporate years had been a long apprenticeship in Java. But the cryptography stack he was now wandering into was built on different tools, and one of them caught him by surprise:

> "Coming from a deep Java background, Rust was a revelation. Because Rust has no garbage collector, you get rid of the latency spikes and memory overhead that come with it. The ownership model lets you write memory-safe code that maximises hardware performance with a fraction of the CPU and memory footprint that legacy languages need."

That's how he found Livepeer and spun up his first node on the network:

> "I knew that this had utility and real values. I bought my first GPU and then one week later I won my first ticket from transcoding on the network. I thought to myself, this is it!"

Mike co-founded the Livepeer ecosystem project, Cloud SPE, with his friends Speedybird and Papabear. Cloud was one of the first projects funded through the newly launched on-chain treasury designed to advance contributor-led innovation on the network.

## The AI awakening

In 2024, Livepeer project co-founder Doug Petkanics laid out a vision for an AI native Livepeer network. For Mike, it was an inflection moment that reflected how his career had changed from hand-crafted code in C++, Java & Rust to one more akin to Karpathy's Software 3.0: prompt driven, agentic workflows where LLMs act as the reasoning engine.

True to form, Mike cloned the open-source AI repo and immediately took it apart. This shift in the software stack took some getting used to:

> "Traditional code executes the exact same way every time. AI models are not deterministic. Building reliable systems around unpredictable outputs requires designing highly fault-tolerant scaffolding, fallback mechanisms, and robust validation loops."

But then, like a bolt from the blue, inspiration struck.

## The BlueClaw moment

![Mike Zupper on running ten AI agents and the $500-a-week bill that sparked BlueClaw](/images/blog/builder-spotlight-mike-zupper/04_blueclaw.webp)

In the early months of 2026, from social media to the TG chats of elite builders, a single name started showing up everywhere: OpenClaw, an emerging framework for running autonomous AI agents. Mike immediately saw the potential this project had and cloned the repo.

Mike used coding assistants to deconstruct the framework's architecture. He wanted to see how it separated the gateway, the part managing websockets and message routing, from the agent runtime, the part actually executing tasks.

Within days, he had ten agents running locally: one checking his email, one reminding him to drink water, one managing his exercise schedule, one helping him think about dinner. His wife even asked him why he kept talking about them as if they were people. Then the invoices arrived:

> "Underneath it all, I was using OpenAI and Anthropic and they cost money. Then they pulled the rug on me. Next thing you know my bill is 500 dollars a week. I had to turn the agents off. This is the moment when Livepeer, AI, and entrepreneur all meet in the same place."

He calls the result BlueClaw. In plain terms, it's an alternative to OpenAI and Anthropic, but running on the Livepeer network: an open, OpenAI-compatible platform where users can run language models, generate audio from text, transcribe audio to text, or generate images, without rate limits. Instead of hundreds of dollars a month for the major providers, BlueClaw is targeting a low cost monthly subscription for a fair use policy, the network economics carried by Livepeer's distributed GPU provider base. In other words, passing on the savings afforded by not running complex GPU infrastructure to the end users of BlueClaw.

The day before this article was written, BlueClaw processed its billionth work unit on the Livepeer network. Beyond the pricing fix, Mike had come to a conclusion about what these agent systems actually need:

> "A powerful LLM can make or break an agent harness. But relying solely on its reasoning is dangerous. Give an agent broad access without rigorous deterministic scaffolding and it will hallucinate commands, drift, or fail. You have to force the non-deterministic model into predictable, constrained execution paths."

## The Lego brick at protocol scale

Mike's mind never settles for long on a single layer of the stack. While BlueClaw's first customers were walking in the door, Mike had already ripped up the floor and rearranged the plumbing.

Mike sees the existing stack as a single welded structure: transcoding fused to AI, AI fused to the gateway, the gateway fused to everything else. So he set about making it composable:

> "How do I interact with a GPU supplier and provide a feature, but not have it welded together? If I want to provide transcoding, there's a Lego brick for that. If I want to provide an LLM, there's a Lego brick for that. We get all the Legos, all the pieces."

He calls the resulting suite Livepeer Modules. Whichever language a developer already lives in, they can build on Livepeer without learning Livepeer.

Mike's career shows how, through the internet, people with the requisite drive could show up and shape the technological future for those that come after them. What may have started with a screwdriver and a second-hand computer now continues on globally distributed independent GPUs and open source AI on the Livepeer network. At its core, the same impulse Mike has been carrying since the first personal Pentium computer:

> "if you give me the pieces, I will figure out how they fit. And if they don't fit cleanly, I will build the pieces that do."
