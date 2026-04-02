import {useState} from 'react';
import {STORAGE_KEYS} from '../lib/constants';

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(STORAGE_KEYS.userId);
  if (stored) return stored;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEYS.userId, id);
  return id;
}

export function useUserId(): string {
  const [userId] = useState(getOrCreateUserId);
  return userId;
}
