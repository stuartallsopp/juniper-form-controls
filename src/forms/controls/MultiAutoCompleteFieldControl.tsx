// fields/MultiAutocompleteFieldControl.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, TextField, debounce } from "@mui/material";
import { resolveUrl } from "../../helpers/urlHelper";
import { useFormApi } from "../FormApiContext";
import { useNoAutofill } from "../../helpers/useNoAutofill";

const MultiAutocompleteFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const api = useFormApi();
  const [options, setOptions] = useState<any[]>(
    Array.isArray(props.content) ? props.content : [],
  );
  const [inputValue, setInputValue] = useState("");

  // Pre-loaded mode — keep options in sync with the prop and skip
  // the URL fetch entirely. Mirrors AutocompleteFieldControl.
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
      // Skip dependent pickers until the parent value resolves —
      // see AutocompleteFieldControl for the longer note.
      if (/=(undefined|null)(&|$)/.test(resolved)) return;
      api.get(resolved).then((r) => setOptions(r.data?.data ?? []));
    },
    [props.url, props.context, props.params]
  );

  const debouncedFetch = useCallback(debounce(fetchData, 300), [fetchData]);

  // Prime the dropdown on mount in URL mode so the user sees
  // options as soon as they open the field, not only after
  // typing. Without this priming pass the field opens empty and
  // the user thinks selection is broken.
  useEffect(() => {
    if (props.url && !Array.isArray(props.content)) {
      fetchData("");
    }
  }, [props.url]);

  useEffect(() => {
    if (inputValue && !Array.isArray(props.content)) {
      debouncedFetch(inputValue);
    }
  }, [inputValue]);

  return (
    <Autocomplete
      fullWidth
      selectOnFocus
      autoHighlight
      multiple
      options={options}
      value={props.value}
      disabled={props.disabled}
      getOptionLabel={(o) => o[props.display_key ?? "display"]}
      isOptionEqualToValue={(a, b) =>
        a[props.id_key ?? "id"] === b[props.id_key ?? "id"]
      }
      onOpen={() => {
        if (props.url && !Array.isArray(props.content)) {
          fetchData(inputValue);
        }
      }}
      onChange={(_, v) => props.handleChange(v)}
      renderInput={(params) => (
        <TextField
          {...params}
          // `slotProps.htmlInput`, not `inputProps`: MUI v7
          // deprecated the latter, and it is dropped on the way to
          // the DOM — so the suppression silently did nothing and
          // Chrome's menu kept rendering over the options.
          autoComplete={props.autoComplete || "off"}
          slotProps={{ htmlInput: { ...params.inputProps, ...noFill } }}
          label={props.label}
          error={props.has_errors}
          onChange={(e) => setInputValue(e.target.value)}
        />
      )}
    />
  );
});

export default MultiAutocompleteFieldControl;
