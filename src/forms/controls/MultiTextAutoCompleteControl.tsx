// fields/AutocompleteFieldControl.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, TextField, debounce } from "@mui/material";
import { resolveUrl } from "../../helpers/urlHelper";
import { useFormApi } from "../FormApiContext";
import { useNoAutofill } from "../../helpers/useNoAutofill";

const MultiTextAutoCompleteControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const api = useFormApi();
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const fetchData = useCallback(
    (q: string) => {
      if (props.content) {
        setOptions([...props.content]);
        return;
      }
      if (!props.url) return;
      api
        .get(resolveUrl(props.url, props.context, { ...props.params, q }))
        .then((r) => setOptions(r.data.data));
    },
    [props.url],
  );

  const debouncedFetch = useCallback(debounce(fetchData, 300), [fetchData]);

  useEffect(() => {
    if (inputValue) debouncedFetch(inputValue);
  }, [inputValue]);

  return (
    <Autocomplete
      fullWidth
      selectOnFocus
      autoSelect
      autoHighlight
      multiple={true}
      options={options}
      value={props.value}
      disabled={props.disabled}
      getOptionLabel={(o) => (typeof o === "string" ? o : o[props.display_key ?? "display"])}
      isOptionEqualToValue={(a, b) =>
        typeof a === "string" ? a === b : a[props.id_key ?? "id"] === b[props.id_key ?? "id"]
      }
      onChange={(_, v) => props.handleChange(v)}
      renderInput={(params) => (
        <TextField
          {...params}
          // Keep the MUI dropdown but suppress the browser's own
          // autofill menu on top of it (Chrome ignores "off").
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

export default MultiTextAutoCompleteControl;
