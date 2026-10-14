import type { Metadata } from "next";
import Link from "next/link";

import { LivepeerCubeStream } from "@/components/livepeer-ui/livepeer-cube-stream";
import { NotFoundRequest } from "@/components/livepeer-ui/not-found-request";
import { Button } from "@/components/ui/button";
import { ExternalArrow } from "@/components/ui/external-arrow";

// Without this the tab and any shared link read as the home page.
export const metadata: Metadata = {
  title: "Page not found",
  openGraph: { title: "Page not found | Livepeer" },
  twitter: { title: "Page not found | Livepeer" },
};

/**
 * A missing page as a request nothing on the network picked up: the home
 * hero's field, with one particle every few seconds leaving the stream and
 * drifting off (`stray`), over the address that was asked for written as a
 * log line. Laid out like the home hero, so a wrong turn still lands on the
 * site's own ground: full height under the header, the field behind the copy,
 * the copy centred. It was a plain message and a link home; an exploded GPU
 * card was tried here before that and cut.
 */
export default function NotFound() {
  return (
    <section className="relative isolate -mt-16 flex min-h-[85svh] w-full items-center overflow-hidden bg-background pt-16">
      <LivepeerCubeStream
        stray
        className="z-0 [mask-image:linear-gradient(to_bottom,black_0%,black_85%,transparent_100%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-page px-4 py-24 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <NotFoundRequest />
          <h1 className="mt-6 text-display-sm text-balance sm:text-display-md">
            Nothing on the network serves this page.
          </h1>
          <p className="mt-5 max-w-md text-reading-body text-pretty text-muted-foreground">
            It may have moved, or never existed. The rest of the network is
            right where you left it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/" />}>
              Back to the home page
            </Button>
            {/* A plain anchor: /discord redirects off the site, so there is
                nothing for Next to prefetch, and it opens alongside like the
                site's other Discord buttons. */}
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<a href="/discord" target="_blank" rel="noreferrer" />}
            >
              Report a broken link
              <ExternalArrow className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
