import fs from 'node:fs';
import path from 'node:path';

import type { LiveSegment, Season, SeasonSummary } from '~/types/syndicate';

const dataRoot = path.join(process.cwd(), 'data');

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export function withComputedSummary<T extends { bets: Season['bets']; summary?: SeasonSummary }>(
  record: T,
  stakePerRound = 30
): T & { summary: SeasonSummary } {
  const totalAmountWon = record.bets.reduce((acc, bet) => acc + bet.amountWon, 0);
  const totalSpend = record.bets.length * stakePerRound;
  const totalAmountWonByBettor = record.bets.reduce<Record<string, number>>((acc, bet) => {
    acc[bet.bettor] = (acc[bet.bettor] ?? 0) + bet.amountWon;
    return acc;
  }, {});

  return {
    ...record,
    summary: {
      betCount: record.bets.length,
      totalAmountWon,
      totalSpend,
      totalAmount: totalAmountWon - totalSpend,
      totalAmountWonByBettor,
    },
  };
}

export function getSeasons(): Season[] {
  const seasonsDir = path.join(dataRoot, 'seasons');

  return fs
    .readdirSync(seasonsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson<Season>(path.join(seasonsDir, file)))
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function getSeason(id: string): Season | undefined {
  const filePath = path.join(dataRoot, 'seasons', `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return readJson<Season>(filePath);
}

export function getLiveSegment(): LiveSegment {
  const filePath = path.join(dataRoot, 'segments', 'world-cup-2026.json');
  const segment = readJson<LiveSegment>(filePath);
  return withComputedSummary(segment, segment.stakePerRound ?? 30);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, total: number): string {
  if (total <= 0) {
    return '0%';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / total);
}

export const bettors = ['steven', 'luke', 'jamie'] as const;
