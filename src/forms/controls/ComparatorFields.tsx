import React from "react";
import FormField from "../FormField";

export type ComparatorOperator = {
  id: string;
  display: string;
  operands: number;
  value_kind: "number" | "days" | "date" | "set";
};

export type ComparatorValue = { op?: string; value?: unknown };

type PickerRow = { id: number | string; display: string };

type FieldSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type Props = {
  /** Names the operator dropdown — the field being compared. */
  label: string;
  operators: ComparatorOperator[];
  /** Where a `set` operand gets its rows, already resolved per app. */
  pickerUrl?: string;
  /** …or a fixed list, for a coded vocabulary. */
  options?: PickerRow[] | null;
  help?: string;
  value: ComparatorValue | undefined;
  onChange: (next: ComparatorValue) => void;
  /** Width of the operator dropdown when it stands alone. */
  size?: FieldSize;
  /**
   * Width of the operator dropdown when it has an operand beside it.
   * 4 suits a full-width row; a record condition puts a Property
   * dropdown to its left and wants 6 so the two halve the row.
   */
  operatorSize?: FieldSize;
  /**
   * Width of the operand. 8 sits beside a 4-wide operator; 12 drops
   * it onto its own line, which is what a record condition wants
   * once the operator is sharing the row above.
   */
  operandSize?: FieldSize;
};

/**
 * An operator and its operand — "is more than 5,400", "expires within
 * the next 30 days".
 *
 * The interesting part is that the value control depends on the
 * OPERATOR rather than just the kind. "Is missing" takes nothing. "Is
 * between" takes two numbers. "Is within the next … days" takes a
 * count. "Is before" takes a date. "Is one of" takes a multi-picker.
 * Five shapes out of one field, and each operator arrives carrying
 * `operands` and `value_kind` so this never reimplements the table
 * `Comparator::apply()` reads.
 *
 * Shared because it is now wanted in four places — the `comparator`
 * param type in each app, and once per test row inside a
 * `record_condition` in each app. What differs between the apps is
 * only where a picker's rows come from, which is why `pickerUrl`
 * arrives resolved rather than as a picker name.
 *
 * Renders a fragment of `FormField`s, so the parent must be a
 * flex-wrap row for the sizes to mean anything.
 */
const ComparatorFields: React.FC<Props> = ({
  label,
  operators,
  pickerUrl,
  options,
  help,
  value,
  onChange,
  size = 6,
  operatorSize = 4,
  operandSize = 8,
}) => {
  const spec = value ?? {};

  // Blank is not a reading of the field — it is the row half added.
  // Every operator list is ordered with the ordinary question first,
  // so the first is what somebody adding the row meant. `default_first`
  // on the dropdown stores it; this mirrors it for the render before
  // the change lands.
  const op = spec.op ?? operators[0]?.id;
  const chosen = operators.find((o) => o.id === op) ?? null;
  const operands = chosen?.operands ?? 1;
  const valueKind = chosen?.value_kind ?? "number";

  const setOp = (next: string) => {
    // The old operand rarely survives a change of operator — days are
    // not a date, one number is not two — so it is dropped rather than
    // carried into a shape it does not fit.
    const to = operators.find((o) => o.id === next);
    const keep = to && to.operands === operands && to.value_kind === valueKind;

    onChange({ op: next, value: keep ? spec.value : null });
  };

  // `op`, not `spec.op` — a defaulted operator has to be written
  // through with the operand, or the saved comparator carries a value
  // and no operator, which `Comparator::valid()` reads as unconfigured
  // and stops narrowing on.
  const setValue = (v: unknown) => onChange({ ...spec, op, value: v });

  const pair = (spec.value as (number | null)[] | undefined) ?? [];
  // "is between" takes two boxes; together they occupy what one
  // operand would have.
  const half = Math.max(1, Math.round(operandSize / 2)) as FieldSize;

  return (
    <>
      <FormField
        type="dropdown"
        label={label}
        size={operands === 0 ? size : operatorSize}
        value={op ?? ""}
        default_first
        content={operators.map((o) => ({ id: o.id, display: o.display }))}
        help_text={operands === 0 ? help : undefined}
        handleChange={(v) => setOp(String(v ?? ""))}
      />

      {operands === 1 && valueKind === "set" && (
        <FormField
          type="multi"
          label="Value"
          // Full width, unlike the single-value operands. A set holds
          // chips, and at 8 they wrapped to three rows in a box a
          // third the panel's width.
          size={12}
          url={pickerUrl}
          content={pickerUrl ? undefined : (options ?? [])}
          value={(spec.value as PickerRow[] | undefined) ?? []}
          help_text={help}
          handleChange={(v) => setValue(v ?? [])}
        />
      )}

      {operands === 1 && valueKind === "date" && (
        <FormField
          type="date"
          label="Value"
          size={operandSize}
          format="D/M/YYYY"
          nullable
          value={(spec.value as string | undefined) ?? null}
          help_text={help}
          handleChange={(v) => setValue(v)}
        />
      )}

      {operands === 1 && (valueKind === "number" || valueKind === "days") && (
        <FormField
          type="number"
          label={valueKind === "days" ? "Days" : "Value"}
          size={operandSize}
          decimals={valueKind === "days" ? 0 : 2}
          value={(spec.value as number | undefined) ?? null}
          help_text={help}
          handleChange={(v) => setValue(v === null ? null : Number(v))}
        />
      )}

      {operands === 2 && (
        <>
          <FormField
            type="number"
            label="From"
            size={half}
            decimals={2}
            value={pair[0] ?? null}
            handleChange={(v) =>
              setValue([v === null ? null : Number(v), pair[1] ?? null])
            }
          />
          <FormField
            type="number"
            label="To"
            size={half}
            decimals={2}
            value={pair[1] ?? null}
            help_text={help}
            handleChange={(v) =>
              setValue([pair[0] ?? null, v === null ? null : Number(v)])
            }
          />
        </>
      )}
    </>
  );
};

export default ComparatorFields;
