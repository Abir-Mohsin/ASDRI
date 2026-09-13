import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Initialize the state safely on the client side
    const initialIsMobile = window.innerWidth < MOBILE_BREAKPOINT
    setIsMobile((prev) => {
      if (prev !== initialIsMobile) return initialIsMobile
      return prev
    })
    
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
