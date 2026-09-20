import React, { useEffect, useRef } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import { useNoAutofill } from "../../helpers/useNoAutofill";

/**
 * Year-only DatePicker. Same uncontrolled-with-onBlur-commit
 * pattern as DateFieldControl so partial input doesn't get
 * clobbered by re-renders during typing.
 */
const YearFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const initialValue = props.value ? dayjs(props.value) : null;
  const valueRef = useRef<Dayjs | null>(initialValue);

  useEffect(() => {
    valueRef.current = props.value ? dayjs(props.value) : null;
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
      const formatted = v.startOf("year").format("YYYY-MM-DD");
      if (formatted !== props.value) {
        props.handleChange(formatted);
      }
    }
  };

  return (
    <DatePicker
      key={props.value ?? "__null__"}
      className="w-full"
      label={props.label}
      defaultValue={initialValue}
      disabled={props.disabled}
      views={["year"]}
      openTo="year"
      format="YYYY"
      onChange={(v) => {
        valueRef.current = v;
      }}
      slotProps={{
        // new-password suppresses the browser autofill menu over the
        // picker's text input (Chrome ignores autocomplete="off").
        textField: {
          onBlur: handleBlur,
          slotProps: { htmlInput: noFill },
        },
        actionBar: { actions: ["clear", "accept"] },
      }}
    />
  );
});

export default YearFieldControl;
