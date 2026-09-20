// fields/ColourFieldControl.tsx
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { FormFieldProps } from "../FormFieldProps";
import { useNoAutofill } from "../../helpers/useNoAutofill";

/**
 * Curated subset of Tailwind colour keys offered for accent /
 * tint use across the apps. Mirrors the bureau-side allowlist on
 * the entry-template model so the dropdown options round-trip
 * exactly through saved values.
 */
const COLOUR_OPTIONS: { value: string; hex: string }[] = [
  { value: "slate", hex: "#64748b" },
  { value: "gray", hex: "#6b7280" },
  { value: "red", hex: "#ef4444" },
  { value: "orange", hex: "#f97316" },
  { value: "amber", hex: "#f59e0b" },
  { value: "yellow", hex: "#eab308" },
  { value: "lime", hex: "#84cc16" },
  { value: "green", hex: "#22c55e" },
  { value: "emerald", hex: "#10b981" },
  { value: "teal", hex: "#14b8a6" },
  { value: "cyan", hex: "#06b6d4" },
  { value: "sky", hex: "#0ea5e9" },
  { value: "blue", hex: "#3b82f6" },
  { value: "indigo", hex: "#6366f1" },
  { value: "violet", hex: "#8b5cf6" },
  { value: "purple", hex: "#a855f7" },
  { value: "pink", hex: "#ec4899" },
  { value: "rose", hex: "#f43f5e" },
];

const COLOUR_HEX: Record<string, string> = COLOUR_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.hex }),
  {} as Record<string, string>,
);

/** Lookup table other components can read so they don't have to
 *  duplicate the palette mapping. */
export const colourHex = (key: string | null | undefined): string | undefined =>
  key ? COLOUR_HEX[key] : undefined;

const ColourFieldControl = (props: FormFieldProps) => {
  const noFill = useNoAutofill((props as { autoComplete?: string }).autoComplete);
  if (props.type !== "colour") {
    return null;
  }
  const value = props.value ?? null;

  return (
    <FormControl fullWidth disabled={props.disabled} error={props.has_errors}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        slotProps={{ input: noFill }}
        label={props.label}
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          props.handleChange(v ? (v as string) : null);
        }}
        renderValue={(v) => {
          if (!v) {
            return (
              <Typography variant="body2" color="text.secondary">
                None
              </Typography>
            );
          }
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: 0.5,
                  bgcolor: COLOUR_HEX[v as string],
                }}
              />
              <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                {v as string}
              </Typography>
            </Stack>
          );
        }}
      >
        <MenuItem value="">
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        </MenuItem>
        {COLOUR_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: 0.5,
                  bgcolor: opt.hex,
                }}
              />
              <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                {opt.value}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ColourFieldControl;
