import React from "react";
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import Icon from "../../display/Icon";
import { applyFacetPick, type FacetOption } from "../../helpers/facetHelper";
import { useNoAutofill } from "../../helpers/useNoAutofill";

/**
 * Values from several axes, in one field.
 *
 * The same bargain `ActorFieldControl` strikes: one question, options
 * from several sources, and the source travels on each pick. The
 * difference is that the sources here are runtime data — a tenant's
 * own dimensions — so the field is told about them rather than knowing
 * them, and the number of axes never reaches the form schema.
 *
 * A pick replaces whatever was held on the same axis rather than adding
 * to it, so a selection that could only resolve to nothing is not
 * something the control can express. The rule lives in `applyFacetPick`
 * so the field and anything else folding a pick agree.
 */
const FacetFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const options: FacetOption[] = props.options ?? [];
  const value: FacetOption[] = props.value ?? [];

  // Grouped headers only read as headers when the options arrive
  // grouped; MUI renders a fresh header each time the key changes.
  const ordered = [...options].sort((a, b) => {
    const g = (a.group.name ?? "").localeCompare(b.group.name ?? "");
    return g !== 0 ? g : a.name.localeCompare(b.name);
  });

  return (
    <Autocomplete
      fullWidth
      selectOnFocus
      autoHighlight
      multiple
      disableCloseOnSelect
      size={props.compact ? "small" : undefined}
      disabled={props.disabled}
      options={ordered}
      value={value}
      isOptionEqualToValue={(a: FacetOption, b: FacetOption) =>
        a.uuid === b.uuid
      }
      getOptionLabel={(o: FacetOption) => o.name}
      // An ungrouped option has no axis to name — it is its own
      // single-member one — so it sits under a blank header rather
      // than an invented label.
      groupBy={(o: FacetOption) => o.group.name ?? ""}
      onChange={(_, next) =>
        props.handleChange(applyFacetPick(value, next as FacetOption[]))
      }
      renderTags={(picked: FacetOption[], getTagProps) =>
        picked.map((option, index) => {
          const { key, ...rest } = getTagProps({ index });
          return (
            <Chip
              {...rest}
              key={key}
              variant="outlined"
              // The axis rides the chip as its own caption rather than a
              // colon inside the label: two labels read the same out of
              // context — "Primary" is a phase here and could be a school
              // in another tenant's list — but a run of "Area: North,
              // Phase: Primary" reads as prose when it is really a set.
              label={
                option.group.name ? (
                  <>
                    <Box component="span" sx={{ opacity: 0.7, mr: 0.5 }}>
                      {option.group.name}
                    </Box>
                    {option.name}
                  </>
                ) : (
                  option.name
                )
              }
            />
          );
        })
      }
      renderInput={(params) => {
        const { InputProps, inputProps, ...restParams } = params;
        // The caller's own action, bolted on after MUI's clear and
        // dropdown icons — the payroll record's "manage classifications"
        // cog is one. Lifted from AutoCompleteFieldControl rather than
        // reinvented: `action` is declared on the shared FormFieldProps
        // and every control is free to ignore it, which is exactly how
        // that cog went missing. A prop a control silently drops looks
        // identical to one nobody passed.
        const actionAdornment = props.action ? (
          <InputAdornment position="end">
            <Tooltip title={props.action.tooltip ?? ""} placement="top">
              <span>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={props.action.onClick}
                  disabled={props.action.disabled}
                  aria-label={props.action.tooltip ?? "Field action"}
                >
                  <Icon name={props.action.icon} fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        ) : null;

        return (
          <TextField
            {...restParams}
            label={props.label}
            error={props.has_errors}
            autoComplete={props.autoComplete || "off"}
            slotProps={{
              htmlInput: { ...inputProps, ...noFill },
              input: {
                ...InputProps,
                endAdornment: (
                  <>
                    {InputProps?.endAdornment}
                    {actionAdornment}
                  </>
                ),
              },
            }}
          />
        );
      }}
    />
  );
});

export default FacetFieldControl;
