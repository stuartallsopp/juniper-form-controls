import { useState } from 'react'

/**
 * A name no field has used before.
 *
 * Deliberately not `useId()`. That is derived from the component's
 * position in the tree, so the same id — and therefore the same
 * generated name — recurs on every drawer that renders a picker at
 * the same depth. Chrome keys its saved-form-data menu on the name,
 * so those fields end up sharing one history bucket and offering each
 * other's values: a spine point picker suggesting "Sundry Expenses
 * (SUNDRY)" because some other picker three screens away submitted it
 * under the same generated name.
 *
 * Unique per mount, so there is never any history to offer. Anything
 * Chrome stores is filed under a name that will not occur again.
 */
let seq = 0
const nextFieldName = (): string => `nf-${(seq += 1)}-${Math.random().toString(36).slice(2, 10)}`

/**
 * Keep the browser's own autofill menu off our fields.
 *
 * **Suppressed by default; opt in to enable.** A form field is ours
 * until a caller says otherwise — the browser guessing at a payroll
 * field is nearly always wrong, and when it is wrong it is not merely
 * untidy: its menu renders *over* the field's own options, so on a
 * picker you are choosing from a list you cannot see. A caller that
 * genuinely wants autofill (a real address or contact form) passes
 * the proper token — `given-name`, `email`, `postal-code` — and gets
 * it untouched.
 *
 * Two things are needed, and either alone is not enough:
 *
 *  - **`autocomplete="new-password"`.** Chrome and Edge ignore
 *    `"off"` on name- and email-shaped fields and apply contact-card
 *    autofill anyway. `new-password` is a real token meaning "do not
 *    fill this from saved contacts", so it works without the side
 *    effects of an invented value.
 *  - **a non-semantic `name`.** The browser classifies by name as
 *    well as by type, so a field called `email` is a candidate
 *    whatever its autocomplete says. A generated one gives it
 *    nothing to match on.
 *
 * @param optIn the caller's `autoComplete` prop, if any
 */
export const useNoAutofill = (optIn?: string) => {
  // useState initialiser, so the name is minted once per mount and
  // stays put across re-renders — a name that changed on every
  // keystroke would defeat MUI's own input handling.
  const [name] = useState(nextFieldName)

  if (optIn && optIn !== 'off') {
    // Deliberate opt-in — pass it through untouched, and leave the
    // name and the manager hints alone so both the browser and any
    // manager can classify the field.
    return { autoComplete: optIn }
  }

  return {
    autoComplete: 'new-password',
    name,
    // Password managers are a separate problem from the browser's
    // own autofill, and `new-password` makes it worse: it is the
    // signal that means "this is a new password field", so 1Password
    // and friends offer to fill it. Their overlays are drawn by the
    // extension, outside the page's DOM, so nothing in our markup
    // hides them — only these documented opt-outs do.
    //
    // Each vendor reads its own attribute; they are inert everywhere
    // else, so all four ride along.
    'data-1p-ignore': 'true', // 1Password
    'data-lpignore': 'true', // LastPass
    'data-bwignore': 'true', // Bitwarden
    'data-form-type': 'other', // Dashlane
  }
}
