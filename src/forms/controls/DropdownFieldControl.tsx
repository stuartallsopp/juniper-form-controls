// fields/DropdownFieldControl.tsx
import { useEffect, useRef, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { resolveUrl } from "../../helpers/urlHelper";
import { useFormApi } from "../FormApiContext";
import type { FormFieldProps } from "../FormFieldProps";
import { useNoAutofill } from "../../helpers/useNoAutofill";

type Option = { id: number | string; display: string; disabled?: boolean };

const DropdownFieldControl = (props: FormFieldProps) => {
  const noFill = useNoAutofill(
    (props as { autoComplete?: string }).autoComplete,
  );
  // Hooks must run unconditionally, so narrow via a local instead of
  // an early return before the hooks.
  const dropdown = props.type === "dropdown" ? props : null;
  const url = dropdown?.url;
  const content = dropdown?.content;
  const params = dropdown?.params;
  const context = dropdown?.context;

  const api = useFormApi();
  const [options, setOptions] = useState<Option[]>(
    Array.isArray(content) ? content : [],
  );

  // Static-content mode: keep options in sync with the prop.
  useEffect(() => {
    if (Array.isArray(content)) {
      setOptions(content);
    }
  }, [content]);

  // URL mode: fetch the option list once (and when the url / params /
  // context change). Skipped when the caller supplied static content.
  useEffect(() => {
    if (content || !url) return;
    const resolved = resolveUrl(url, context, params);
    // Dependent pickers interpolate a parent id into the URL; skip
    // until it resolves (mirrors the autocomplete control).
    if (/=(undefined|null)(&|$)/.test(resolved)) return;
    let cancelled = false;
    api
      .get(resolved)
      .then((r) => {
        if (!cancelled) setOptions(r.data?.data ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url, content, params, context, api]);

  // ── default_first ────────────────────────────────────────────────
  // Opt-in: empty means the first option, chosen rather than asked
  // for. `handleChange` fires so the value is STORED and not merely
  // shown — a comparator whose operator only appeared on screen would
  // save an operand with no operator, which the server reads as
  // unconfigured.
  const firstEnabled = options.find((o) => !o.disabled)?.id;
  const isEmpty =
    dropdown?.value === null ||
    dropdown?.value === undefined ||
    dropdown?.value === "";
  // Which id we last defaulted to. Guards the loop where a parent
  // ignores the change and the effect fires forever, without latching
  // permanently: a different option list means a different first id,
  // so switching the field's subject re-defaults as it should.
  const defaulted = useRef<string | null>(null);

  useEffect(() => {
    if (!dropdown?.default_first || !isEmpty || firstEnabled === undefined) {
      return;
    }
    const key = String(firstEnabled);
    if (defaulted.current === key) return;
    defaulted.current = key;
    dropdown.handleChange(firstEnabled);
    // `handleChange` is a fresh closure every render, so it is
    // deliberately not a dependency — the ref above is what stops the
    // effect repeating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdown?.default_first, isEmpty, firstEnabled]);

  if (!dropdown) {
    return null;
  }

  // Nothing to show and nothing to fetch — disabled placeholder.
  if (!options.length && !url) {
    return <TextField disabled label={dropdown.label} fullWidth />;
  }

  // Until the (async) options arrive, a set value won't match any
  // MenuItem — render "" so MUI doesn't warn about an out-of-range
  // value, then snap to the real value once the option exists.
  const hasValue =
    dropdown.value != null &&
    dropdown.value !== "" &&
    options.some((o) => String(o.id) === String(dropdown.value));
  const selectValue = hasValue ? dropdown.value : "";

  return (
    <FormControl error={dropdown.has_errors} fullWidth>
      <InputLabel>{dropdown.label}</InputLabel>

      <Select
        slotProps={{ input: noFill }}
        // Empty string keeps the Select controlled from first
        // render — passing `undefined` (or `null`) flips MUI into
        // uncontrolled mode and then back to controlled on first
        // change, which triggers the "out-of-range value" +
        // "uncontrolled to controlled" warnings. `displayEmpty`
        // lets "" render as no-selection without forcing the
        // caller to seed an empty MenuItem.
        value={selectValue}
        displayEmpty
        disabled={dropdown.disabled}
        label={dropdown.label}
        autoFocus={dropdown.autoFocus}
        onChange={(e) => dropdown.handleChange(e.target.value)}
      >
        {options.map((o) => (
          <MenuItem key={o.id} value={o.id} disabled={o.disabled}>
            {o.display}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DropdownFieldControl;
