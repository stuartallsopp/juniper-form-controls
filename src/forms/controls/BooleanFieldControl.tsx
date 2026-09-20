// fields/BooleanFieldControl.tsx
import React from "react";
import { Checkbox, Switch, FormControlLabel } from "@mui/material";

const BooleanFieldControl = React.memo((props: any) => {
  const Control = props.variant === "checkbox" ? Checkbox : Switch;

  return (
    <FormControlLabel
      className="items-center"
      disabled={props.disabled}
      label={props.label}
      control={
        <Control
          checked={Boolean(props.value)}
          onChange={(_, v) => props.handleChange(v)}
        />
      }
    />
  );
});

export default BooleanFieldControl;
