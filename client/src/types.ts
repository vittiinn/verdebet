export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  balanceCents: number;
}

export interface Selection {
  id: number;
  market_id: number;
  key: string;
  name: string;
  odds: number;
  prev_odds: number | null;
  updated_at: string;
}

export interface Market {
  id: number;
  event_id: number;
  key: string;
  name: string;
  selections: Selection[];
}

export interface GameEvent {
  id: number;
  sport_id: number;
  league: string;
  home_team: string;
  away_team: string;
  starts_at: string;
  status: string;
  markets: Market[];
}

export interface Sport {
  id: number;
  key: string;
  title: string;
  icon: string | null;
}

export interface Bet {
  id: number;
  event_label: string;
  selection_label: string;
  odds: number;
  stake_cents: number;
  potential_return_cents: number;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: string;
  amount_cents: number;
  status: string;
  reference: string | null;
  created_at: string;
}
