import React, { useState, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { FormLabel, useTheme } from "@mui/material";

const toDisplay = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value != null) return JSON.stringify(value, null, 2);
  return "";
};

const JsonEditorFieldControl = React.memo((props: any) => {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState(() => toDisplay(props.value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setLocalValue(toDisplay(props.value));
  }, [props.value]);

  const commitValue = useCallback(() => {
    setFocused(false);
    const current = toDisplay(props.value);
    if (localValue !== current) {
      props.handleChange(localValue);
    }
  }, [localValue, props.value, props.handleChange]);

  const borderColor = props.has_errors
    ? theme.palette.error.main
    : focused
      ? theme.palette.primary.main
      : theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.23)"
        : "rgba(0,0,0,0.23)";

  const borderWidth = focused || props.has_errors ? 2 : 1;

  return (
    <div>
      <FormLabel
        error={props.has_errors}
        sx={{
          display: "block",
          fontSize: "0.75rem",
          mb: 0.5,
          color: props.has_errors
            ? "error.main"
            : focused
              ? "primary.main"
              : "text.secondary",
        }}
      >
        {props.label}
      </FormLabel>
      <div
        style={{
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: theme.shape.borderRadius,
          overflow: "hidden",
          transition: "border-color 0.15s",
          opacity: props.disabled ? 0.5 : 1,
        }}
      >
        <CodeMirror
          value={localValue}
          height={`${props.height ?? "100"}px`}
          extensions={[json()]}
          onChange={setLocalValue}
          onBlur={commitValue}
          onFocus={() => setFocused(true)}
          editable={!props.disabled}
          autoFocus={props.autoFocus}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
          }}
        />
      </div>
    </div>
  );
});

export default JsonEditorFieldControl;
