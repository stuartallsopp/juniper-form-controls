// FormField/FieldWrapper.tsx
import React, { type ReactNode, useContext, useMemo } from "react";
import { Box, alpha } from "@mui/material";
import type { Theme } from "@mui/material";
import { resolve_size, resolve_span } from "../helpers/formHelper";
import { ChangeIndicatorContext } from "./ChangeIndicatorContext";

interface FieldWrapperProps {
  size: number;
  className?: string;
  errors?: string[];
  type: string;
  changes?: {
    path: string;
    id?: string | null;
    type?: string;
    callback: (k: string) => boolean;
  };
  /** True draws a coloured left accent + faint tinted bg on the
   *  cell — used by change-request dialogs to mark fields whose
   *  value differs from the original. See FormFieldProps. */
  highlight?: boolean;
  /** Optional bottom-right guidance string. See FormFieldProps. */
  help_text?: string;
  /** Where the guidance sits — "corner" (default, the floated
   *  bottom-right one-liner), "below" (in flow, wrapping,
   *  left-aligned) or "beside" (the same sentence, in a column to
   *  the right of the control). See FormFieldProps. */
  help_placement?: "corner" | "below" | "beside";
  /**
   * How many rows the control renders, where it is a textarea.
   *
   * Only the guidance cares: a single-line field leaves a strip of
   * empty cell under it for the help text to sit in, and a textarea
   * does not — it fills the cell, so the same absolute placement puts
   * the guidance on top of the last line somebody typed.
   */
  rows?: number;
  children: ReactNode;
}

const FieldWrapper = React.memo(
  ({
    size,
    errors,
    changes,
    children,
    type,
    highlight,
    help_text,
    help_placement,
    rows,
    className,
  }: FieldWrapperProps) => {
    // A textarea fills its cell, so there is no strip left at the
    // bottom to float guidance in. `help_placement="below"` asks for
    // the same in-flow treatment outright, for guidance that has to be
    // read rather than glanced at — so the two share a branch.
    const multiline =
      (rows ?? 0) > 1 ||
      help_placement === "below" ||
      help_placement === "beside";
    // ...but they do not share an alignment. The multiline case is
    // guidance trailing a textarea, and stays right-aligned where it
    // has always been; "below" is a sentence under a control, and a
    // sentence starts at the left.
    const flowLeft = help_placement === "below" || help_placement === "beside";
    const renderIndicator = useContext(ChangeIndicatorContext);
    const ChangeInd = useMemo(() => {
      if (!changes) return null;
      if (!changes.callback(changes.path)) return null;
      if (!renderIndicator) return null;

      return renderIndicator(
        changes.path,
        changes.id ?? undefined,
        changes.type,
      );
    }, [changes, renderIndicator]);

    // When highlighted we lift the descendant MUI control's outline
    // and fill into the theme's own accent (idle / hover / focused +
    // labels) and tint Switches the same colour. Targets the actual
    // control, not the wrapper, so the highlight tracks the input
    // visually rather than the surrounding cell.
    //
    // `primary`, and an alpha of it for the fill, rather than a grey:
    // a marked field is the thing on the page worth looking at, and
    // `action.hover` renders as the same neutral as every disabled
    // control around it. Derived from the palette so it follows the
    // portal's accent and both colour modes without a literal.
    // Date and time fields are picked out separately throughout,
    // because MUI X v8 does not render a `TextField`: its pickers
    // build their own input out of `PickersOutlinedInput`, whose
    // classes are `MuiPickersOutlinedInput-*` rather than
    // `MuiOutlinedInput-*`. A selector list written for one silently
    // misses the other — which is how a form could mark a changed
    // status and leave the changed date beside it looking untouched,
    // on the one screen whose entire job is showing what differs.
    const highlightSx = highlight
      ? {
          [`& .MuiOutlinedInput-notchedOutline,
             & .MuiPickersOutlinedInput-notchedOutline`]: {
            borderColor: "primary.main",
            borderWidth: 2,
          },
          [`& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline,
             & .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline`]:
            {
              borderColor: "primary.main",
            },
          [`& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline,
             & .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline`]:
            {
              borderColor: "primary.main",
            },
          "& .MuiInputLabel-root, & .MuiInputLabel-root.Mui-focused": {
            color: "primary.main",
          },
          "& .MuiSwitch-switchBase.Mui-checked": { color: "primary.main" },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "primary.main",
          },
          "& .MuiCheckbox-root.Mui-checked": { color: "primary.main" },
          // A tinted field, not just an outlined one. An approver is
          // reading a page of controls to find the two that differ,
          // and a border alone is easy to skim past — the fill is what
          // makes them findable at a glance.
          [`& .MuiOutlinedInput-root,
             & .MuiPickersOutlinedInput-root`]: {
            backgroundColor: (theme: Theme) =>
              alpha(theme.palette.primary.main, 0.06),
          },
          // …and legible while disabled, which is how an approver
          // always sees them: a signed-off form is deliberately
          // read-only, and MUI greys disabled text far enough that
          // the value you are being asked to approve is the hardest
          // thing on the page to read. `WebkitTextFillColor` is the
          // one that actually wins on a disabled input.
          [`& .MuiInputBase-input.Mui-disabled,
             & .MuiInputBase-input.Mui-disabled::placeholder,
             & .MuiPickersInputBase-root.Mui-disabled,
             & .MuiPickersSectionList-root.Mui-disabled`]: {
            WebkitTextFillColor: (theme: Theme) => theme.palette.text.primary,
            color: "text.primary",
          },
        }
      : undefined;

    // A switch whose guidance is a sentence lays out as two columns:
    // the control in a fixed one, the sentence in its own beside it.
    //
    // Not a nicety. `flex items-center` — the default for a boolean —
    // makes the guidance a flex SIBLING of the control, so it begins
    // wherever that row's label happens to end. Down a list of
    // seventeen switches every sentence starts at a different x, the
    // eye has no edge to run down, and the labels get squeezed into
    // wrapping over two lines by the text competing for the row.
    // Giving each a column fixes the label width and the guidance's
    // left edge at once.
    //
    // One column below `sm`, where 280px of label and a sentence
    // beside it do not both fit; the guidance then sits under the
    // control, still sharing its left edge with every other row.
    //
    // A boolean gets this automatically, because a switch and its
    // sentence never wanted to be stacked. Every other type has to
    // ask for it by name — "beside" — since a control that fills its
    // cell has nowhere to put a second column, and the twenty-odd
    // panels already passing "below" are laid out around the sentence
    // sitting under the field.
    const twoColumn =
      (flowLeft && type == "boolean") || help_placement === "beside";

    // "beside" divides the row on the panel's own twelfths: the
    // control takes `size` of them and the guidance the rest. The
    // cell itself goes full width, because the split is inside it —
    // a half-width cell would just make both halves narrow.
    const beside = help_placement === "beside";
    const controlSpan = beside ? resolve_span(size) : "";
    const helpSpan = beside ? resolve_span(12 - size) : "";

    return (
      <Box
        className={`${beside ? "w-full" : resolve_size(size)} ${className} relative py-1.5 px-1 min-h-17 ${
          beside
            ? "grid grid-cols-1 lg:grid-cols-12 gap-x-4 items-start"
            : twoColumn
              ? "grid grid-cols-1 sm:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-4 items-start"
              : type == "boolean" || type == "access_level"
                ? "flex items-center"
                : ""
        }`}
        sx={highlightSx}
      >
        {beside ? (
          <div className={`${controlSpan} flex items-center`}>{children}</div>
        ) : (
          children
        )}

        {/* Change indicator */}
        {ChangeInd && (
          <span className="absolute bottom-0 right-0">{ChangeInd}</span>
        )}

        {/* Help text — bottom-right inline guidance. Shifts left
            when the change indicator occupies the corner so the
            two don't collide.

            **In flow under a textarea, floating under everything
            else.** The float depends on the cell being taller than
            its control, which `min-h-17` guarantees for a one-line
            input and nothing guarantees for a twelve-row box — there
            the guidance landed on top of the last sentence somebody
            had written. In flow it also wraps rather than truncating,
            which is the shape of guidance long enough to want a
            textarea in the first place. */}
        {help_text ? (
          <span
            // 7px, not 5 — at 5 the guidance sat on the control's
            // own right border and the two read as one smudge.
            className={
              flowLeft
                ? // `pt-2` on the two-column row, not `pt-0.5`: the
                  // control column is a 38px-tall switch and the
                  // guidance is 12px text, so matching their tops
                  // leaves the sentence floating above the label it
                  // belongs to. This sets it on the label's baseline.
                  `block pr-2 text-left text-xs leading-snug text-slate-500 dark:text-slate-400 ${helpSpan} ${
                    twoColumn ? "pt-2" : "pt-0.5"
                  }`
                : multiline
                  ? "block pt-1 pr-[7px] text-right text-[10px] leading-tight text-slate-500 dark:text-slate-400"
                  : `absolute bottom-[8px] ${ChangeInd ? "right-6" : "right-[7px]"} pointer-events-none text-right text-[10px] leading-tight text-slate-500 dark:text-slate-400 max-w-[80%] truncate`
            }
            // A title tooltip repeating text that is already fully
            // visible is noise, and on a long sentence it is a tooltip
            // nobody asked for. Only the truncating placement needs it.
            title={flowLeft ? undefined : help_text}
          >
            {help_text}
          </span>
        ) : null}

        {/* Error indicator */}
        {errors?.length ? (
          <span className="group absolute bottom-0 left-0 z-50">
            <span
              className="
                block h-3 w-3 rounded-full bg-red-600
                border border-white
                group-hover:h-auto
                group-hover:w-48
                group-hover:rounded-lg
                group-hover:p-2
              "
            >
              <span
                className="
                  hidden text-white text-xs
                  group-hover:block
                "
              >
                {errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </span>
            </span>
          </span>
        ) : null}
      </Box>
    );
  },
);

export default FieldWrapper;
