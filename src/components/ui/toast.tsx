import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", onClose, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, 4000)

        return () => clearTimeout(timer)
      }
    }, [isVisible, onClose])

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300",
          {
            "bg-background border-border text-foreground": variant === "default",
            "bg-destructive/10 border-destructive/20 text-destructive": variant === "destructive",
            "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300": variant === "success",
          },
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }
