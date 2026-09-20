import React from "react";
import { TextField, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import FieldWrapper from "./FormFieldWrapper";

dayjs.extend(relativeTime);

/**
 * Read-only display cell that slots into the same row layout as
 * `FormField` — same `size` + padding + label rhythm — but renders
 * a typography value rather than a control. Use when a value should
 * be *seen* but never *edited*; reach for `FormField disabled` only
 * when the field needs to look like an input but stays bound to a
 * setter for round-trip behaviour.
 *
 * Internally renders an outlined MUI `TextField` with the border
 * suppressed and the input flagged read-only. That choice keeps the
 * floating label position, notch geometry, padding and overall row
 * height pixel-perfect against any FormField sitting alongside.
 *
 * `type` selects how the raw value is formatted:
 *   - `from_now` — relative time ("3 minutes ago", "in 2 hours");
 *      tooltip carries the full DD/MM/YYYY HH:mm. Null / empty
 *      values render an em-dash placeholder.
 *   - `text` — render the value as-is. Null / empty falls back to
 *      the em-dash placeholder; otherwise the value is stringified.
 *
 * Extensible per type — adding `currency`, `bytes`, etc. is a
 * single switch arm here, not a new component.
 */
type FormDisplayProps = {
  label: string;
  /** Twelfth-grid sizing — same scale as `FormField.size`. */
  size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  type: "from_now" | "text";
  value: string | null | undefined;
};

const EMPTY = "—";

const FormDisplay: React.FC<FormDisplayProps> = ({
  label,
  size,
  type,
  value,
}) => {
  const { text, tooltip } = renderValue(type, value);

  const field = (
    <TextField
      fullWidth
      label={label}
      value={text}
      variant="outlined"
      // Shrink-locked so the label always sits in the notched
      // position — read-only fields never animate to placeholder
      // mode and the layout matches a populated FormField row.
      InputLabelProps={{ shrink: true }}
      InputProps={{ readOnly: true }}
      sx={{
        // Hide the outline + focus ring — we want the label
        // geometry of an outlined TextField without the visible
        // border, so adjacent FormField + FormDisplay rows share
        // height and label position without the FormDisplay
        // looking like an editable input.
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "transparent",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "transparent",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "transparent",
          },
        "& .MuiOutlinedInput-input": {
          cursor: "default",
        },
      }}
    />
  );

  return (
    <FieldWrapper size={size} type={type}>
      {tooltip ? <Tooltip title={tooltip}>{field}</Tooltip> : field}
    </FieldWrapper>
  );
};

function renderValue(
  type: FormDisplayProps["type"],
  value: string | null | undefined,
): { text: string; tooltip?: string } {
  if (value == null || value === "") {
    return { text: EMPTY };
  }

  switch (type) {
    case "from_now": {
      const local = dayjs(value);
      if (!local.isValid()) {
        return { text: String(value) };
      }
      // Tooltip carries the precise local timestamp so a hover
      // reveals the actual date when the relative phrasing is too
      // vague ("a month ago" → 14/04/2026 09:32).
      return {
        text: local.fromNow(),
        tooltip: local.format("DD/MM/YYYY HH:mm"),
      };
    }
    case "text":
    default:
      return { text: String(value) };
  }
}

export default FormDisplay;
