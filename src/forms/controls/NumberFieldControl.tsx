// fields/NumberFieldControl.tsx
import React, { useEffect, useRef, useState } from "react";
import { TextField } from "@mui/material";
import { NumericFormat } from "react-number-format";
import { useNoAutofill } from "../../helpers/useNoAutofill";

const NumberFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const [localValue, setLocalValue] = useState<number | undefined>(props.value);
  // Ref so the blur handler always sees the latest typed value without stale closure.
  const localValueRef = useRef<number | undefined>(props.value);

  // Sync local state when the prop changes externally (e.g. after a save).
  useEffect(() => {
    setLocalValue(props.value);
    localValueRef.current = props.value;
  }, [props.value]);

  const handleValueChange = (v: number | undefined) => {
    localValueRef.current = v;
    setLocalValue(v);
  };

  const handleBlur = () => {
    // Cleared comes back from NumericFormat as `undefined`; the prop
    // it is compared against is `null`. Normalising here keeps an
    // empty box from reading as a change on every blur.
    const next = localValueRef.current ?? null;
    if (!props.disabled && next !== (props.value ?? null)) {
      props.handleChange(next);
    }
  };

  return (
    <NumericFormat
      customInput={TextField}
      className="numeric-input"
      fullWidth
      label={props.label}
      // Opt-in via `sync_empty`. NumericFormat reads a nullish value
      // as "uncontrolled" and keeps whatever text is already in the
      // box, so a field cleared from outside goes on displaying a
      // number the state no longer holds. `''` is controlled-empty
      // and fixes that — but it is a behaviour change for every
      // number field in both apps, so callers ask for it.
      value={props.sync_empty ? (localValue ?? "") : localValue}
      disabled={props.disabled}
      error={props.has_errors}
      autoFocus={props.autoFocus}
      // Suppress browser autofill / the saved-data dropdown. Chrome
      // and Edge ignore autocomplete="off" on the wrapper, so the
      // underlying input is set to "new-password" (the known
      // workaround) — matches TextFieldControl.
      autoComplete="off"
      decimalScale={props.decimals}
      fixedDecimalScale
      allowNegative
      onValueChange={(v) => handleValueChange(v.floatValue)}
      onBlur={handleBlur}
      slotProps={{
        htmlInput: noFill,
        input: {
          startAdornment: props.prefix ? <span>{props.prefix}</span> : null,
          endAdornment: props.suffix ? <span>{props.suffix}</span> : null,
        },
      }}
    />
  );
});

export default NumberFieldControl;
