import { useState, useEffect } from 'react';

// Hook que devuelve true/false según si el ancho de la pantalla está por
// debajo del breakpoint (768px por defecto = "es mobile"). Se actualiza
// solo cada vez que la ventana cambia de tamaño.
export function useIsMobile(breakpoint = 768) {
  // valor inicial: calcula el ancho actual apenas se monta el componente
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', check); // escucha cambios de tamaño de la ventana
    return () => window.removeEventListener('resize', check); // limpia el listener al desmontar
  }, [breakpoint]);
  return isMobile;
}
