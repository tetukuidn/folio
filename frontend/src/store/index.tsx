import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../utils/storage";
import { makeSeed, type StoreState } from "./types";

const KEY = "aglo-demo-v2";

type Ctx = {
  state: StoreState;
  loaded: boolean;
  setState: (updater: (s: StoreState) => StoreState) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, _setState] = useState<StoreState>(() => makeSeed());
  const [loaded, setLoaded] = useState(false);

  // Load on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      const raw = await storage.getItem<string>(KEY, "");
      if (!alive) return;
      if (raw && typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw) as StoreState;
          if (parsed && parsed.belanja && parsed.pesanan) {
            _setState({
              belanja: parsed.belanja || [],
              suppliers: parsed.suppliers || [],
              pesanan: parsed.pesanan || [],
              sender: parsed.sender || makeSeed().sender,
            });
          }
        } catch {}
      } else {
        // seed first run
        const seed = makeSeed();
        _setState(seed);
        await storage.setItem(KEY, JSON.stringify(seed));
      }
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Save on change (after loaded)
  useEffect(() => {
    if (!loaded) return;
    storage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  const setState = useCallback((updater: (s: StoreState) => StoreState) => {
    _setState((prev) => updater(prev));
  }, []);

  const reset = useCallback(() => {
    const seed = makeSeed();
    _setState(seed);
  }, []);

  const value = useMemo<Ctx>(() => ({ state, loaded, setState, reset }), [state, loaded, setState, reset]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
