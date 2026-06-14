import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface BetSlipItem {
  selectionId: number;
  odds: number;
  eventLabel: string;
  selectionLabel: string;
}

interface BetSlipContextValue {
  items: BetSlipItem[];
  add: (item: BetSlipItem) => void;
  remove: (selectionId: number) => void;
  clear: () => void;
  has: (selectionId: number) => boolean;
}

const BetSlipContext = createContext<BetSlipContextValue | null>(null);

export function BetSlipProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BetSlipItem[]>([]);

  const add = (item: BetSlipItem) =>
    setItems((prev) =>
      prev.some((i) => i.selectionId === item.selectionId)
        ? prev
        : [...prev, item]
    );
  const remove = (selectionId: number) =>
    setItems((prev) => prev.filter((i) => i.selectionId !== selectionId));
  const clear = () => setItems([]);
  const has = (selectionId: number) =>
    items.some((i) => i.selectionId === selectionId);

  return (
    <BetSlipContext.Provider value={{ items, add, remove, clear, has }}>
      {children}
    </BetSlipContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBetSlip() {
  const ctx = useContext(BetSlipContext);
  if (!ctx) throw new Error("useBetSlip deve ser usado dentro de BetSlipProvider");
  return ctx;
}
