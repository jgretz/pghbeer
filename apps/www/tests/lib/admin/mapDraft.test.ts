import {describe, expect, it} from 'bun:test';

import {
  draftReducer,
  isTempId,
  makeSlot,
  type DraftAction,
  type DraftSlot,
} from '../../../src/lib/admin/mapDraft';

function makeDraftSlot(overrides: Partial<DraftSlot> = {}): DraftSlot {
  return {
    id: 1,
    label: 'T1',
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

describe('draftReducer', function () {
  it('should replace the whole state on LOAD', function () {
    const initial = [makeDraftSlot({id: 1})];
    const loaded = [makeDraftSlot({id: 2}), makeDraftSlot({id: 3})];

    const next = draftReducer(initial, {type: 'LOAD', slots: loaded});

    expect(next).toEqual(loaded);
  });

  it('should append on ADD', function () {
    const state = [makeDraftSlot({id: 1})];
    const added = makeDraftSlot({id: -1, label: 'new'});

    const next = draftReducer(state, {type: 'ADD', slot: added});

    expect(next).toHaveLength(2);
    expect(next[1]).toBe(added);
  });

  it('should patch only the matching slot on UPDATE', function () {
    const state = [makeDraftSlot({id: 1, x: 0}), makeDraftSlot({id: 2, x: 0})];

    const next = draftReducer(state, {type: 'UPDATE', id: 2, patch: {x: 99}});

    expect(next[0]!.x).toBe(0);
    expect(next[1]!.x).toBe(99);
  });

  it('should apply per-id patches on UPDATE_MANY', function () {
    const state = [
      makeDraftSlot({id: 1, x: 0}),
      makeDraftSlot({id: 2, x: 0}),
      makeDraftSlot({id: 3, x: 0}),
    ];

    const next = draftReducer(state, {
      type: 'UPDATE_MANY',
      updates: [
        {id: 1, patch: {x: 10}},
        {id: 3, patch: {x: 30}},
      ],
    });

    expect(next.map((s) => s.x)).toEqual([10, 0, 30]);
  });

  it('should remove the listed ids on DELETE', function () {
    const state = [
      makeDraftSlot({id: 1}),
      makeDraftSlot({id: 2}),
      makeDraftSlot({id: 3}),
    ];

    const next = draftReducer(state, {type: 'DELETE', ids: [1, 3]});

    expect(next.map((s) => s.id)).toEqual([2]);
  });

  it('should set brewery id and name on the matching slot on ASSIGN', function () {
    const state = [
      makeDraftSlot({id: 1}),
      makeDraftSlot({id: 2, breweryId: null, breweryName: null}),
    ];

    const next = draftReducer(state, {
      type: 'ASSIGN',
      id: 2,
      breweryId: 7,
      breweryName: 'Dancing Gnome',
    });

    expect(next[0]).toMatchObject({breweryId: null, breweryName: null});
    expect(next[1]).toMatchObject({breweryId: 7, breweryName: 'Dancing Gnome'});
  });

  it('should clear an assignment when ASSIGN passes null', function () {
    const state = [makeDraftSlot({id: 1, breweryId: 7, breweryName: 'Gnome'})];

    const next = draftReducer(state, {
      type: 'ASSIGN',
      id: 1,
      breweryId: null,
      breweryName: null,
    });

    expect(next[0]).toMatchObject({breweryId: null, breweryName: null});
  });

  it('should return state unchanged for an unknown action', function () {
    const state = [makeDraftSlot({id: 1})];

    const next = draftReducer(state, {type: 'NOPE'} as unknown as DraftAction);

    expect(next).toBe(state);
  });
});

describe('isTempId', function () {
  it('should treat negative ids as temporary', function () {
    expect(isTempId(-1)).toBe(true);
  });

  it('should treat zero and positive ids as persisted', function () {
    expect(isTempId(0)).toBe(false);
    expect(isTempId(42)).toBe(false);
  });
});

describe('makeSlot', function () {
  const world = {width: 1000, height: 1000};

  it('should center a table of default size with no offset', function () {
    const slot = makeSlot(-1, 'table', 'T1', world);

    expect(slot).toMatchObject({
      id: -1,
      label: 'T1',
      kind: 'table',
      width: 50,
      height: 50,
      x: 475,
      y: 475,
      breweryId: null,
    });
  });

  it('should give zones a larger default size', function () {
    const slot = makeSlot(-1, 'zone', 'Inside', world);

    expect(slot).toMatchObject({kind: 'zone', width: 300, height: 200});
    expect(slot.x).toBe(350);
    expect(slot.y).toBe(400);
  });

  it('should cascade successive slots by the offset', function () {
    const first = makeSlot(-1, 'table', 'T1', world, 0);
    const second = makeSlot(-2, 'table', 'T2', world, 1);

    expect(second.x - first.x).toBe(24);
    expect(second.y - first.y).toBe(24);
  });

  it('should wrap the cascade every 8 slots', function () {
    const base = makeSlot(-1, 'table', 'T1', world, 0);
    const eighth = makeSlot(-9, 'table', 'T9', world, 8);

    expect(eighth.x).toBe(base.x);
    expect(eighth.y).toBe(base.y);
  });
});
