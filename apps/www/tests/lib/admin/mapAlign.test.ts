import {describe, expect, it} from 'bun:test';

import {alignSlots, type AlignKind} from '../../../src/lib/admin/mapAlign';
import type {DraftSlot} from '../../../src/lib/admin/mapDraft';

function makeDraftSlot(overrides: Partial<DraftSlot> = {}): DraftSlot {
  return {
    id: 1,
    label: 'T',
    kind: 'table',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    rotation: 0,
    locked: false,
    breweryId: null,
    breweryName: null,
    ...overrides,
  };
}

// Bounding box across these three: minX=0, maxX=120, minY=0, maxY=120,
// center (60, 60).
function trio(): DraftSlot[] {
  return [
    makeDraftSlot({id: 1, x: 0, y: 0, width: 10, height: 10}),
    makeDraftSlot({id: 2, x: 100, y: 100, width: 20, height: 20}),
    makeDraftSlot({id: 3, x: 50, y: 60, width: 10, height: 10}),
  ];
}

function patchMap(patches: {id: number; x?: number; y?: number}[]) {
  return new Map(patches.map((p) => [p.id, p]));
}

describe('alignSlots', function () {
  it('should return no patches for fewer than two slots', function () {
    expect(alignSlots([makeDraftSlot()], 'left')).toEqual([]);
    expect(alignSlots([], 'top')).toEqual([]);
  });

  it('should align left edges to the bounding-box min x', function () {
    const patches = patchMap(alignSlots(trio(), 'left'));

    expect(patches.get(1)!.x).toBe(0);
    expect(patches.get(2)!.x).toBe(0);
    expect(patches.get(3)!.x).toBe(0);
  });

  it('should align right edges to the bounding-box max x', function () {
    const patches = patchMap(alignSlots(trio(), 'right'));

    // maxX = 120; each x = 120 - width
    expect(patches.get(1)!.x).toBe(110);
    expect(patches.get(2)!.x).toBe(100);
    expect(patches.get(3)!.x).toBe(110);
  });

  it('should center horizontally on the bounding-box center', function () {
    const patches = patchMap(alignSlots(trio(), 'hcenter'));

    // cx = 60; each x = round(60 - width/2)
    expect(patches.get(1)!.x).toBe(55);
    expect(patches.get(2)!.x).toBe(50);
    expect(patches.get(3)!.x).toBe(55);
  });

  it('should align top edges to the bounding-box min y', function () {
    const patches = patchMap(alignSlots(trio(), 'top'));

    expect(patches.get(1)!.y).toBe(0);
    expect(patches.get(2)!.y).toBe(0);
    expect(patches.get(3)!.y).toBe(0);
  });

  it('should align bottom edges to the bounding-box max y', function () {
    const patches = patchMap(alignSlots(trio(), 'bottom'));

    // maxY = 120; each y = 120 - height
    expect(patches.get(1)!.y).toBe(110);
    expect(patches.get(2)!.y).toBe(100);
    expect(patches.get(3)!.y).toBe(110);
  });

  it('should center vertically on the bounding-box center', function () {
    const patches = patchMap(alignSlots(trio(), 'vcenter'));

    // cy = 60; each y = round(60 - height/2)
    expect(patches.get(1)!.y).toBe(55);
    expect(patches.get(2)!.y).toBe(50);
    expect(patches.get(3)!.y).toBe(55);
  });

  it('should only emit the relevant axis for an alignment', function () {
    const [patch] = alignSlots([makeDraftSlot({id: 1}), makeDraftSlot({id: 2})], 'left');

    expect(patch).toHaveProperty('x');
    expect(patch!.y).toBeUndefined();
  });

  it('should leave the first and last slots fixed when distributing horizontally', function () {
    // centers: A=10, C=90, B=210 → first=10, last=210, step=100
    const slots = [
      makeDraftSlot({id: 1, x: 0, width: 20}), // center 10
      makeDraftSlot({id: 2, x: 200, width: 20}), // center 210
      makeDraftSlot({id: 3, x: 80, width: 20}), // center 90
    ];

    const patches = patchMap(alignSlots(slots, 'distribute-h'));

    expect(patches.get(1)!.x).toBe(0); // first stays
    expect(patches.get(2)!.x).toBe(200); // last stays
    expect(patches.get(3)!.x).toBe(100); // middle evenly spaced (center 110)
  });

  it('should evenly space centers when distributing vertically', function () {
    const slots = [
      makeDraftSlot({id: 1, y: 0, height: 20}), // center 10
      makeDraftSlot({id: 2, y: 200, height: 20}), // center 210
      makeDraftSlot({id: 3, y: 60, height: 20}), // center 70
    ];

    const patches = patchMap(alignSlots(slots, 'distribute-v'));

    expect(patches.get(1)!.y).toBe(0);
    expect(patches.get(2)!.y).toBe(200);
    expect(patches.get(3)!.y).toBe(100);
  });

  it('should return no patches when distributing fewer than three slots', function () {
    const two = [makeDraftSlot({id: 1, x: 0}), makeDraftSlot({id: 2, x: 100})];

    expect(alignSlots(two, 'distribute-h')).toEqual([]);
    expect(alignSlots(two, 'distribute-v')).toEqual([]);
  });

  it('should emit one patch per slot for edge alignments', function () {
    const kinds: AlignKind[] = ['left', 'right', 'hcenter', 'top', 'bottom', 'vcenter'];

    for (const kind of kinds) {
      expect(alignSlots(trio(), kind)).toHaveLength(3);
    }
  });
});
