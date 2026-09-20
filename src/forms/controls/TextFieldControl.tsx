// fields/TextFieldControl.tsx
import React, { useEffect, useState, useRef } from "react";
import { InputAdornment, TextField } from "@mui/material";
import MaskedInput from "../MaskedInput";
import { useNoAutofill } from "../../helpers/useNoAutofill";

const TextFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const [localValue, _setLocalValue] = useState(props.value ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Stable refs so the autofill listener doesn't need to be torn
  // down + rebound on every keystroke just to read the latest
  // localValue / handleChange.
  const localValueRef = useRef(localValue);
  localValueRef.current = localValue;
  const handleChangeRef = useRef(props.handleChange);
  handleChangeRef.current = props.handleChange;

  // Update localValue if parent value changes
  useEffect(() => {
    _setLocalValue(props.value ?? "");
  }, [props.value]);

  // Browser autofill bypasses React's synthetic `onChange`, so the
  // input's DOM value moves but `localValue` stays put. Two
  // backstops:
  //   1. Listen for MUI's `mui-auto-fill` CSS animation — Chrome
  //      / Edge / Safari trigger an animationstart on the input
  //      when autofill applies, which we use to pull the live
  //      DOM value into state.
  //   2. A short post-mount poll for browsers that fill before
  //      the animation hook is wired (the original behaviour;
  //      retained as belt-and-braces).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const syncFromDom = () => {
      const liveValue = el.value;
      if (liveValue !== localValueRef.current) {
        _setLocalValue(liveValue);
        handleChangeRef.current?.(liveValue);
      }
    };

    const onAnimationStart = (e: AnimationEvent) => {
      if (
        e.animationName === "mui-auto-fill" ||
        e.animationName === "mui-auto-fill-cancel"
      ) {
        // Defer to next tick so the value definitely lands first.
        setTimeout(syncFromDom, 0);
      }
    };

    el.addEventListener("animationstart", onAnimationStart);
    const pollTimer = setTimeout(syncFromDom, 200);

    return () => {
      el.removeEventListener("animationstart", onAnimationStart);
      clearTimeout(pollTimer);
    };
  }, []);

  const setLocalValue = (v: string) => {
    if (props.uppercase) v = v.toUpperCase();
    if (v.length > props.max) {
      v = v.substring(0, props.max);
    }
    _setLocalValue(v);
    // Opt-in live commit — fire on every keystroke so the host sees the
    // value without waiting for blur. Default stays blur-commit
    // (handled by onBlur → commitValue).
    if (props.commitOn === "change" && v !== props.value) {
      props.handleChange(v);
    }
  };

  const commitValue = () => {
    // Read the live DOM value rather than localValue — autofill
    // can have updated the input without ever firing onChange,
    // leaving localValue out of sync. Tabbing out now reconciles
    // either way: typed input flowed through onChange already,
    // autofilled input gets caught here.
    let v = inputRef.current?.value ?? localValue;
    if (props.uppercase) v = v.toUpperCase();
    if (v.length > props.max) v = v.substring(0, props.max);
    if (v !== localValue) _setLocalValue(v);
    if (v !== props.value) {
      props.handleChange(v);
    }
  };

  return (
    <TextField
      fullWidth
      label={props.label}
      value={localValue}
      disabled={props.disabled}
      error={props.has_errors}
      rows={props.rows}
      multiline={props.rows !== undefined}
      inputRef={inputRef}
      autoFocus={props.autoFocus}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={commitValue}
      // Outer-wrapper attribute — some browsers respect this on
      // the MUI wrapper; Chrome does not (see inputProps below).
      autoComplete={props.autoComplete || "off"}
      // Chrome / Edge ignore `autocomplete="off"` on
      // name / email-shaped fields and apply contact-card
      // autofill anyway. `useNoAutofill` sets the underlying
      // input's `autocomplete` to `"new-password"` instead — a
      // known value meaning "don't fill this from saved
      // contacts". Callers opting in to real autofill
      // (`given-name`, `email`, …) pass their token through
      // unchanged.
      //
      // The mask has to be merged in here rather than nested
      // under `InputProps.inputProps`: both end up as the input
      // element's props, and the nested one won, so every masked
      // field (postcode, sort code, NI number) silently lost its
      // autofill suppression.
      slotProps={{
        // Adornments and the mask both land on `input`, so they are
        // merged rather than one replacing the other — the same trap
        // the mask / autofill note above describes.
        input: {
          ...(props.mask ? { inputComponent: MaskedInput as any } : {}),
          ...(props.prefix
            ? {
                startAdornment: (
                  <InputAdornment position="start">
                    {props.prefix}
                  </InputAdornment>
                ),
              }
            : {}),
          ...(props.suffix
            ? {
                endAdornment: (
                  <InputAdornment position="end">{props.suffix}</InputAdornment>
                ),
              }
            : {}),
        },
        htmlInput: props.mask ? { ...props.mask, ...noFill } : noFill,
      }}
    />
  );
});

export default TextFieldControl;
