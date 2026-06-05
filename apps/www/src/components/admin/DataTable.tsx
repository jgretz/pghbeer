import {useId, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

export type Column<Row> = {
  id: string;
  header: string;
  accessor: (row: Row) => string | number | boolean | null | undefined;
  cell?: (row: Row) => ReactNode;
};

export type RowAction<Row> = {
  label: string;
  onClick: (row: Row) => void;
  variant?: 'default' | 'danger';
};

export type DataTableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string | number;
  actions?: (row: Row) => RowAction<Row>[];
  filterPlaceholder?: string;
  emptyMessage?: string;
};

// Pure, exported for unit testing without a DOM harness. Returns rows where any
// column's stringified accessor value contains the (case-insensitive) query.
// Empty / whitespace-only queries pass every row through.
export function filterRows<Row>(
  rows: Row[],
  columns: Column<Row>[],
  query: string,
): Row[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return rows;

  return rows.filter((row) =>
    columns.some((column) =>
      String(column.accessor(row) ?? '')
        .toLowerCase()
        .includes(needle),
    ),
  );
}

export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  actions,
  filterPlaceholder,
  emptyMessage = 'Nothing here yet.',
}: DataTableProps<Row>) {
  const filterId = useId();
  const [query, setQuery] = useState('');

  const visibleRows = useMemo(
    () => filterRows(rows, columns, query),
    [rows, columns, query],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={filterId} className="sr-only">
          Filter
        </label>
        <input
          id={filterId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={filterPlaceholder ?? 'Filter…'}
          className="w-full max-w-xs rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted"
        />
      </div>

      {visibleRows.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-sm text-text-secondary">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-left">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className="px-4 py-2.5 font-semibold text-text-secondary"
                  >
                    {column.header}
                  </th>
                ))}
                {actions ? (
                  <th className="px-4 py-2.5 font-semibold text-text-secondary">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-border-light bg-surface last:border-b-0"
                >
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-2.5 text-text">
                      {column.cell ? column.cell(row) : column.accessor(row)}
                    </td>
                  ))}
                  {actions ? (
                    <td className="px-4 py-2.5">
                      <div className="flex gap-2">
                        {actions(row).map((action) => (
                          <button
                            key={action.label}
                            onClick={() => action.onClick(row)}
                            className={
                              action.variant === 'danger'
                                ? 'rounded-md px-2 py-1 text-xs font-medium text-red hover:underline'
                                : 'rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:text-text hover:underline'
                            }
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
