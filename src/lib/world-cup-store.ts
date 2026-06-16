import fs from 'node:fs';
import path from 'node:path';

import { getStore } from '@netlify/blobs';

import type { Bet, LiveSegment } from '~/types/syndicate';
import { withComputedSummary } from '~/utils/syndicate';

const BLOB_STORE = 'syndicate-world-cup';
const BLOB_KEY = 'world-cup-2026';
const FILE_PATH = path.join(process.cwd(), 'data/segments/world-cup-2026.json');

type StoredSegment = Omit<LiveSegment, 'summary'>;

function isNetlifyRuntime(): boolean {
  return process.env.NETLIFY === 'true' || Boolean(process.env.NETLIFY_DEV);
}

function readFileSegment(): StoredSegment {
  const raw = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')) as LiveSegment;
  const { summary: _summary, ...segment } = raw;
  void _summary;
  return segment;
}

function writeFileSegment(segment: StoredSegment): void {
  fs.writeFileSync(FILE_PATH, `${JSON.stringify(segment, null, 2)}\n`);
}

async function readBlobSegment(): Promise<StoredSegment | null> {
  const store = getStore(BLOB_STORE);
  return store.get(BLOB_KEY, { type: 'json' });
}

async function writeBlobSegment(segment: StoredSegment): Promise<void> {
  const store = getStore(BLOB_STORE);
  await store.setJSON(BLOB_KEY, segment);
}

async function readStoredSegment(): Promise<StoredSegment> {
  if (isNetlifyRuntime()) {
    const blobSegment = await readBlobSegment();
    if (blobSegment) {
      return blobSegment;
    }

    const seeded = readFileSegment();
    await writeBlobSegment(seeded);
    return seeded;
  }

  return readFileSegment();
}

async function writeStoredSegment(segment: StoredSegment): Promise<void> {
  if (isNetlifyRuntime()) {
    await writeBlobSegment(segment);
    return;
  }

  writeFileSegment(segment);
}

export async function getWorldCupSegment() {
  const segment = await readStoredSegment();
  return withComputedSummary(segment, segment.stakePerRound ?? 30);
}

export async function addWorldCupBet(bet: Bet) {
  const segment = await readStoredSegment();
  const existingIndex = segment.bets.findIndex((entry) => entry.gameWeek === bet.gameWeek);

  if (existingIndex >= 0) {
    segment.bets[existingIndex] = bet;
  } else {
    segment.bets.push(bet);
  }

  segment.bets.sort((a, b) => a.gameWeek - b.gameWeek);
  await writeStoredSegment(segment);
  return withComputedSummary(segment, segment.stakePerRound ?? 30);
}

export async function deleteWorldCupBet(gameWeek: number) {
  const segment = await readStoredSegment();
  segment.bets = segment.bets.filter((bet) => bet.gameWeek !== gameWeek);
  await writeStoredSegment(segment);
  return withComputedSummary(segment, segment.stakePerRound ?? 30);
}
