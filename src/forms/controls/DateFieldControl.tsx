import React, { useEffect, useRef, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import { useNoAutofill } from "../../helpers/useNoAutofill";

/**
 * Thin wrapper around MUI X DatePicker. Picker is uncontrolled —
 * we set defaultValue from props once, let MUI manage its own
 * input state through typing (so partial sections aren't
 * clobbered by external re-renders), and only push the value
 * back up on blur.
 *
 * The picker remounts only when an *external* value change arrives
 * (e.g. parent loads a draft or resets the form). When our own
 * handleBlur emits a value and the parent echoes it back through
 * props.value, lastEmittedRef matches and we skip the reseed —
 * otherwise the field would lose focus mid-type as soon as a valid
 * date became typeable.
 */
const DateFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const initial = props.value ? dayjs(props.value) : null;
  const valueRef = useRef<Dayjs | null>(initial);
  const lastEmittedRef = useRef<string | null>(props.value ?? null);
  const [reseed, setReseed] = useState(0);

  useEffect(() => {
    if (props.value === lastEmittedRef.current) return;
    lastEmittedRef.current = props.value ?? null;
    valueRef.current = props.value ? dayjs(props.value) : null;
    setReseed((r) => r + 1);
  }, [props.value]);

  const handleBlur = () => {
    const v = valueRef.current;
    if (!v) {
      if (props.value !== null && props.value !== undefined) {
        lastEmittedRef.current = null;
        props.handleChange(null);
      }
      return;
    }
    if (v.isValid()) {
      const formatted = v.format("YYYY-MM-DD");
      if (formatted !== props.value) {
        lastEmittedRef.current = formatted;
        props.handleChange(formatted);
      }
    }
  };

  return (
    <DatePicker
      key={reseed}
      className="w-full"
      label={props.label}
      defaultValue={valueRef.current}
      disabled={props.disabled}
      format={props.format ?? "DD/MM/YYYY"}
      shouldDisableDate={props.shouldDisableDate}
      onChange={(newValue) => {
        valueRef.current = newValue;
      }}
      onAccept={(newValue,ctx) => {
        // Picker "OK" doesn't blur the text field, so handleBlur
        // wouldn't fire until the user tabbed out. Commit immediately.
        valueRef.current = newValue;
        if (ctx.validationError==null){
        //  handleBlur();
        }
      }}
      onClose={()=>{
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

export default DateFieldControl;
