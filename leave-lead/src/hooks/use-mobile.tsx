import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Use undefined initially to avoid SSR mismatch issues
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Use the media query's own 'matches' property
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Set the initial value
    setIsMobile(mql.matches);

    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return false as a default, but !!isMobile is safe
  return !!isMobile;
}