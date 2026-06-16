export interface Bet {
  gameWeek: number;
  bettor: string;
  amountWon: number;
}

export interface SeasonSummary {
  betCount: number;
  totalAmountWon: number;
  totalSpend: number;
  totalAmount: number;
  totalAmountWonByBettor: Record<string, number>;
}

export interface Season {
  id: string;
  label: string;
  archivedFromCommit?: string | null;
  seasonEndedAt?: string;
  summary: SeasonSummary;
  bets: Bet[];
}

export interface LiveSegment extends Season {
  status: 'live' | 'archived';
  stakePerRound: number;
}
