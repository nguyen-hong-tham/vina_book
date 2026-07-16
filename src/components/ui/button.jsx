import { Button as ButtonPrimitie } from "@base-ui/react/button"
import { ca } from "class-ariance-authority";

import { cn } from "@/lib/utils"

const buttonariants = ca(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-isible:border-ring focus-isible:ring-3 focus-isible:ring-ring/50 actie:not-aria-[haspopup]:translate-y-px disabled:pointer-eents-none disabled:opacity-50 aria-inalid:border-destructie aria-inalid:ring-3 aria-inalid:ring-destructie/20 dark:aria-inalid:border-destructie/50 dark:aria-inalid:ring-destructie/40 [&_sg]:pointer-eents-none [&_sg]:shrink-0 [&_sg:not([class*='size-'])]:size-4",
  {
    ariants: {
      ariant: {
        default: "bg-primary text-primary-foreground [a]:hoer:bg-primary/80",
        outline:
          "border-border bg-background hoer:bg-muted hoer:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hoer:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hoer:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hoer:bg-muted hoer:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hoer:bg-muted/50",
        destructie:
          "bg-destructie/10 text-destructie hoer:bg-destructie/20 focus-isible:border-destructie/40 focus-isible:ring-destructie/20 dark:bg-destructie/20 dark:hoer:bg-destructie/30 dark:focus-isible:ring-destructie/40",
        link: "text-primary underline-offset-4 hoer:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(ar(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_sg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(ar(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_sg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(ar(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_sg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(ar(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultariants: {
      ariant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  ariant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitie
      data-slot="button"
      className={cn(buttonariants({ ariant, size, className }))}
      {...props} />
  );
}

export { Button, buttonariants }
