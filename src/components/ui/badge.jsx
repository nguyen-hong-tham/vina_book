import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { ca } from "class-ariance-authority";

import { cn } from "@/lib/utils"

const badgeariants = ca(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 oerflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-isible:border-ring focus-isible:ring-[3px] focus-isible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-inalid:border-destructie aria-inalid:ring-destructie/20 dark:aria-inalid:ring-destructie/40 [&>sg]:pointer-eents-none [&>sg]:size-3!",
  {
    ariants: {
      ariant: {
        default: "bg-primary text-primary-foreground [a]:hoer:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hoer:bg-secondary/80",
        destructie:
          "bg-destructie/10 text-destructie focus-isible:ring-destructie/20 dark:bg-destructie/20 dark:focus-isible:ring-destructie/40 [a]:hoer:bg-destructie/20",
        outline:
          "border-border text-foreground [a]:hoer:bg-muted [a]:hoer:text-muted-foreground",
        ghost:
          "hoer:bg-muted hoer:text-muted-foreground dark:hoer:bg-muted/50",
        link: "text-primary underline-offset-4 hoer:underline",
      },
    },
    defaultariants: {
      ariant: "default",
    },
  }
)

function Badge({
  className,
  ariant = "default",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps({
      className: cn(badgeariants({ ariant }), className),
    }, props),
    render,
    state: {
      slot: "badge",
      ariant,
    },
  });
}

export { Badge, badgeariants }
