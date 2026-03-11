"use client";

import { createContext, useContext, useState } from "react";
import { locations } from "@/config/restaurant";

export type Location = typeof locations[number];

const LocationContext = createContext<LocationContextValue | null>(null);

interface LocationContextValue {
  selected: Location | null;
  setSelected: (loc: Location) => void;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Location | null>(null);
  return (
    <LocationContext.Provider value={{ selected, setSelected }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
