import {useId} from 'react';
import type {FormEvent} from 'react';

type FieldBase = {
  name: string;
  label: string;
  required?: boolean;
};

export type SelectOption = {value: string | number; label: string};

export type FieldDef =
  | (FieldBase & {type: 'text'})
  | (FieldBase & {type: 'number'})
  | (FieldBase & {type: 'checkbox'})
  | (FieldBase & {type: 'select'; options: SelectOption[]});

export type FieldValue = string | number | boolean | null | undefined;

export type EntityFormProps = {
  fields: FieldDef[];
  values: Record<string, FieldValue>;
  onChange: (name: string, value: FieldValue) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
  as?: 'modal' | 'inline';
};

export function EntityForm({
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  as = 'modal',
}: EntityFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map((field) => (
        <Field
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={onChange}
        />
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-secondary hover:text-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );

  if (as === 'inline') {
    return form;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg">
        {form}
      </div>
    </div>
  );
}

type FieldProps = {
  field: FieldDef;
  value: FieldValue;
  onChange: (name: string, value: FieldValue) => void;
};

function Field({field, value, onChange}: FieldProps) {
  const id = useId();
  const labelText = (
    <label htmlFor={id} className="text-sm font-medium text-text">
      {field.label}
      {field.required ? <span className="text-red"> *</span> : null}
    </label>
  );
  const inputClass =
    'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted';

  switch (field.type) {
    case 'text':
      return (
        <div className="flex flex-col gap-1.5">
          {labelText}
          <input
            id={id}
            type="text"
            required={field.required}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={inputClass}
          />
        </div>
      );
    case 'number':
      return (
        <div className="flex flex-col gap-1.5">
          {labelText}
          <input
            id={id}
            type="number"
            required={field.required}
            value={value === null || value === undefined ? '' : Number(value)}
            onChange={(e) =>
              onChange(field.name, e.target.value === '' ? null : Number(e.target.value))
            }
            className={inputClass}
          />
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="h-4 w-4"
          />
          {labelText}
        </div>
      );
    case 'select':
      return (
        <div className="flex flex-col gap-1.5">
          {labelText}
          <select
            id={id}
            required={field.required}
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {field.options.map((option) => (
              <option key={option.value} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
  }
}
