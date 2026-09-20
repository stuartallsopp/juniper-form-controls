import React, { useMemo } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  ListSubheader,
  TextField,
  Typography,
  createFilterOptions,
} from "@mui/material";
import type { CatalogueOption, CatalogueRelevance } from "../FormFieldProps";
import { useNoAutofill } from "../../helpers/useNoAutofill";

const ORDER: Record<CatalogueRelevance, number> = {
  suggested: 0,
  available: 1,
  unavailable: 2,
};

/**
 * A long catalogue, made navigable — as an ordinary field.
 *
 * Written for two lists that had the same problem and neither of them
 * a search box: the conditions a rule can be narrowed by (heading for
 * forty), and the sources a trigger can watch (thirty-five today).
 *
 * A `FormField` control rather than a component of its own, so it
 * inherits the label, the sizing, the help-text slot, the error state
 * and the change indicator from `FieldWrapper` — and sits at the same
 * height and weight as the fields either side of it. Two earlier
 * attempts got this wrong in opposite directions: a permanently open
 * list that ate a drawer, then a bare `Autocomplete` that looked
 * nothing like its neighbours.
 *
 * Three behaviours are the point, each for a specific way a flat
 * dropdown failed.
 *
 * **Search covers keywords, not just labels.** "AOE" finds nothing
 * against "Has an attachment of earnings", and neither does "DEA",
 * "court order", "TLR" or "SEN" — the words payroll teams actually
 * type. Matching the label alone looks like the option does not exist.
 *
 * **Groups are the map, search is the shortcut.** Somebody who knows
 * the word types it; somebody who does not knows the AREA — pay,
 * absence, qualifications — and can scroll to it.
 *
 * **Unavailable is shown, not hidden.** Greyed, last, with the reason
 * on the row. Hiding leaves somebody hunting for an option they know
 * exists with nothing to ask for.
 */
const CatalogueFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const options: CatalogueOption[] = Array.isArray(props.content)
    ? props.content
    : [];

  /**
   * `groupBy` emits a heading each time the value CHANGES down the
   * list, so it has to arrive sorted or the same heading repeats.
   *
   * Suggested and unavailable are headings of their own rather than
   * areas: what fits belongs at the top and what cannot be used
   * belongs at the bottom, whatever section it is otherwise in.
   */
  const sorted = useMemo(() => {
    const heading = (option: CatalogueOption) => {
      const relevance = option.relevance ?? "available";

      if (relevance === "suggested") {
        return props.suggested_for
          ? `Suggested for ${props.suggested_for}`
          : "Suggested";
      }

      return relevance === "unavailable" ? "Not available here" : option.group;
    };

    return [...options]
      .map((option) => ({ ...option, heading: heading(option) }))
      .sort((a, b) => {
        const rank =
          ORDER[a.relevance ?? "available"] - ORDER[b.relevance ?? "available"];

        return rank !== 0 ? rank : a.heading.localeCompare(b.heading);
      });
  }, [options, props.suggested_for]);

  const selected = sorted.find((option) => option.id === props.value) ?? null;

  /**
   * MUI matches on `getOptionLabel` alone. Keywords are the whole
   * point of this control, so the haystack is widened rather than the
   * label being stuffed with terms nobody wants to read.
   */
  const filterOptions = useMemo(
    () =>
      createFilterOptions<(typeof sorted)[number]>({
        stringify: (option) =>
          [
            option.label,
            option.group,
            option.detail ?? "",
            ...(option.keywords ?? []),
          ].join(" "),
      }),
    [],
  );

  return (
    <Autocomplete
      options={sorted}
      value={selected}
      disabled={props.disabled}
      fullWidth
      groupBy={(option) => option.heading}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, chosen) => option.id === chosen.id}
      filterOptions={filterOptions}
      // Offered and refused would be worse than not offered — the
      // reason is already on the row.
      getOptionDisabled={(option) => option.relevance === "unavailable"}
      onChange={(_, chosen) => chosen && props.handleChange(chosen.id)}
      renderGroup={(params) => (
        <li key={params.key}>
          <ListSubheader
            // `div`, not its default `li` — this already sits inside
            // the `li` that groups the section, and an `li` inside an
            // `li` is invalid HTML that React reports as a hydration
            // error.
            component="div"
            sx={{
              bgcolor: "background.paper",
              lineHeight: 2.2,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {params.group}
          </ListSubheader>
          <ul style={{ padding: 0 }}>{params.children}</ul>
        </li>
      )}
      renderOption={(optionProps, option) => {
        const unavailable = option.relevance === "unavailable";
        const { key, ...rest } = optionProps as typeof optionProps & {
          key: string;
        };

        return (
          <Box
            component="li"
            key={key}
            {...rest}
            sx={{ alignItems: "flex-start !important", gap: 1 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2">{option.label}</Typography>
              {(option.detail || unavailable) && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {unavailable ? option.unavailableReason : option.detail}
                </Typography>
              )}
            </Box>
            {unavailable && <Chip size="small" label="unavailable" />}
          </Box>
        );
      }}
      renderInput={({ InputProps, inputProps, ...restParams }) => (
        <TextField
          {...restParams}
          // Same shape as AutocompleteFieldControl, so the two sit at
          // the same height and the compact (dialog) variant matches.
          autoComplete={props.autoComplete || "off"}
          label={props.compact ? undefined : props.label}
          placeholder={props.placeholder}
          error={props.has_errors}
          size={props.compact ? "small" : undefined}
          variant={props.compact ? "standard" : undefined}
          autoFocus={props.compact === true}
          slotProps={{
            htmlInput: { ...inputProps, ...noFill },
            input: {
              ...InputProps,
              ...(props.compact ? { disableUnderline: true } : {}),
            },
          }}
        />
      )}
    />
  );
});

export default CatalogueFieldControl;
