import {mapSlots} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';

export async function deleteSlot(slotId: number): Promise<{ok: true}> {
  const db = getDb();
  await db.delete(mapSlots).where(eq(mapSlots.id, slotId));
  return {ok: true};
}
