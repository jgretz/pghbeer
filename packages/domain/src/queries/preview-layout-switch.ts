import {breweries, mapLayouts, mapSlots} from 'database';
import {and, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {LayoutSwitchPreview} from '../types';

// Read-only preview of what switching the active layout to `targetLayoutId`
// would do to brewery assignments. Mirrors setActiveLayout exactly: an
// assignment carries only into a target table with the same label that is
// currently empty. Anything else is dropped — either the label has no table in
// the target, or that target table is already assigned and won't be overwritten.
// Used to populate the switch-confirmation dialog, so it must match the command.
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

  const targetTables = await db
    .select({label: mapSlots.label, breweryId: mapSlots.breweryId})
    .from(mapSlots)
    .where(and(eq(mapSlots.layoutId, targetLayoutId), eq(mapSlots.kind, 'table')));

  // label -> is there an empty target table able to receive a carried assignment
  const emptyTargetByLabel = new Map<string, boolean>();
  for (const t of targetTables) {
    const empty = t.breweryId == null;
    // any empty table for the label makes it receivable
    emptyTargetByLabel.set(t.label, (emptyTargetByLabel.get(t.label) ?? false) || empty);
  }

  let carried = 0;
  const unmatchedLabels: string[] = [];
  const droppedBreweries: {id: number; name: string}[] = [];

  for (const a of currentAssignments) {
    if (emptyTargetByLabel.get(a.label)) {
      carried += 1;
    } else {
      // No target table for the label at all → report it as unmatched.
      if (!emptyTargetByLabel.has(a.label)) unmatchedLabels.push(a.label);
      if (a.breweryId != null) {
        droppedBreweries.push({id: a.breweryId, name: a.breweryName});
      }
    }
  }

  return {carried, unmatchedLabels, droppedBreweries};
}
