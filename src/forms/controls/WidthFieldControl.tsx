// fields/WidthFieldControl.tsx
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

/** Curated 1-12 column widths offered as dropdown options. The
 *  bar in each row visualises the relative width so the closed
 *  Select shows a glanceable hint. */
const WIDTH_OPTIONS: { value: number; label: string; flex: number }[] = [
  { value: 3, label: "1/4", flex: 1 / 4 },
  { value: 4, label: "1/3", flex: 1 / 3 },
  { value: 6, label: "1/2", flex: 1 / 2 },
  { value: 8, label: "2/3", flex: 2 / 3 },
  { value: 9, label: "3/4", flex: 3 / 4 },
  { value: 12, label: "Full", flex: 1 },
];

const WidthFieldControl = (props: FormFieldProps) => {
  const noFill = useNoAutofill((props as { autoComplete?: string }).autoComplete);
  if (props.type !== "width") {
    return null;
  }
  const value = props.value ?? 12;
  const opt = WIDTH_OPTIONS.find((o) => o.value === value) ?? WIDTH_OPTIONS[5];

  return (
    <FormControl fullWidth disabled={props.disabled} error={props.has_errors}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        slotProps={{ input: noFill }}
        label={props.label}
        value={value}
        onChange={(e) => props.handleChange(Number(e.target.value))}
        renderValue={() => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 60, height: 8, position: "relative" }}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "action.disabledBackground",
                  borderRadius: 0.5,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: `${opt.flex * 100}%`,
                  bgcolor: "primary.main",
                  borderRadius: 0.5,
                }}
              />
            </Box>
            <Typography variant="body2">{opt.label}</Typography>
          </Stack>
        )}
      >
        {WIDTH_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
              <Box sx={{ width: 60, height: 8, position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "action.disabledBackground",
                    borderRadius: 0.5,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: `${o.flex * 100}%`,
                    bgcolor: "primary.main",
                    borderRadius: 0.5,
                  }}
                />
              </Box>
              <Typography variant="body2">{o.label}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default WidthFieldControl;
