// fields/AutoCompleteScalarFieldControl.tsx
//
// Variant of AutoCompleteFieldControl whose bound value is the
// option's id (a plain string), not the full {id, display} object.
// Used when the underlying column stores a bare lookup code — e.g.
// the DfE Local Authority code — and there's no separate FK row to
// hydrate from on read. The dropdown still shows the full descriptive
// label; the selected pill shows just the code (the option_label_key
// override).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField, debounce } from "@mui/material";
import { resolveUrl } from "../../helpers/urlHelper";
import { useFormApi } from "../FormApiContext";
import { useNoAutofill } from "../../helpers/useNoAutofill";

type Option = Record<string, any>;

const AutoCompleteScalarFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const api = useFormApi();
  const [options, setOptions] = useState<Option[]>(
    Array.isArray(props.content) ? props.content : [],
  );
  const [inputValue, setInputValue] = useState("");

  // option_label_key controls the selected pill text. Falls back to
  // id_key so the selected value renders as the bare code when the
  // caller doesn't supply a separate label key. display_key still
  // governs the dropdown rows.
  const labelKey: string = props.option_label_key ?? props.id_key;
  const displayKey: string = props.display_key;
  const idKey: string = props.id_key;

  useEffect(() => {
    if (Array.isArray(props.content)) {
      setOptions(props.content);
    }
  }, [props.content]);

  const fetchData = useCallback(
    (q: string) => {
      if (!props.url) return;
      api
        .get(resolveUrl(props.url, props.context, { ...props.params, q }))
        .then((r) => setOptions(r.data?.data ?? []));
    },
    [props.url, props.context, props.params],
  );

  const debouncedFetch = useCallback(debounce(fetchData, 300), [fetchData]);

  useEffect(() => {
    if (props.url && !Array.isArray(props.content)) {
      fetchData("");
    }
  }, [props.url]);

  useEffect(() => {
    if (inputValue && !Array.isArray(props.content)) debouncedFetch(inputValue);
  }, [inputValue]);

  // Resolve the parent's plain-string value to the matching option
  // so the Autocomplete can show its label. If the option isn't in
  // the current list (e.g. the form opened with a stored code but
  // the dropdown hasn't been fetched yet), fall back to a stub
  // carrying just the id — the pill renders as the bare code via
  // labelKey, no fetch needed.
  const valueOption: Option | null = useMemo(() => {
    if (props.value === null || props.value === undefined || props.value === "") {
      return null;
    }
    const stringValue = String(props.value);
    const match = options.find((o) => String(o[idKey]) === stringValue);
    if (match) return match;
    return { [idKey]: stringValue, [labelKey]: stringValue, [displayKey]: stringValue };
  }, [props.value, options, idKey, labelKey, displayKey]);

  return (
    <Autocomplete
      fullWidth
      selectOnFocus
      autoHighlight
      openOnFocus={props.compact === true}
      size={props.compact ? "small" : undefined}
      // The bound value is typically a narrow code (e.g. a 3-char
      // LA), so the entry field can sit in a 2-of-12 slot — but the
      // dropdown rows carry "CODE — Long Local Authority Name" and
      // need room to render. Detach the popper from the input's
      // width with a fit-content rule + a sensible minimum so the
      // option text never truncates.
      slotProps={{
        popper: {
          style: { width: "fit-content", minWidth: 280 },
          placement: "bottom-start",
        },
      }}
      options={options}
      value={valueOption}
      disabled={props.disabled}
      getOptionLabel={(o) =>
        o ? (o[labelKey] as string) ?? (o[idKey] as string) ?? "" : ""
      }
      isOptionEqualToValue={(a, b) => a[idKey] === b[idKey]}
      renderOption={(liProps, option) => {
        const { key: _key, ...rest } = liProps as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };
        return (
          <li key={String(option[idKey])} {...rest}>
            {option[displayKey] as string}
          </li>
        );
      }}
      onOpen={() => {
        if (props.url && !Array.isArray(props.content)) {
          fetchData(inputValue);
        }
      }}
      onChange={(_, v) => props.handleChange(v ? (v[idKey] as string) : null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.compact ? undefined : props.label}
          error={props.has_errors}
          size={props.compact ? "small" : undefined}
          variant={props.compact ? "standard" : undefined}
          autoFocus={props.compact === true}
          // One slotProps, or the second silently replaces the first.
          // `htmlInput` is where the autofill suppression has to go
          // in MUI v7 — `inputProps` is deprecated and dropped.
          autoComplete={props.autoComplete || "off"}
          slotProps={{
            htmlInput: { ...params.inputProps, ...noFill },
            ...(props.compact
              ? { input: { ...params.InputProps, disableUnderline: true } }
              : {}),
          }}
          onChange={(e) => setInputValue(e.target.value)}
        />
      )}
    />
  );
});

export default AutoCompleteScalarFieldControl;
