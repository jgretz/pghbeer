import {useCallback, useEffect, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import * as maps from '../../lib/admin/maps';

// Owns everything at the event/layout level: the layout list and the selected
// layout's detail, the public-visibility flag, the brewery roster, and the
// create/duplicate/set-active/delete/enable mutations plus the switch preview.
// Keeps the route component free of layout orchestration.
export function useLayoutManager(eventId: number | null) {
  const qc = useQueryClient();

  const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(null);
  const [switchTarget, setSwitchTarget] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteDeps, setDeleteDeps] = useState<Record<string, number> | undefined>();

  const layoutsKey = ['admin', 'map', 'layouts', eventId];

  const enabledQ = useQuery({
    queryKey: ['admin', 'map', 'enabled', eventId],
    queryFn: () => maps.fetchEventEnabled({data: {eventId: eventId!}}),
    enabled: eventId != null,
  });
  const layoutsQ = useQuery({
    queryKey: layoutsKey,
    queryFn: () => maps.listLayouts({data: {eventId: eventId!}}),
    enabled: eventId != null,
  });
  const rosterQ = useQuery({
    queryKey: ['admin', 'map', 'roster', eventId],
    queryFn: () => maps.listEventBreweries({data: {eventId: eventId!}}),
    enabled: eventId != null,
  });
  const allBreweriesQ = useQuery({
    queryKey: ['admin', 'map', 'all-breweries'],
    queryFn: () => maps.listAllBreweries(),
    enabled: eventId != null,
  });
  const layoutQ = useQuery({
    queryKey: ['admin', 'map', 'layout', selectedLayoutId],
    queryFn: () => maps.getLayout({data: {layoutId: selectedLayoutId!}}),
    enabled: selectedLayoutId != null,
  });

  // Reset the selection when the event changes; the auto-select effect then
  // picks the new event's active (or first) layout once its list loads.
  useEffect(() => {
    setSelectedLayoutId(null);
  }, [eventId]);

  useEffect(() => {
    if (selectedLayoutId == null && layoutsQ.data?.length) {
      const active = layoutsQ.data.find((l) => l.isActive);
      setSelectedLayoutId(active?.id ?? layoutsQ.data[0].id);
    }
  }, [layoutsQ.data, selectedLayoutId]);

  const createMutation = useMutation({
    mutationFn: (name: string) => maps.createLayout({data: {eventId: eventId!, name}}),
    onSuccess: (layout) => {
      qc.invalidateQueries({queryKey: layoutsKey});
      setSelectedLayoutId(layout.id);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (vars: {layoutId: number; name: string}) =>
      maps.duplicateLayout({data: vars}),
    onSuccess: (layout) => {
      qc.invalidateQueries({queryKey: layoutsKey});
      setSelectedLayoutId(layout.id);
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (layoutId: number) =>
      maps.setActiveLayout({data: {eventId: eventId!, layoutId}}),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: layoutsKey});
      if (switchTarget != null) {
        qc.invalidateQueries({queryKey: ['admin', 'map', 'layout', switchTarget]});
      }
      setSwitchTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (layoutId: number) => maps.deleteLayout({data: {layoutId}}),
    onSuccess: (res) => {
      if (res.ok) {
        qc.invalidateQueries({queryKey: layoutsKey});
        if (deleteTarget === selectedLayoutId) setSelectedLayoutId(null);
        setDeleteTarget(null);
        setDeleteDeps(undefined);
      } else {
        setDeleteDeps(res.dependents);
      }
    },
  });

  const enabledMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      maps.setMapEnabled({data: {eventId: eventId!, enabled}}),
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin', 'map', 'enabled', eventId]}),
  });

  const previewQ = useQuery({
    queryKey: ['admin', 'map', 'preview', eventId, switchTarget],
    queryFn: () =>
      maps.previewLayoutSwitch({data: {eventId: eventId!, layoutId: switchTarget!}}),
    enabled: eventId != null && switchTarget != null,
  });

  const selectLayout = useCallback((id: number) => setSelectedLayoutId(id), []);

  const createLayout = useCallback(() => {
    const name = window.prompt('Layout name', 'Good Weather');
    if (name) createMutation.mutate(name);
  }, [createMutation]);

  const duplicateLayout = useCallback(
    (layoutId: number) => {
      const name = window.prompt('Name for the copy', 'Bad Weather');
      if (name) duplicateMutation.mutate({layoutId, name});
    },
    [duplicateMutation],
  );

  const requestDelete = useCallback(
    (id: number) => {
      setDeleteDeps(undefined);
      deleteMutation.reset();
      setDeleteTarget(id);
    },
    [deleteMutation],
  );

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
    setDeleteDeps(undefined);
  }, []);

  const toggleEnabled = useCallback(() => {
    enabledMutation.mutate(!(enabledQ.data?.enabled ?? false));
  }, [enabledMutation, enabledQ.data?.enabled]);

  return {
    selectedLayoutId,
    selectLayout,
    layouts: layoutsQ.data ?? [],
    layoutsLoading: layoutsQ.isLoading,
    layout: layoutQ.data,
    roster: rosterQ.data ?? [],
    allBreweries: allBreweriesQ.data ?? [],
    eventEnabled: enabledQ.data?.enabled ?? false,
    enablePending: enabledMutation.isPending,
    toggleEnabled,
    createLayout,
    duplicateLayout,
    // set-active / switch
    switchTarget,
    requestSetActive: setSwitchTarget,
    cancelSwitch: () => setSwitchTarget(null),
    confirmSetActive: () => switchTarget != null && setActiveMutation.mutate(switchTarget),
    setActivePending: setActiveMutation.isPending,
    preview: previewQ.data,
    previewLoading: previewQ.isLoading,
    // delete
    deleteTarget,
    deleteDeps,
    requestDelete,
    cancelDelete,
    confirmDelete: () => deleteTarget != null && deleteMutation.mutate(deleteTarget),
    deletePending: deleteMutation.isPending,
  };
}
