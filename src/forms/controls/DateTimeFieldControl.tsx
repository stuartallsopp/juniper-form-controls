import React, { useEffect, useRef } from "react";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import { useNoAutofill } from "../../helpers/useNoAutofill";

/**
 * Same pattern as DateFieldControl — picker is uncontrolled,
 * defaultValue establishes the start, ref tracks edits, onBlur
 * commits the final value up to the parent. Re-keyed on
 * props.value so external resets remount with the new default.
 *
 * Strips any timezone offset off the inbound string so dayjs
 * treats it as naive — the API returns local-tz datetimes and
 * we display them as such.
 */
const DateTimeFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const stripTz = (s: string | null | undefined): string | null =>
    s ? s.replace(/Z$|[+-]\d{2}:\d{2}$/, "") : null;

  const initialRaw = stripTz(props.value);
  const initialValue = initialRaw ? dayjs(initialRaw) : null;
  const valueRef = useRef<Dayjs | null>(initialValue);

  useEffect(() => {
    const raw = stripTz(props.value);
    valueRef.current = raw ? dayjs(raw) : null;
  }, [props.value]);

  const handleBlur = () => {
    const v = valueRef.current;
    if (!v) {
      if (props.value !== null && props.value !== undefined) {
        props.handleChange(null);
      }
      return;
    }
    if (v.isValid()) {
      const formatted = v.format("YYYY-MM-DDTHH:mm:ss");
      const current = stripTz(props.value);
      if (formatted !== current) {
        props.handleChange(formatted);
      }
    }
  };

  return (
    <DateTimePicker
      key={props.value ?? "__null__"}
      className="w-full"
      label={props.label}
      defaultValue={initialValue}
      disabled={props.disabled}
      format={props.format ?? "DD/MM/YYYY HH:mm"}
      onChange={(newValue) => {
        valueRef.current = newValue;
      }}
      onAccept={(newValue) => {
        // Picker "OK" doesn't blur the text field, so handleBlur
        // wouldn't fire until the user tabbed out and the parent
        // re-rendered late. Commit immediately on accept.
        valueRef.current = newValue;
        handleBlur();
      }}
      slotProps={{
        // new-password suppresses the browser autofill menu over the
        // picker's text input (Chrome ignores autocomplete="off").
        textField: {
          onBlur: handleBlur,
          slotProps: { htmlInput: noFill },
        },
        actionBar: { actions: ["clear", "today", "accept"] },
      }}
    />
  );
});

export default DateTimeFieldControl;
