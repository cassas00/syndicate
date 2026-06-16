import type { Bet, LiveSegment } from '~/types/syndicate';
import { formatCurrency, formatPercent } from '~/lib/syndicate-format';

const bettors = ['steven', 'luke', 'jamie'] as const;

function getAssetPath(name: string): string {
  const base = document.querySelector<HTMLElement>('[data-live-segment]')?.dataset.assetBase ?? '';
  return `${base}/${name}.png`;
}

function updateStat(key: string, value: string) {
  document.querySelectorAll(`[data-live-stat="${key}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function renderBetsTable(bets: Bet[], roundLabel: string) {
  const table = document.querySelector<HTMLElement>('[data-live-bets-table]');
  if (!table) {
    return;
  }

  if (bets.length === 0) {
    table.innerHTML =
      '<p class="syndicate-glass py-12 text-center text-muted">No rounds recorded yet. The saga begins soon.</p>';
    return;
  }

  const rows = bets
    .map(
      (bet) => `
        <tr>
          <td class="px-4 py-4 text-sm font-bold text-neutral-300">${bet.gameWeek}</td>
          <td class="px-4 py-4">
            <div class="flex items-center gap-3">
              <div class="syndicate-avatar-ring inline-block">
                <img src="${getAssetPath(bet.bettor)}" alt="${bet.bettor}" width="40" height="40" class="rounded-full bg-neutral-900" />
              </div>
              <span class="font-semibold capitalize tracking-wide text-neutral-200">${bet.bettor}</span>
            </div>
          </td>
          <td class="px-4 py-4 text-right text-sm font-bold text-neutral-100 transition-colors">${formatCurrency(bet.amountWon)}</td>
        </tr>
      `
    )
    .join('');

  table.innerHTML = `
    <div class="syndicate-table-wrap overflow-x-auto">
      <table class="min-w-full divide-y divide-neutral-800/80">
        <thead class="bg-neutral-900/80">
          <tr>
            <th class="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">${roundLabel}</th>
            <th class="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Bettor</th>
            <th class="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Won</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-800/60">${rows}</tbody>
      </table>
    </div>
  `;
}

function applySegment(segment: LiveSegment) {
  const { summary } = segment;

  updateStat('totalWon', formatCurrency(summary.totalAmountWon));
  updateStat('totalSpend', formatCurrency(summary.totalSpend));
  updateStat('profit', formatCurrency(summary.totalAmount));
  updateStat('each', formatCurrency(summary.totalAmount / 3));

  for (const bettor of bettors) {
    const amount = summary.totalAmountWonByBettor[bettor] ?? 0;
    document.querySelectorAll(`[data-live-bettor="${bettor}"]`).forEach((node) => {
      node.textContent = formatCurrency(amount);
    });
    document.querySelectorAll(`[data-live-bettor-share="${bettor}"]`).forEach((node) => {
      node.textContent = `${formatPercent(amount, summary.totalAmountWon)} of winnings`;
    });
  }

  const roundLabel = document.querySelector<HTMLElement>('[data-live-segment]')?.dataset.roundLabel ?? 'Round';
  renderBetsTable(segment.bets, roundLabel);
}

async function refreshLiveSegment() {
  const root = document.querySelector<HTMLElement>('[data-live-segment]');
  if (!root) {
    return;
  }

  try {
    const response = await fetch('/api/world-cup', { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      return;
    }

    const segment = (await response.json()) as LiveSegment;
    applySegment(segment);
  } catch {
    // Keep SSR fallback content when the API is unavailable.
  }
}

refreshLiveSegment();

document.addEventListener('syndicate:live-refresh', () => {
  void refreshLiveSegment();
});
