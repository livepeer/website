"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyButton({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
