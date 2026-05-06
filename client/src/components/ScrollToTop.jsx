import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Riporta lo scroll in cima ad ogni cambio di route.
// Risolve il bug per cui (specialmente su mobile) cambiando pagina si
// rimane nella posizione di scroll della pagina precedente.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
