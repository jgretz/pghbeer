import {API_KEY, API_URL, EVENT_ID} from './constants';
import type {Beer, BeverageType, DashboardStats, EventBeerItem, EventInfo} from './types';

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

export interface EventDataResponse {
  event: EventInfo;
  beers: EventBeerItem[];
}

export async function fetchEventData(): Promise<EventDataResponse> {
  const res = await fetch(`${API_URL}/dataforevent?event_id=${EVENT_ID}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch event data: ${res.status} ${res.statusText}`);
  }
  const raw = await res.json();

  // Handle both old (flat array) and new ({event, beers}) API shapes
  const beerList: {beer: RawBeer}[] = Array.isArray(raw) ? raw : raw.beers;
  const event: EventInfo = raw.event ?? {name: '', date: ''};

  return {
    event,
    beers: beerList.map((item) => ({beer: normalizeBeer(item.beer)})),
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/stats/dashboard?event_id=${EVENT_ID}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function postStats(params: {
  beerId: number;
  eventId: number;
  userId: string;
  tasted: boolean;
}): Promise<void> {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const res = await fetch(`${API_URL}/stats`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to post stats: ${res.status} ${body}`);
  }
}
