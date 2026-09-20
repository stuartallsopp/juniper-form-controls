// fields/AutocompleteFieldControl.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  debounce,
} from "@mui/material";
import { resolveUrl } from "../../helpers/urlHelper";
import { useFormApi } from "../FormApiContext";
import Icon from "../../display/Icon";
import { useNoAutofill } from "../../helpers/useNoAutofill";

const AutocompleteFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const api = useFormApi();
  const [options, setOptions] = useState<any[]>(
    Array.isArray(props.content) ? props.content : [],
  );
  const [inputValue, setInputValue] = useState("");

  // Pre-loaded mode: caller passed content directly. Keep options in sync
  // with the prop and skip the URL fetch entirely.
  useEffect(() => {
    if (Array.isArray(props.content)) {
      setOptions(props.content);
    }
  }, [props.content]);

  const fetchData = useCallback(
    (q: string) => {
      if (!props.url) return;
      const resolved = resolveUrl(props.url, props.context, {
        ...props.params,
        q,
      });
      // Dependent pickers build their URL by interpolating a parent
      // id (e.g. ?payroll_id=${record.payroll?.id}). Before the
      // parent is selected that yields the literal "?payroll_id=undefined",
      // which would query with a broken filter. Skip the fetch until
      // the parent value resolves — the [props.url] effect re-fires
      // once it does.
      if (/=(undefined|null)(&|$)/.test(resolved)) return;
      api.get(resolved).then((r) => setOptions(r.data?.data ?? []));
    },
    [props.url, props.context, props.params]
  );

  const debouncedFetch = useCallback(debounce(fetchData, 300), [fetchData]);

  // Prime the dropdown on mount in URL mode so the user sees options as soon
  // as they open the field, not only after typing.
  useEffect(() => {
    if (props.url && !Array.isArray(props.content)) {
      fetchData("");
    }
  }, [props.url]);

  useEffect(() => {
    if (inputValue && !Array.isArray(props.content)) debouncedFetch(inputValue);
  }, [inputValue]);

  return (
    <Autocomplete
      fullWidth
      selectOnFocus
      autoHighlight
      openOnFocus={props.compact === true}
      size={props.compact ? "small" : undefined}
      sx={
        props.action
          ? {
              // With a trailing action button, let the built-in clear +
              // dropdown adornment flow in DOM order rather than MUI's
              // absolute right-pin — so the row reads [clear][dropdown]
              // [action]: clear stays closest to the value, the action
              // sits furthest right. The input grows (flex) to push the
              // whole icon group to the right; trim MUI's reserved
              // right-padding (meant for the absolute adornment) so the
              // group hugs the edge instead of sitting short of it.
              "& .MuiAutocomplete-endAdornment": {
                position: "static",
                transform: "none",
              },
              // MUI reserves ~65px right-padding on the input to clear its
              // absolute adornment; with the adornment now in-flow we only
              // need a small edge gap. `!important` beats MUI's high-
              // specificity `.hasPopupIcon.hasClearIcon … .MuiOutlinedInput-root`
              // rule.
              "& .MuiOutlinedInput-root": {
                paddingRight: "10px !important",
                flexWrap: "nowrap",
              },
              "& .MuiInputBase-input": { minWidth: 0 },
            }
          : undefined
      }
      // Detach the dropdown width from the input so long option
      // labels (e.g. tenant-prefixed payroll names) render in full
      // even when the entry field sits in a narrow grid slot.
      slotProps={{
        popper: {
          style: { width: "fit-content", minWidth: 280 },
          placement: "bottom-start",
        },
      }}
      options={options}
      value={props.value}
      disabled={props.disabled}
      getOptionLabel={(o) => (o ? o[props.display_key] ?? "" : "")}
      isOptionEqualToValue={(a, b) => a[props.id_key] === b[props.id_key]}
      renderOption={(liProps, option) => {
        const { key: _key, ...rest } = liProps as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };
        return (
          <li key={option[props.id_key]} {...rest}>
            {option[props.display_key]}
          </li>
        );
      }}
      onOpen={() => {
        if (props.url && !Array.isArray(props.content)) {
          fetchData(inputValue);
        }
      }}
      onChange={(_, v) => props.handleChange(v)}
      renderInput={(params) => {
        const { InputProps, inputProps, ...restParams } = params;
        // Optional caller action, bolted onto the field as an end
        // adornment (after the MUI clear / dropdown icons) — e.g. a
        // "manage the picker's options" button. See FormFieldProps.
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
            // Keep the MUI dropdown but suppress the browser's own
            // autofill menu on top of it. Both halves are needed:
            // Chrome reads only the input element, Firefox and Safari
            // honour the wrapper.
            autoComplete={props.autoComplete || "off"}
            label={props.compact ? undefined : props.label}
            error={props.has_errors}
            size={props.compact ? "small" : undefined}
            variant={props.compact ? "standard" : undefined}
            autoFocus={props.compact === true}
            slotProps={{
              htmlInput: { ...inputProps, ...noFill },
              input: {
                ...InputProps,
                ...(props.compact ? { disableUnderline: true } : {}),
                endAdornment: (
                  <>
                    {InputProps?.endAdornment}
                    {actionAdornment}
                  </>
                ),
              },
            }}
            onChange={(e) => setInputValue(e.target.value)}
          />
        );
      }}
    />
  );
});

export default AutocompleteFieldControl;
