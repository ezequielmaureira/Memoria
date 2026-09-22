import { useEffect, useState } from "react";

// Hook mínimo para llamadas GET con estados loading/error/data.
// deps controla cuándo se vuelve a ejecutar el fetcher.
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

// Igual que useFetch, pero expone refetch() para volver a disparar el
// fetcher manualmente (por ejemplo después de enviar un formulario).
export function useFetchWithRefetch(fetcher, deps = []) {
  const [tick, setTick] = useState(0);
  const state = useFetch(fetcher, [...deps, tick]);
  return { ...state, refetch: () => setTick((t) => t + 1) };
}
