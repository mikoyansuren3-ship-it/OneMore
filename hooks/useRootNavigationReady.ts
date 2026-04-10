import { useEffect, useState } from "react";
import { useNavigationContainerRef } from "expo-router";

/**
 * True once the root NavigationContainer can dispatch actions reliably.
 * Prevents REPLACE to routes like (tabs) before the Stack has mounted them.
 */
export function useRootNavigationReady(): boolean {
  const navigationRef = useNavigationContainerRef();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const markReady = () => {
      if (navigationRef.isReady()) {
        setReady(true);
      }
    };

    markReady();
    const unsub = navigationRef.addListener("state", markReady);
    const t = requestAnimationFrame(markReady);

    return () => {
      unsub();
      cancelAnimationFrame(t);
    };
  }, [navigationRef]);

  return ready;
}
