import { useState, useEffect } from 'react';

export default function usePageLoading(delay = 800) { // Reduzi para 800ms
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Garante que o estado inicial seja consistente
    setLoading(true);
    setShowContent(false);

    // Primeiro timer para garantir que o loading seja mostrado por pelo menos 100ms
    const minimumLoadingTimer = setTimeout(() => {
      // Segundo timer para remover o loading
      const loadingTimer = setTimeout(() => {
        setLoading(false);
        
        // Terceiro timer para mostrar o conteúdo após a animação de fade do loading
        const contentTimer = setTimeout(() => {
          setShowContent(true);
        }, 200); // Reduzi para 200ms a transição

        return () => clearTimeout(contentTimer);
      }, delay - 100); // Remove 100ms do delay total para compensar o tempo mínimo

      return () => clearTimeout(loadingTimer);
    }, 100); // Tempo mínimo que o loading será mostrado

    return () => clearTimeout(minimumLoadingTimer);
  }, [delay]);

  return { loading, showContent };
}