import {breweries, mapLayouts, mapSlots} from 'database';
import {and, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {LayoutSwitchPreview} from '../types';

// Read-only preview of what switching the active layout to `targetLayoutId`
// would do to brewery assignments. Assignments carry over to the target by
// matching slot label; assignments whose label has no table in the target are
// dropped. Used to populate the switch-confirmation dialog.
export async function previewLayoutSwitch(
  eventId: number,
  targetLayoutId: number,
): Promise<LayoutSwitchPreview> {
  const db = getDb();

  const [current] = await db
    .select({id: mapLayouts.id})
    .from(mapLayouts)
    .where(and(eq(mapLayouts.eventId, eventId), eq(mapLayouts.isActive, true)))
    .limit(1);

  // No current active layout (or switching to the one already active) → nothing
  // to carry, nothing dropped.
  if (!current || current.id === targetLayoutId) {
    return {carried: 0, unmatchedLabels: [], droppedBreweries: []};
  }

  const currentAssignments = await db
    .select({
      label: mapSlots.label,
      breweryId: mapSlots.breweryId,
      breweryName: breweries.name,
    })
    .from(mapSlots)
    .innerJoin(breweries, eq(mapSlots.breweryId, breweries.id))
    .where(and(eq(mapSlots.layoutId, current.id), eq(mapSlots.kind, 'table')));

  const targetLabelRows = await db
    .select({label: mapSlots.label})
    .from(mapSlots)
    .where(and(eq(mapSlots.layoutId, targetLayoutId), eq(mapSlots.kind, 'table')));

  const targetLabels = new Set(targetLabelRows.map((r) => r.label));

  let carried = 0;
  const unmatchedLabels: string[] = [];
  const droppedBreweries: {id: number; name: string}[] = [];

  for (const a of currentAssignments) {
    if (targetLabels.has(a.label)) {
      carried += 1;
    } else {
      unmatchedLabels.push(a.label);
      if (a.breweryId != null) {
        droppedBreweries.push({id: a.breweryId, name: a.breweryName});
      }
    }
  }

  return {carried, unmatchedLabels, droppedBreweries};
}
