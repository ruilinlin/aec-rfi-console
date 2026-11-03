import { useEffect, useState } from "react";
import { Console } from "./Console";
import { KitchenSink } from "./KitchenSink";

/**
 * Hash switch instead of a router: the console is the app; #sampler keeps
 * the design-system reference page reachable.
 */
export function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash === "#sampler" ? <KitchenSink /> : <Console />;
}
