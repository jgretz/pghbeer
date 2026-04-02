import {API_URL, EVENT_ID} from './constants';
import type {Beer, BeverageType, EventBeerItem} from './types';

interface RawBeer {
  id: number;
  name: string;
  abv: number | null;
  beverageType?: BeverageType;
  isNA?: boolean;
  brewery: {id: number; name: string};
  style: {name: string};
}

function normalizeBeer(raw: RawBeer): Beer {
  return {
    id: raw.id,
    name: raw.name,
    abv: raw.abv,
    beverageType: raw.beverageType ?? 'beer',
    isNA: raw.isNA ?? false,
    brewery: raw.brewery,
    style: raw.style,
  };
}

export async function fetchEventData(): Promise<EventBeerItem[]> {
  const res = await fetch(`${API_URL}/dataforevent?event_id=${EVENT_ID}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch event data: ${res.status} ${res.statusText}`);
  }
  const raw: {beer: RawBeer}[] = await res.json();
  return raw.map((item) => ({beer: normalizeBeer(item.beer)}));
}

export async function postStats(params: {
  beerId: number;
  eventId: number;
  userId: string;
  tasted: boolean;
}): Promise<void> {
  const res = await fetch(`${API_URL}/stats`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to post stats: ${res.status} ${body}`);
  }
}
