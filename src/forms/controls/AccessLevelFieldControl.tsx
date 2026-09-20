// fields/AccessLevelFieldControl.tsx
import React from "react";
import {
  Box,
  FormControlLabel,
  Slider,
  SliderThumb,
  Tooltip,
  type SliderProps,
} from "@mui/material";
import Icon from "../../display/Icon";
import type { AccessLevelStop } from "../FormFieldProps";

/**
 * Default stops — the original tri-state access slider
 * (No access / View / Edit). Used when the caller doesn't supply
 * its own `stops`, so existing `access_level` fields keep working
 * unchanged (numeric 0 / 1 / 2 in + out).
 */
const DEFAULT_STOPS: AccessLevelStop[] = [
  { value: 0, label: "No access", icon: "Block", color: "grey.500" },
  { value: 1, label: "View", icon: "Visibility", color: "primary.main" },
  { value: 2, label: "Edit", icon: "Edit", color: "warning.main" },
];

// React context handing the active stop down to the custom thumb
// slot. MUI's slotProps pass through as DOM attributes — context
// keeps the rendering reactive without leaking `data-*` strings.
const ActiveStopContext = React.createContext<AccessLevelStop | null>(null);

/**
 * Custom thumb: MUI's `SliderThumb` (so positioning + the
 * `MuiSlider-thumb` styles continue to apply) with the active
 * stop's icon dropped in alongside the input. MUI passes the input
 * + focus ripple as children — we render them first (absolutely
 * positioned, so no space) then the icon centres via flex.
 */
const ThumbWithIcon = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>
>(({ children, ...spanProps }, ref) => {
  const stop = React.useContext(ActiveStopContext);
  return (
    <SliderThumb ref={ref} {...spanProps}>
      {children}
      {stop?.icon ? (
        <Icon
          name={stop.icon}
          sx={{ fontSize: 16, color: "common.white", pointerEvents: "none" }}
        />
      ) : null}
    </SliderThumb>
  );
});

/**
 * N-state slider styled to read like a wider MUI Switch. Thin pill
 * rail; a round handle slides between the stops carrying the active
 * stop's icon, tinted with the active stop's colour. Defaults to the
 * 3-level access slider (No access / View / Edit) but takes a custom
 * `stops` array so the same control drives any ordered tri-state (or
 * n-state) decision — e.g. Inherit / Allow / Deny — with bespoke
 * icons, colours and tooltips.
 *
 * The slider works on stop POSITIONS internally; `value` is matched
 * against each stop's `value` to find the position, and the chosen
 * stop's `value` is emitted on change — so callers deal only in
 * their own domain values (numbers or strings).
 */
const AccessLevelFieldControl = React.memo((props: any) => {
  const stops: AccessLevelStop[] =
    Array.isArray(props.stops) && props.stops.length > 0
      ? props.stops
      : DEFAULT_STOPS;
  const maxIdx = stops.length - 1;

  const foundIdx = stops.findIndex((s) => s.value === props.value);
  const idx = foundIdx >= 0 ? foundIdx : 0;
  const active = stops[idx] ?? stops[0];
  const tint = active.color ?? "grey.500";

  const handleChange: SliderProps["onChange"] = (_, val) => {
    const nextIdx = Math.max(
      0,
      Math.min(maxIdx, Number(Array.isArray(val) ? val[0] : val)),
    );
    props.handleChange(stops[nextIdx].value);
  };

  const sliderBox = (
    <Box
      sx={{
        // Compact pill sized like a Switch — wide enough for the
        // handle to travel its stops without the rail dominating.
        // Horizontal padding stops the handle clipping at the ends.
        width: 70,
        px: 1.5,
        mx: 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <ActiveStopContext.Provider value={active}>
        <Slider
          value={idx}
          min={0}
          max={maxIdx}
          step={1}
          disabled={props.disabled}
          onChange={handleChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => stops[v]?.label ?? ""}
          slots={{ thumb: ThumbWithIcon }}
          sx={{
            color: tint,
            py: "14px",
            // Thin pill rail behind the handle — matches the Switch
            // track family. The filled track is hidden so the rail
            // reads as one even pill; the handle position alone
            // communicates the state.
            "& .MuiSlider-rail": {
              height: 14,
              borderRadius: 7,
              opacity: 1,
              backgroundColor: "action.disabledBackground",
            },
            "& .MuiSlider-track": {
              border: 0,
              backgroundColor: "transparent",
            },
            // The handle — a round disc on top of the rail, tinted
            // with the active stop's colour, icon centred.
            "& .MuiSlider-thumb": {
              height: 26,
              width: 26,
              backgroundColor: tint,
              border: "2px solid",
              borderColor: "common.white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)",
              "&:hover, &.Mui-focusVisible": {
                boxShadow:
                  "0 0 0 6px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.25)",
              },
              "&.Mui-active": {
                boxShadow:
                  "0 0 0 10px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.25)",
              },
            },
          }}
        />
      </ActiveStopContext.Provider>
    </Box>
  );

  // The active stop's tooltip (if any) explains the current
  // selection on hover — the slider's single handle can't surface a
  // per-option tooltip, so we describe the chosen state.
  const control = active.tooltip ? (
    <Tooltip title={active.tooltip} arrow>
      {sliderBox}
    </Tooltip>
  ) : (
    sliderBox
  );

  return (
    <FormControlLabel
      className="items-center"
      disabled={props.disabled}
      label={props.label}
      control={control}
    />
  );
});

export default AccessLevelFieldControl;
