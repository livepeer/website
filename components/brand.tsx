import * as React from "react"

const symbolPaths = (
  <>
    <path d="M0 16.4436V0.944092H15.4995V16.4436H0Z" />
    <path d="M28.4692 34.504V19.0045H43.9687V34.504H28.4692Z" />
    <path d="M56.8936 52.5661V37.0667H72.393V52.5661H56.8936Z" />
    <path d="M28.4692 70.5814V55.0819H43.9687V70.5814H28.4692Z" />
    <path d="M0 88.6207V73.1212H15.4995V88.6207H0Z" />
    <path d="M0 52.5661V37.0667H15.4995V52.5661H0Z" />
  </>
)

const wordmarkPaths = (
  <>
    <path d="M118.899 88.6863V0.97998H135.921V73.6405H185.815V88.6863H118.899Z" />
    <path d="M195.932 88.6863V0.97998H212.954V88.6863H195.932Z" />
    <path d="M291.653 0.97998H310.34L277.221 88.6863H255.142L221.283 0.97998H240.34L266.551 70.9493L291.653 0.97998Z" />
    <path d="M319.038 88.6863V52.5316H336.06V37.121H319.038V0.97998H385.955V16.0258H336.06V37.121H378.369V52.5316H336.06V73.6405H387.25V88.6863H319.038Z" />
    <path d="M400.019 88.6863V0.97998H439.798C457.005 0.97998 468.23 9.63853 468.23 26.9229C468.23 42.2786 457.005 52.6235 439.798 52.6235H417.041V88.6863H400.019ZM417.041 37.0306H437.886C446.521 37.0306 451.146 32.8877 451.146 26.7406C451.146 20.1235 446.521 16.0258 437.886 16.0258H417.041V37.0306Z" />
    <path d="M479.889 88.6863V52.5316H496.911V37.121H479.889V0.97998H546.805V16.0258H496.911V37.121H539.219V52.5316H496.911V73.6405H548.1V88.6863H479.889Z" />
    <path d="M560.869 88.6863V52.5316H577.891V37.121H560.869V0.97998H627.785V16.0258H577.891V37.121H620.2V52.5316H577.891V73.6405H629.081V88.6863H560.869Z" />
    <path d="M641.85 88.6863V0.97998H682.925C698.488 0.983166 710.061 8.54418 710.061 22.8274C710.061 33.708 705.127 40.3254 695.013 44.0563C704.202 44.0563 708.766 48.2153 708.766 56.4722V88.6863H691.744V60.6923C691.744 54.3927 689.894 52.5578 683.541 52.5578H658.872V88.6863H641.85ZM658.872 37.0884H677.867C687.797 37.0884 692.977 33.7995 692.977 26.616C692.977 19.4325 687.982 16.0258 677.867 16.0258H658.872V37.0884Z" />
  </>
)

function LivepeerSymbol(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 73 89"
      fill="currentColor"
      role="img"
      aria-label="Livepeer"
      {...props}
    >
      {symbolPaths}
    </svg>
  )
}

function LivepeerGradientSymbol(props: React.SVGProps<SVGSVGElement>) {
  const gradientId = React.useId().replaceAll(":", "")

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 73 89"
      role="img"
      aria-label="Livepeer"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2=".342" y2="1">
          <stop offset="0" stopColor="color(display-p3 0.04 0.74 0.49)" />
          <stop offset=".32" stopColor="color(display-p3 0.04 0.74 0.49)" />
          <stop offset="1" stopColor="color(display-p3 0.02 0.58 0.36)" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>{symbolPaths}</g>
    </svg>
  )
}

function LivepeerWordmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="115 0 596 90"
      fill="currentColor"
      role="img"
      aria-label="Livepeer"
      {...props}
    >
      {wordmarkPaths}
    </svg>
  )
}

function LivepeerLogo({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1.5 text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* <LivepeerGradientSymbol className="h-4 w-auto" aria-hidden="true" /> */}
      <LivepeerWordmark className="h-4 w-auto" aria-hidden="true" />
    </span>
  )
}

function LivepeerLockup(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 711 89"
      fill="currentColor"
      role="img"
      aria-label="Livepeer"
      {...props}
    >
      {symbolPaths}
      {wordmarkPaths}
    </svg>
  )
}

function LivepeerGradientLockup({
  metallic = false,
  ...props
}: React.SVGProps<SVGSVGElement> & { metallic?: boolean }) {
  const gradientId = React.useId().replaceAll(":", "")
  const wordmarkGradientId = `${gradientId}-wordmark`
  const metallicSymbolGradientId = `${gradientId}-metallic-symbol`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 711 89"
      role="img"
      aria-label="Livepeer"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2=".342" y2="1">
          <stop offset="0" stopColor="color(display-p3 0.04 0.74 0.49)" />
          <stop offset=".32" stopColor="color(display-p3 0.04 0.74 0.49)" />
          <stop offset="1" stopColor="color(display-p3 0.02 0.58 0.36)" />
        </linearGradient>
        <linearGradient id={wordmarkGradientId} x1="0" y1="0" x2=".342" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".46" stopColor="#fff" />
          <stop offset=".72" stopColor="#ededed" />
          <stop offset="1" stopColor="#bdbdbd" />
        </linearGradient>
        <linearGradient
          id={metallicSymbolGradientId}
          x1="0"
          y1="0"
          x2=".342"
          y2="1"
        >
          <stop offset="0" stopColor="#45e7ab" />
          <stop offset=".1" stopColor="#16d994" />
          <stop offset=".55" stopColor="#00c077" />
          <stop offset="1" stopColor="#007e4e" />
        </linearGradient>
      </defs>
      <g
        fill={
          metallic ? `url(#${metallicSymbolGradientId})` : `url(#${gradientId})`
        }
        stroke={metallic ? "#45e7ab" : undefined}
        strokeWidth={metallic ? 1 : undefined}
        strokeLinejoin={metallic ? "miter" : undefined}
        paintOrder={metallic ? "stroke fill" : undefined}
      >
        {symbolPaths}
      </g>
      <g
        fill={metallic ? `url(#${wordmarkGradientId})` : "currentColor"}
        stroke={metallic ? "#fff" : undefined}
        strokeWidth={metallic ? 1 : undefined}
        strokeLinejoin={metallic ? "miter" : undefined}
        paintOrder={metallic ? "stroke fill" : undefined}
      >
        {wordmarkPaths}
      </g>
    </svg>
  )
}

function AgentWordmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 609.57 119.17"
      fill="currentColor"
      role="img"
      aria-label="Agent"
      {...props}
    >
      <path d="M33.7,85.28l-7.63,17.88c-1.86,4.47-3.17,9.87-3.17,16.01H0c4.47-6.14,8.01-12.48,12.66-22.9L52.32,7.82l-5.03-7.82h38.92l43.94,96.64c5.03,11.17,8.57,18.81,12.66,22.53h-43.94c.19-.74.37-1.68.37-2.79,0-3.72-1.49-8.94-5.03-16.94l-6.33-14.15h-54.18ZM81,70.01l-20.3-45.06-19.92,45.06h40.22Z" />
      <path d="M166.17,119.17c-15.46,0-23.83-7.63-23.83-24.21V24.21c0-16.57,8.38-24.21,23.83-24.21h87.51l2.98,18.06c-5.59-2.42-13.22-2.79-18.43-2.79h-54.19c-5.03,0-6.7,1.68-6.7,7.08v74.48c0,5.4,1.68,7.08,6.7,7.08h37.05c3.72,0,5.4-1.68,5.4-5.03v-35.56h-30.72c-3.54,0-5.96.93-8.75,2.05v-17.32h75.6c-1.86,5.59-2.23,10.61-2.23,16.01v39.1c0,5.4.37,10.43,2.23,16.01h-31.47l-1.86-10.43h-.37c-1.3,7.63-4.47,10.43-15.08,10.43h-47.67Z" />
      <path d="M268.77,119.17c1.86-5.59,2.23-10.61,2.23-16.01V16.01c0-5.4-.37-10.43-2.23-16.01h97.76l2.98,18.06c-5.59-2.42-13.22-2.79-18.43-2.79h-45.06v36.12h39.29c5.21,0,12.85-.37,18.43-2.79v20.85c-5.59-2.42-13.22-2.79-18.43-2.79h-39.29v37.24h45.06c5.21,0,12.85-.37,18.43-2.79l-2.98,18.06h-97.76Z" />
      <path d="M454.62,119.17l-61.08-96.45h-.37v80.44c0,5.4.37,10.43,2.23,16.01h-20.48c1.86-5.59,2.23-10.61,2.23-16.01V16.01c0-5.4-.37-10.43-2.23-16.01h43.76l59.96,94.59h.37V16.01c0-5.4-.37-10.43-2.23-16.01h20.48c-1.86,5.59-2.23,10.61-2.23,16.01v103.16h-40.41Z" />
      <path d="M606.59,0l2.98,18.06c-5.59-2.42-13.22-2.79-18.43-2.79h-18.25v87.89c0,5.4.37,10.43,2.23,16.01h-39.47c1.86-5.59,2.23-10.61,2.23-16.01V15.27h-18.25c-5.21,0-12.85.37-18.43,2.79l2.98-18.06h102.41Z" />
    </svg>
  )
}

function RegistryUiMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 103.11 45.53"
      fill="currentColor"
      role="img"
      aria-label="UI"
      {...props}
    >
      <path d="M1.53,22.64L9.33,0h18.87l-7.97,23.19c-4.08,11.87-.91,16.98,14.18,16.98s21.18-2.62,25.26-14.55L68.43,0h4.81l-8.76,25.62c-5.54,16.07-13.27,19.9-36.34,19.9S-3.88,38.41,1.53,22.64Z" />
      <path d="M84.79,0h18.32l-15.46,44.92h-18.32L84.79,0Z" />
    </svg>
  )
}

export {
  LivepeerSymbol,
  LivepeerGradientSymbol,
  LivepeerWordmark,
  LivepeerLogo,
  LivepeerLockup,
  LivepeerGradientLockup,
  AgentWordmark,
  RegistryUiMark,
}
