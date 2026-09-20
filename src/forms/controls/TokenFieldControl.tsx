import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNoAutofill } from "../../helpers/useNoAutofill";
import {
  ClickAwayListener,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  TextField,
} from "@mui/material";

/**
 * Single-line text input with a token-mention picker.
 *
 * Typing the `triggerChar` (default `{`) drops an anchored
 * Popper listing every token whose label or token literal
 * contains the text after the trigger. The whole token literal
 * (including braces) is inserted on pick, replacing any partial
 * trigger text the operator typed while filtering.
 *
 * Keyboard:
 *   ArrowUp / ArrowDown — move highlight
 *   Enter / Tab         — pick the highlighted token
 *   Escape              — dismiss the picker (the trigger char
 *                          stays where it was typed, so the
 *                          operator can finish the literal by
 *                          hand if they want).
 *
 * The component is uncontrolled internally (its own `localValue`)
 * and pushes to the parent via `handleChange` on every keystroke
 * — matches the TextField pattern used elsewhere in the
 * `@payroll/shared` form set so consumers get the same on-typing
 * feedback they're used to from the plain `text` type.
 */

type TokenEntry = {
  token: string;
  label: string;
  description?: string;
};

type Props = {
  label: string;
  value?: string | unknown;
  handleChange: (val: string) => void;
  tokens: TokenEntry[];
  triggerChar?: string;
  disabled?: boolean;
  has_errors?: boolean;
  autoFocus?: boolean;
  max?: number;
  rows?: number;
};

const TokenFieldControl: React.FC<Props> = React.memo(
  ({
    label,
    value,
    handleChange,
    tokens,
    triggerChar = "{",
    disabled,
    has_errors,
    autoFocus,
    max,
    rows,
  }) => {
    // The inner component takes destructured props, and a token
    // field has no autofill worth opting into anyway.
    const noFill = useNoAutofill();
    const [localValue, setLocalValue] = useState<string>(
      typeof value === "string" ? value : "",
    );
    const [open, setOpen] = useState(false);
    // The index of the `triggerChar` in localValue that owns the
    // current dropdown. The filter substring is everything from
    // (triggerStart + 1) up to the current caret position.
    const [triggerStart, setTriggerStart] = useState<number | null>(null);
    const [highlight, setHighlight] = useState(0);
    const [caret, setCaret] = useState(0);

    const anchorRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Sync if parent's value changes externally.
    useEffect(() => {
      setLocalValue(typeof value === "string" ? value : "");
    }, [value]);

    const filterText = useMemo(() => {
      if (triggerStart === null) return "";
      return localValue.slice(triggerStart + 1, caret).toLowerCase();
    }, [localValue, triggerStart, caret]);

    const filtered = useMemo(() => {
      if (!open) return [];
      if (filterText === "") return tokens;
      return tokens.filter(
        (t) =>
          t.token.toLowerCase().includes(filterText) ||
          t.label.toLowerCase().includes(filterText),
      );
    }, [tokens, open, filterText]);

    // Keep the highlight pinned to a valid index when the
    // filtered set changes.
    useEffect(() => {
      if (highlight >= filtered.length) setHighlight(0);
    }, [filtered.length, highlight]);

    const closePicker = () => {
      setOpen(false);
      setTriggerStart(null);
      setHighlight(0);
    };

    const insertToken = (entry: TokenEntry) => {
      if (triggerStart === null) return;
      // Replace everything from the trigger char up to the caret
      // with the literal token. Caret lands at end of the token.
      const before = localValue.slice(0, triggerStart);
      const after = localValue.slice(caret);
      const next = before + entry.token + after;
      const nextCaret = before.length + entry.token.length;
      const capped = max != null && next.length > max ? next.slice(0, max) : next;

      setLocalValue(capped);
      handleChange(capped);
      closePicker();

      // Restore focus + caret position after React renders.
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(nextCaret, nextCaret);
          setCaret(nextCaret);
        }
      });
    };

    const handleChangeRaw = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      let v = e.target.value;
      if (max != null && v.length > max) v = v.slice(0, max);
      const pos = e.target.selectionStart ?? v.length;
      setLocalValue(v);
      setCaret(pos);
      handleChange(v);

      // Picker lifecycle: open when a trigger char lands at the
      // current caret; close when the trigger char vanishes from
      // the tracked position (the operator backspaced past it).
      if (triggerStart !== null) {
        // Backspaced past trigger or moved caret behind it → close.
        if (
          pos <= triggerStart ||
          v[triggerStart] !== triggerChar ||
          // Someone typed a closing brace — finalise the literal
          // and bail out (the operator finished the token by hand).
          v.slice(triggerStart, pos).includes("}")
        ) {
          closePicker();
        }
      }
      // New trigger char typed at the caret?
      if (triggerStart === null && v[pos - 1] === triggerChar) {
        setTriggerStart(pos - 1);
        setOpen(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!open || filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertToken(filtered[highlight]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
      }
    };

    return (
      <div ref={anchorRef} className="w-full">
        <TextField
          fullWidth
          label={label}
          value={localValue}
          disabled={disabled}
          error={has_errors}
          autoFocus={autoFocus}
          multiline={rows !== undefined && rows > 1}
          rows={rows}
          inputRef={inputRef}
          onChange={handleChangeRaw}
          onKeyDown={handleKeyDown}
          onSelect={(e) => {
            // Track caret moves the keyboard handler didn't already
            // see (mouse clicks, arrow keys without modification).
            const target = e.target as HTMLInputElement;
            setCaret(target.selectionStart ?? localValue.length);
          }}
          onBlur={() => {
            // Don't close on blur immediately — the click might be
            // landing on a Popper item. ClickAwayListener handles
            // the legitimate-outside-click case.
          }}
          autoComplete="off"
          // Chrome ignores wrapper "off"; new-password on the input
          // suppresses the browser autofill menu over our Popper.
          slotProps={{ htmlInput: noFill }}
        />
        <Popper
          open={open && filtered.length > 0}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
          style={{ zIndex: 1500, width: anchorRef.current?.clientWidth }}
        >
          <ClickAwayListener onClickAway={closePicker}>
            <Paper
              elevation={4}
              style={{ maxHeight: 280, overflowY: "auto" }}
            >
              {filtered.map((entry, idx) => (
                <ListItemButton
                  key={entry.token}
                  selected={idx === highlight}
                  // Mouse-down (not click) so the focus stays on
                  // the input — click runs after blur, which would
                  // ClickAway-close the picker mid-insert.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertToken(entry);
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  dense
                >
                  <ListItemText
                    primary={
                      <span>
                        <code className="mr-2">{entry.token}</code>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {entry.label}
                        </span>
                      </span>
                    }
                    secondary={entry.description}
                  />
                </ListItemButton>
              ))}
            </Paper>
          </ClickAwayListener>
        </Popper>
      </div>
    );
  },
);

TokenFieldControl.displayName = "TokenFieldControl";

export default TokenFieldControl;
