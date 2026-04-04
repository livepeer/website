import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Page not found!
      </h1>
      <p className="mt-4 max-w-md text-lg text-white/60">
        Sorry, but the page you were looking for could not be found.
      </p>
      <p className="mt-2 text-lg text-white/60">
        <Link
          href="/"
          className="text-green underline underline-offset-4 hover:text-green-light"
        >
          Return to our front page
        </Link>{" "}
        if you can&apos;t find what you&apos;re looking for.
      </p>
    </div>
  );
}
