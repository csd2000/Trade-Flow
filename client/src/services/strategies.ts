import { Strategy } from "../data/strategies";

export async function saveUserStrategy(strategy: Strategy) {
  console.log("saving strategy:", strategy.slug);
  alert(`Strategy "${strategy.title}" saved to your favorites!`);
  return { ok: true };
}

export async function setAlertsForStrategy(slug: string) {
  console.log("alerts set for:", slug);
  alert(`Price alerts enabled for this strategy. You'll be notified when market conditions match.`);
  return { ok: true };
}

export async function openInBuilder(slug: string) {
  window.location.href = `/strategies`;
}

export async function backtestStrategy(slug: string) {
  window.location.href = `/backtest/${encodeURIComponent(slug)}`;
}