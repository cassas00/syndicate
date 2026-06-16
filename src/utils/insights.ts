import type { Bet, Season } from '~/types/syndicate';
import { bettors, getLiveSegment, getSeasons } from '~/utils/syndicate';

export interface BettorInsight {
  name: (typeof bettors)[number];
  rounds: number;
  wins: number;
  winRate: number;
  totalWon: number;
  shareOfWinnings: number;
  biggestWin: Bet & { seasonId: string };
  longestDrySpell: number;
  averageWin: number;
}

export interface SeasonInsight {
  season: Season;
  mvp: (typeof bettors)[number];
  mvpAmount: number;
  profitShare: number;
}

export interface SyndicateInsights {
  seasons: SeasonInsight[];
  liveSegmentLabel: string;
  liveRounds: number;
  allTime: {
    rounds: number;
    wins: number;
    winRate: number;
    totalWon: number;
    totalSpend: number;
    totalProfit: number;
    profitEach: number;
    biggestWin: Bet & { seasonId: string; seasonLabel: string };
    bestSeason: SeasonInsight;
  };
  bettors: BettorInsight[];
}

type TaggedBet = Bet & { seasonId: string; seasonLabel: string };

function getAllSeasonBets(seasons: Season[]): TaggedBet[] {
  return seasons.flatMap((season) =>
    season.bets.map((bet) => ({
      ...bet,
      seasonId: season.id,
      seasonLabel: season.label,
    }))
  );
}

function longestDrySpell(bets: Bet[]): number {
  let max = 0;
  let current = 0;

  for (const bet of bets) {
    if (bet.amountWon === 0) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
}

function buildBettorInsights(allBets: TaggedBet[], totalWon: number): BettorInsight[] {
  return bettors.map((name) => {
    const bets = allBets.filter((bet) => bet.bettor === name);
    const wins = bets.filter((bet) => bet.amountWon > 0);
    const biggestWin = bets.reduce<TaggedBet>(
      (best, bet) => (bet.amountWon > best.amountWon ? bet : best),
      bets[0] ?? { gameWeek: 0, bettor: name, amountWon: 0, seasonId: '', seasonLabel: '' }
    );

    return {
      name,
      rounds: bets.length,
      wins: wins.length,
      winRate: bets.length ? wins.length / bets.length : 0,
      totalWon: bets.reduce((sum, bet) => sum + bet.amountWon, 0),
      shareOfWinnings: totalWon ? bets.reduce((sum, bet) => sum + bet.amountWon, 0) / totalWon : 0,
      biggestWin,
      longestDrySpell: longestDrySpell(bets),
      averageWin: wins.length ? wins.reduce((sum, bet) => sum + bet.amountWon, 0) / wins.length : 0,
    };
  });
}

function buildSeasonInsights(seasons: Season[], totalProfit: number): SeasonInsight[] {
  return seasons.map((season) => {
    const mvpEntry = bettors
      .map((name) => ({
        name,
        amount: season.summary.totalAmountWonByBettor[name] ?? 0,
      }))
      .sort((a, b) => b.amount - a.amount)[0];

    return {
      season,
      mvp: mvpEntry.name,
      mvpAmount: mvpEntry.amount,
      profitShare: totalProfit ? season.summary.totalAmount / totalProfit : 0,
    };
  });
}

export function getSyndicateInsights(): SyndicateInsights {
  const seasons = getSeasons();
  const liveSegment = getLiveSegment();
  const allBets = getAllSeasonBets(seasons);

  const totalWon = seasons.reduce((sum, season) => sum + season.summary.totalAmountWon, 0);
  const totalSpend = seasons.reduce((sum, season) => sum + season.summary.totalSpend, 0);
  const totalProfit = seasons.reduce((sum, season) => sum + season.summary.totalAmount, 0);
  const wins = allBets.filter((bet) => bet.amountWon > 0).length;

  const biggestWin = allBets.reduce<TaggedBet>(
    (best, bet) => (bet.amountWon > best.amountWon ? bet : best),
    allBets[0]
  );

  const seasonInsights = buildSeasonInsights(seasons, totalProfit);
  const bestSeason = [...seasonInsights].sort((a, b) => b.season.summary.totalAmount - a.season.summary.totalAmount)[0];

  return {
    seasons: seasonInsights,
    liveSegmentLabel: liveSegment.label,
    liveRounds: liveSegment.summary.betCount,
    allTime: {
      rounds: allBets.length,
      wins,
      winRate: allBets.length ? wins / allBets.length : 0,
      totalWon,
      totalSpend,
      totalProfit,
      profitEach: totalProfit / 3,
      biggestWin,
      bestSeason,
    },
    bettors: buildBettorInsights(allBets, totalWon).sort((a, b) => b.totalWon - a.totalWon),
  };
}
