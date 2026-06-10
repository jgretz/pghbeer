import {useCallback, useEffect, useMemo, useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';

import {listEvents} from '../../lib/admin/events';
import {useLayoutManager} from '../../hooks/admin/useLayoutManager';
import {useMapEditor} from '../../hooks/admin/useMapEditor';
import {AdminMapCanvas} from '../../components/admin/map/AdminMapCanvas';
import {SlotInspector} from '../../components/admin/map/SlotInspector';
import {BreweryPickerSheet} from '../../components/admin/map/BreweryPickerSheet';
import {LayoutSwitcher} from '../../components/admin/map/LayoutSwitcher';
import {ModeTab} from '../../components/admin/map/ModeTab';
import {ToolbarButton} from '../../components/admin/map/ToolbarButton';
import {SwitchConfirm} from '../../components/admin/map/SwitchConfirm';
import {ConfirmDelete} from '../../components/admin/ConfirmDelete';
import {EVENT_ID} from '../../lib/constants';

export const Route = createFileRoute('/admin/map')({
  head: () => ({meta: [{title: 'PghBeer — Map'}]}),
  component: AdminMap,
});

function AdminMap() {
  const eventsQ = useQuery({queryKey: ['admin', 'events'], queryFn: () => listEvents()});

  const [eventId, setEventId] = useState<number | null>(null);
  const [mode, setMode] = useState<'layout' | 'assign'>('layout');
  const [tool, setTool] = useState<'move' | 'select'>('move');

  // Default the selected event once the list loads.
  useEffect(() => {
    if (eventId == null && eventsQ.data?.length) {
      const preferred = eventsQ.data.find((e) => String(e.id) === EVENT_ID);
      setEventId(preferred?.id ?? eventsQ.data[0].id);
    }
  }, [eventsQ.data, eventId]);

  const manager = useLayoutManager(eventId);
  const world = useMemo(
    () => ({width: manager.layout?.width ?? 1000, height: manager.layout?.height ?? 1000}),
    [manager.layout?.width, manager.layout?.height],
  );
  const editor = useMapEditor({
    layout: manager.layout,
    world,
    roster: manager.roster,
    layoutId: manager.selectedLayoutId,
  });

  const changeEvent = useCallback(
    (id: number) => {
      setEventId(id);
      setMode('layout');
      editor.clearSelection();
    },
    [editor],
  );

  const handleSelectLayout = useCallback(
    (id: number) => {
      manager.selectLayout(id);
      setMode('layout');
      editor.clearSelection();
    },
    [manager, editor],
  );

  const switchToAssign = useCallback(async () => {
    if (editor.dirty) await editor.saveAsync();
    editor.clearSelection();
    setMode('assign');
  }, [editor]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-gold">Festival Map</h1>
        <div className="flex items-center gap-3">
          <select
            value={eventId ?? ''}
            onChange={(e) => changeEvent(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
          >
            {(eventsQ.data ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={manager.toggleEnabled}
            disabled={eventId == null || manager.enablePending}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              manager.eventEnabled
                ? 'bg-gold text-check-fg'
                : 'border border-border bg-surface text-text-secondary'
            }`}
          >
            {manager.eventEnabled ? 'Map: Public' : 'Map: Hidden'}
          </button>
        </div>
      </div>

      {manager.layoutsLoading ? (
        <p className="text-sm text-text-secondary">Loading layouts…</p>
      ) : (
        <LayoutSwitcher
          layouts={manager.layouts}
          selectedLayoutId={manager.selectedLayoutId}
          onSelect={handleSelectLayout}
          onCreate={manager.createLayout}
          onDuplicate={manager.duplicateLayout}
          onSetActive={manager.requestSetActive}
          onDelete={manager.requestDelete}
        />
      )}

      {manager.selectedLayoutId != null && manager.layout && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-border">
              <ModeTab active={mode === 'layout'} onClick={() => setMode('layout')}>
                Layout
              </ModeTab>
              <ModeTab active={mode === 'assign'} onClick={switchToAssign}>
                Assign
              </ModeTab>
            </div>

            {mode === 'layout' ? (
              <>
                <ToolbarButton onClick={() => editor.addSlot('table')}>
                  + Table
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.addSlot('zone')}>
                  + Zone
                </ToolbarButton>
                <div className="flex overflow-hidden rounded-lg border border-border">
                  <ModeTab active={tool === 'move'} onClick={() => setTool('move')}>
                    Move
                  </ModeTab>
                  <ModeTab active={tool === 'select'} onClick={() => setTool('select')}>
                    Box select
                  </ModeTab>
                </div>
                <button
                  type="button"
                  onClick={() => editor.save()}
                  disabled={!editor.dirty || editor.saving}
                  className="ml-auto rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg disabled:opacity-50"
                >
                  {editor.saving ? 'Saving…' : editor.dirty ? 'Save changes' : 'Saved'}
                </button>
              </>
            ) : (
              <span className="ml-auto rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary">
                {editor.unassignedCount} unassigned
              </span>
            )}
          </div>

          {editor.saveError && (
            <p className="text-sm text-red">
              {editor.saveError instanceof Error
                ? editor.saveError.message
                : 'Save failed.'}
            </p>
          )}

          <div className="h-[60vh] min-h-[320px]">
            <AdminMapCanvas
              width={world.width}
              height={world.height}
              slots={editor.draft}
              mode={mode}
              tool={tool}
              selectedIds={editor.selectedIds}
              onSelect={editor.setSelectedIds}
              onToggleSelect={editor.toggleSelect}
              onSlotsMove={editor.moveSlots}
              onSlotResize={editor.resizeSlot}
              onAssignTap={editor.onAssignTap}
              onBackgroundTap={editor.clearSelection}
            />
          </div>

          {mode === 'layout' && editor.selectedSlots.length > 0 && (
            <SlotInspector
              slots={editor.selectedSlots}
              onField={editor.editField}
              onToggleLock={editor.toggleLock}
              onDuplicate={editor.duplicateSelected}
              onDelete={editor.deleteSelected}
              onAlign={editor.alignSelected}
            />
          )}
        </>
      )}

      {editor.pickerSlot && (
        <BreweryPickerSheet
          slotLabel={editor.pickerSlot.label}
          breweries={manager.roster}
          assignedLabels={editor.assignedLabels}
          currentBreweryId={editor.pickerSlot.breweryId}
          onPick={(breweryId) => editor.assign(editor.pickerSlot!.id, breweryId)}
          onClear={() => editor.assign(editor.pickerSlot!.id, null)}
          onClose={editor.closePicker}
        />
      )}

      {manager.switchTarget != null && (
        <SwitchConfirm
          loading={manager.previewLoading}
          preview={manager.preview}
          confirming={manager.setActivePending}
          onConfirm={manager.confirmSetActive}
          onCancel={manager.cancelSwitch}
        />
      )}

      <ConfirmDelete
        open={manager.deleteTarget !== null}
        title="Delete this layout?"
        message="This removes the layout and its slots. This cannot be undone."
        dependents={manager.deleteDeps}
        confirming={manager.deletePending}
        onConfirm={manager.confirmDelete}
        onCancel={manager.cancelDelete}
      />
    </div>
  );
}
