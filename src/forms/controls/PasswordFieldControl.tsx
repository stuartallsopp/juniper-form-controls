// fields/PasswordFieldControl.tsx
import React, { useEffect, useRef, useState } from "react";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import Icon from "../../display/Icon";
import { useNoAutofill } from "../../helpers/useNoAutofill";

/**
 * A secret the operator types in: a provider passphrase, a gateway
 * password, an API key.
 *
 * Obscured by default with a reveal toggle, because these are values
 * somebody is transcribing from an email or a phone call and cannot
 * check by reading back. A field that can never be shown produces
 * typos nobody finds until the file is rejected at the other end.
 * Reveal is a deliberate press and reverts on its own terms — it is
 * not remembered between mounts.
 *
 * Deliberately narrower than TextFieldControl:
 *
 *  - **No mask, prefix, suffix or uppercase.** A secret has no shape
 *    to enforce and no decoration to add; forcing case would silently
 *    change the value.
 *  - **No autofill reconciliation.** The text control listens for
 *    Chrome's `mui-auto-fill` animation because a contact-shaped field
 *    can be filled behind React's back. This one asks the browser not
 *    to fill at all (`new-password`), which is the same request a
 *    change-password form makes, so there is nothing to reconcile.
 *
 * Write-only fields — where the stored value never comes back — pass
 * an empty `value` and say so in the label. This control has no
 * opinion about that; it is the caller's contract.
 */
const PasswordFieldControl = React.memo((props: any) => {
  // Default to `new-password`: it is the token that means "do not
  // offer a saved credential here", which is exactly right for a
  // provider passphrase the operator holds on our behalf rather than
  // one of their own logins.
  const noFill = useNoAutofill(props.autoComplete ?? "new-password");
  const [localValue, setLocalValue] = useState(props.value ?? "");
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalValue(props.value ?? "");
  }, [props.value]);

  // Re-obscure whenever the field is disabled out from under the
  // operator — turning protection off with the password showing would
  // otherwise leave it on screen with no way to put it back.
  useEffect(() => {
    if (props.disabled) setRevealed(false);
  }, [props.disabled]);

  const change = (raw: string) => {
    const v = props.max ? raw.substring(0, props.max) : raw;
    setLocalValue(v);
    if (props.commitOn === "change" && v !== props.value) {
      props.handleChange(v);
    }
  };

  const commit = () => {
    const v = localValue;
    if (v !== props.value) props.handleChange(v);
  };

  return (
    <TextField
      fullWidth
      type={revealed ? "text" : "password"}
      label={props.label}
      value={localValue}
      disabled={props.disabled}
      error={props.has_errors}
      inputRef={inputRef}
      autoFocus={props.autoFocus}
      onChange={(e) => change(e.target.value)}
      onBlur={commit}
      autoComplete={props.autoComplete ?? "new-password"}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={revealed ? "Hide" : "Show"}>
                {/* `span` so the tooltip still works while the button
                    is disabled — a disabled button emits no pointer
                    events for the tooltip to hang off. */}
                <span>
                  <IconButton
                    size="small"
                    edge="end"
                    disabled={props.disabled}
                    onClick={() => setRevealed((r) => !r)}
                    // Not in the tab order: tabbing out of a password
                    // field should go to the next field, not to a
                    // button that shows what was just typed.
                    tabIndex={-1}
                    aria-label={revealed ? "Hide password" : "Show password"}
                  >
                    <Icon
                      name={revealed ? "VisibilityOff" : "Visibility"}
                      fontSize="small"
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </InputAdornment>
          ),
        },
        htmlInput: noFill,
      }}
    />
  );
});

export default PasswordFieldControl;
