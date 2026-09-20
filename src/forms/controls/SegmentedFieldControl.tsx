// fields/SegmentedFieldControl.tsx
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Box } from "@mui/material";
import type { FormFieldProps } from "../FormFieldProps";

/**
 * A small set of mutually exclusive choices, all visible at once.
 *
 * For the two-to-four-option case that a dropdown makes needlessly
 * expensive: an operator choosing how a vacancy's pay is expressed
 * should be able to see that a pay-grade option exists without
 * opening anything. Above four options the row stops fitting and a
 * `dropdown` is the better control.
 *
 * Deliberately not a `boolean`. A switch can only carry two states
 * and, worse, it names one of them — "advertise a salary range
 * instead of spine points" reads as a modifier on a default rather
 * than as one of several equal choices, and there is nowhere to put
 * a third.
 *
 * Selection is enforced: clicking the active button does not
 * deselect it. `null` out of a group whose whole purpose is to hold
 * one answer is not a state any caller wants to handle.
 */
const SegmentedFieldControl = (props: FormFieldProps) => {
  const field = props.type === "segmented" ? props : null;

  if (!field) {
    return null;
  }

  const options = field.content ?? [];

  return (
    <Box sx={{ width: "100%" }}>
      {field.label ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.5,
            color: field.has_errors ? "error.main" : "text.secondary",
          }}
        >
          {field.label}
        </Typography>
      ) : null}
      <ToggleButtonGroup
        exclusive
        fullWidth={field.full_width ?? false}
        size="small"
        value={field.value ?? null}
        disabled={field.disabled}
        onChange={(_, next) => {
          // MUI hands back null when the active button is clicked
          // again. Ignored — see the class comment.
          if (next === null) return;
          field.handleChange(next as string | number);
        }}
      >
        {options.map((o) => (
          <ToggleButton key={o.id} value={o.id} disabled={o.disabled}>
            {o.display}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {/*
        What the answer on the group means, under the group.

        The selected option's `detail` says what picking it does; a
        disabled option's says why it cannot be picked here. Both are
        rendered rather than only the selection, because "why is that
        one greyed out" is a question the control is otherwise silent
        about — an operator can see the option exists and cannot see
        what would make it available.

        Nothing renders where no option carries a `detail`, which is
        every segmented field written before this.
      */}
      {options.some((o) => o.detail) ? (
        <Box sx={{ mt: 0.5 }}>
          {options
            .filter((o) => o.detail && (o.disabled || o.id === field.value))
            .map((o) => (
              <Typography
                key={o.id}
                variant="caption"
                component="div"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.4,
                  display: "block",
                }}
              >
                {o.disabled ? (
                  <>
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {o.display}
                    </Box>
                    {" — "}
                    {o.detail}
                  </>
                ) : (
                  o.detail
                )}
              </Typography>
            ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default SegmentedFieldControl;
