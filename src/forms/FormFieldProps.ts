import type { IconName } from "../display/Icon";
import type { Actor } from "../helpers/actorHelper";
import type { DataObject } from "../types/DataObject";

/** One stop on the `access_level` slider. The slider renders the
 *  stops in order; the active stop's icon + colour drive the thumb,
 *  its label shows while sliding, and its tooltip (if set) explains
 *  the current selection on hover. `value` is what `handleChange`
 *  emits for that stop — a number (the default 0/1/2 access levels)
 *  or a string (e.g. 'inherit' / 'allow' / 'deny'). */
export type AccessLevelStop = {
  value: number | string;
  label: string;
  icon?: IconName;
  /** MUI palette token, e.g. 'success.main' / 'error.main'. */
  color?: string;
  tooltip?: string;
};

/** How relevant a catalogue option is to whatever the caller is doing. */
export type CatalogueRelevance = "suggested" | "available" | "unavailable";

/** One row in a `catalogue` field. */
export type CatalogueOption = {
  id: string | number;
  label: string;
  /** The section it sits under — "Pay", "Absence", "Employee". */
  group: string;
  /** A line under the label: what it asks for, what it watches. */
  detail?: string | null;
  /** Search terms that are not in the label — "aoe", "court order". */
  keywords?: string[];
  relevance?: CatalogueRelevance;
  /** Why it cannot be used. Shown on the row rather than hidden. */
  unavailableReason?: string | null;
};

type FromFieldBase = {
  label: string;
  size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  disabled?: boolean;
  has_errors?: boolean;
  errors?: string[] | undefined;
  autoFocus?: boolean;
  changes?: {
    path: string;
    id?: string | null;
    type?: string;
    callback: (k: string) => boolean;
  };
  /**
   * Visual flag — true draws a coloured left accent + tinted bg
   * on the field. Used by change-request edit dialogs to show
   * which fields differ from the original (live record) value
   * the request would change. Default false. Distinct from
   * `changes`, which surfaces server-side pending change
   * requests on the live record.
   */
  highlight?: boolean;
  /**
   * Optional one-line guidance rendered inside the field's
   * bottom-right corner, right-aligned. Used for short
   * hints ("Comma-separated integers.", "0–23, end of day
   * default") without taking a separate row.
   *
   * Available on every field type because guidance is
   * cross-cutting. Render-side caveat: shares the bottom-right
   * slot with the change indicator, so don't lean on it for
   * load-bearing UX in change-request dialogs.
   */
  help_text?: string;
  /**
   * Where `help_text` sits.
   *
   * `"corner"` (default) is the established placement described above —
   * one line, right-aligned, floated into the cell's bottom-right, and
   * truncated at 80% of the width. Right for "0–23, end of day
   * default"; wrong for anything that has to be read.
   *
   * `"below"` renders the guidance in flow underneath the control,
   * left-aligned and wrapping. For a field whose guidance is the point
   * rather than a hint — a pay-type switch where "Employer Class 1A"
   * means nothing without the sentence saying it is a different NI
   * class from Employer NI, and that setting both charges twice.
   *
   * Opt-in, and absent on every existing usage, so nothing already
   * written moves. Pair it with `vSlim` on a boolean: `min-h-17` is
   * only there to reserve the strip the corner placement floats in.
   *
   * `"beside"` puts that same sentence in a column to the right of
   * the control rather than under it — what a boolean already does
   * with `"below"`, available to the other types by asking. Worth it
   * where the field is narrow and the sentence is long enough that
   * stacking them turns one row into six. Give the cell the full
   * twelve: the column split is inside it, so a half-width cell just
   * makes both halves narrow.
   */
  help_placement?: "corner" | "below" | "beside";
  /**
   * Optional action button bolted onto the field as a trailing end
   * adornment (after the control's own clear / dropdown icons) —
   * used e.g. to open a "manage the picker's options" dialog. Opt-in;
   * currently honoured by the `autocomplete` control. Absent on the
   * vast majority of fields, so existing usages are unaffected.
   */
  action?: {
    icon: IconName;
    onClick: () => void;
    tooltip?: string;
    disabled?: boolean;
  };
};

export type FormFieldProps =
  | (FromFieldBase & {
      type: "text";
      uppercase?: boolean;
      mask?: MaskDefinition;
      max?: number;
      rows?: number;
      /**
       * Fixed text inside the box, before (`prefix`) or after
       * (`suffix`) what the operator types. Decoration, not content —
       * it is never part of the value, so a field prefixed `https://`
       * stores and hands back the rest of the address on its own.
       *
       * For the invariant part of a value: the scheme on a URL, a unit
       * on a measurement. If it can vary, it belongs in the box.
       */
      prefix?: string;
      suffix?: string;
      value?: string | unknown;
      handleChange: (val: string) => void;
      /** When `handleChange` fires. `"blur"` (default) commits once the
       *  field loses focus — the established behaviour, right for
       *  change-request dialogs and anything that shouldn't churn on
       *  every keystroke. `"change"` commits on every edit — use when the
       *  host needs the live value (enabling a Save button, live
       *  validation, a controlled search box). */
      commitOn?: "blur" | "change";
      /** Hint to the browser for autofill — `email`, `tel-national`,
       *  `address-line1`, etc. Defaults to `"off"` so noisy or
       *  irrelevant suggestions don't surface; set explicitly when
       *  you want the browser to offer a saved value. */
      autoComplete?: string;
    })
  | (FromFieldBase & {
      /**
       * A secret the operator types in — a provider passphrase, a
       * gateway password, an API key. Obscured with a reveal toggle,
       * and asks the browser not to autofill it.
       *
       * Narrower than `text` on purpose: no mask, prefix, suffix or
       * uppercase, because a secret has no shape to enforce and
       * forcing case would silently change the value.
       *
       * For a WRITE-ONLY field — where the server never hands the
       * stored value back — pass an empty `value` and say so in the
       * label ("Password (leave blank to keep current)"). The control
       * has no opinion about that; it is the caller's contract.
       */
      type: "password";
      /** Cap on length. Unset means no cap. */
      max?: number;
      value?: string | unknown;
      handleChange: (val: string) => void;
      /** When `handleChange` fires. Defaults to `"blur"`, as `text`. */
      commitOn?: "blur" | "change";
      /**
       * Defaults to `"new-password"` — the token that means "do not
       * offer a saved credential here", right for a passphrase held on
       * a provider's behalf rather than one of the operator's logins.
       */
      autoComplete?: string;
    })
  | (FromFieldBase & {
      type: "boolean";
      value?: boolean | unknown;
      handleChange: (val: boolean) => void;
      variant: "switch" | "checkbox";
      /**
       * Caps the cell's height — for a switch sharing a row with
       * controls that do not need the room a field does.
       */
      slim?: boolean;
      /**
       * Drops the cell's minimum height as well.
       *
       * `min-h-17` exists so a one-line input has a strip beneath it for
       * its guidance to sit in. A switch on a row of its own, beside
       * something that is not a field at all — a chip, a filename, a
       * size — has no guidance and no reason to reserve the space, and
       * the gap reads as a list somebody has double-spaced.
       *
       * Independent of `slim`: one takes the ceiling off, the other the
       * floor, and a row can want either.
       */
      vSlim?: boolean;
    })
  | (FromFieldBase & {
      /**
       * A long, grouped, searchable list — conditions, trigger
       * sources, anything past about fifteen entries where a flat
       * dropdown stops helping. Search covers `keywords` as well as
       * the label, and unavailable rows are greyed with their reason
       * rather than filtered out.
       */
      type: "catalogue";
      content: CatalogueOption[];
      value: string | number | null;
      handleChange: (val: string | number) => void;
      /** Names the "Suggested for …" heading. */
      suggested_for?: string | null;
      placeholder?: string;
      compact?: boolean;
      autoComplete?: string;
    })
  | (FromFieldBase & {
      type: "autocomplete";
      value?: DataObject | null;
      handleChange: (val: DataObject | null) => void;
      url?: string;
      content?: DataObject[];
      params?: { [key: string]: string };
      id_key: string;
      display_key: string;
      context: DataObject;
    })
  | (FromFieldBase & {
      // Variant of autocomplete that stores the picked option's id
      // (a bare string) on the record rather than the full picker
      // object. The dropdown still shows the descriptive label
      // (display_key); the selected pill renders option_label_key
      // (default = id_key) — typically just the bare code.
      type: "autocomplete_scalar";
      value?: string | null;
      handleChange: (val: string | null) => void;
      url?: string;
      content?: DataObject[];
      params?: { [key: string]: string };
      id_key: string;
      display_key: string;
      option_label_key?: string;
      context?: DataObject;
    })
  | (FromFieldBase & {
      type: "multitext";
      value: string[];
      handleChange: (val: string[]) => void;
      content: string[];
      url?: string;
      params?: { [key: string]: string };
      context?: DataObject;
    })
  | (FromFieldBase & {
      /**
       * Two to four mutually exclusive choices, all visible at once.
       * Above four the row stops fitting — use `dropdown`.
       *
       * Selection is enforced: there is no "none" state, so seed
       * `value` with the option that should start active.
       */
      type: "segmented";
      value: string | number;
      /**
       * `detail` is a line about that one option — what picking it
       * does, or (on a `disabled` option) why it cannot be picked
       * here. The selected option's detail renders under the group;
       * a disabled option's renders beside it, so the reason an
       * answer is unavailable is on the page rather than inferred
       * from the fact that it is greyed.
       *
       * Optional, so existing segmented fields render as before.
       */
      content: {
        id: number | string;
        display: string;
        disabled?: boolean;
        detail?: string;
      }[];
      /** Stretch the buttons to fill the field's width. Default false
       *  — a short set of labels reads better left-aligned. */
      full_width?: boolean;
      handleChange: (val: string | number) => void;
    })
  | (FromFieldBase & {
      type: "dropdown";
      url?: string;
      params?: { [key: string]: string };
      context?: DataObject;
      default?: string | number;
      /**
       * Empty means "the first option", chosen for the operator rather
       * than left for them to state.
       *
       * For lists where every option is a valid reading and the first
       * is the ordinary one — a comparator's operator, where "is more
       * than" or "is one of" is what somebody adding the row meant.
       * Opt-in, because on most fields blank is a real answer and
       * filling it in would put a value on a record nobody chose.
       *
       * The control calls `handleChange` when it defaults, so the
       * value is stored rather than only shown. That marks the record
       * changed — which is the point, and the reason this is not the
       * default behaviour.
       */
      default_first?: boolean;
      value?: string | number | "";
      content?: { id: number | string; display: string; disabled?: boolean }[];
      handleChange: (val: string | number) => void;
    })
  | (FromFieldBase & {
      type: "number";
      decimals: number;
      /**
       * `null` is empty, and it is a real answer — a limit nobody set,
       * a figure not yet known. The control has always been able to
       * render it and has always handed `undefined` back when cleared;
       * the type simply said otherwise. Matches the `date` variant,
       * which has modelled empty as `null` from the start.
       */
      value: number | null;
      prefix?: string;
      suffix?: string;
      /**
       * Redraw as empty when the value is cleared from outside — a
       * parent clearing dependent fields, a reset. Off by default:
       * NumericFormat reads a nullish `value` as "uncontrolled" and
       * keeps whatever text is in the box, and enough of the app has
       * been built against that to make changing it for everybody a
       * bigger question than any one field needs to ask.
       */
      sync_empty?: boolean;
      handleChange: (val: number) => void;
    })
  | (FromFieldBase & {
      type: "date";
      value: string | null;
      handleChange: (val: string | null) => void;
      format: "D/M/YYYY" | "mm/dd/yyyy" | "yyyy/mm/dd";
      nullable?: boolean;
      /** Disable specific days in the picker (e.g. non-working days).
       *  Receives the MUI X day object; return true to disable. */
      shouldDisableDate?: (day: import("dayjs").Dayjs) => boolean;
    })
  | (FromFieldBase & {
      type: "year";
      value: string | null;
      handleChange: (val: string | null) => void;
    })
  | (FromFieldBase & {
      type: "datetime";
      value: string | null;
      handleChange: (val: string | null) => void;
      format?: string;
      nullable?: boolean;
    })
  | (FromFieldBase & {
      /** Values from several axes in one field — see `facetHelper`.
       *  The axes are runtime data (a tenant's own classification
       *  dimensions), so the field is told about them rather than
       *  knowing them, and adding one never reaches the form schema.
       *  A pick replaces whatever was held on the same axis. */
      type: "facets";
      options: {
        uuid: string;
        id?: number;
        name: string;
        group: { uuid: string; name: string | null };
      }[];
      value: {
        uuid: string;
        id?: number;
        name: string;
        group: { uuid: string; name: string | null };
      }[];
      handleChange: (
        val: {
          uuid: string;
          id?: number;
          name: string;
          group: { uuid: string; name: string | null };
        }[],
      ) => void;
    })
  | (FromFieldBase & {
      /** People and groups in one field — see `actorHelper`. The
       *  value is the merged list; `splitActors` puts it back into
       *  `user_uuids` / `group_uuids` for the save. */
      type: "actors";
      users: { uuid: string; name: string }[];
      groups: { uuid: string; name: string }[];
      /** Offer "whoever this is about" as a pick. Omit where there is
       *  no subject to speak of — a workflow stage has none. */
      subjectLabel?: string;
      /** Further picks resolved when the message is sent rather than
       *  named now — "whoever raised it", "the stage's group". Same
       *  bargain as `subjectLabel`, for surfaces with more than one.
       *  `uuid` is the caller's key for the role. */
      roles?: { uuid: string; name: string }[];
      /** Staff, who are not portal users — the employee portal
       *  authenticates a different model, and somebody on a panel may have no
       *  employer login at all. */
      employees?: { uuid: string; name: string }[];
      /** Search server-side instead of filtering a preloaded list. A
       *  directory stops being a picker somewhere past a few hundred people.
       *  Omit and the lists above are used as before. */
      url?: string;
      // `Actor` rather than the union written out again. It was written out
      // twice here, so adding a kind broke two copies that agreed with each
      // other and with nothing else.
      /** Say something extra on a pick's chip — label, colour, variant. The
       *  chip is already on screen; a second row of the same names below it
       *  is not a second thing, it is the same thing twice. */
      decorateChip?: (actor: Actor) => {
        label?: React.ReactNode;
        color?: "default" | "primary" | "secondary";
        variant?: "filled" | "outlined";
      };
      /** Clicking a chip does something other than remove it. */
      onChipClick?: (actor: Actor) => void;
      value: Actor[];
      handleChange: (val: Actor[]) => void;
    })
  | (FromFieldBase & {
      type: "multi";
      content?: { id: number | string; display: string }[];
      url?: string;
      params?: { [key: string]: string };
      context?: DataObject;
      /** Field on each option object used as the chip label /
       *  dropdown label. Defaults to `display`. Override when the
       *  picker resource emits a different field (e.g. payroll
       *  picker emits `name`). */
      display_key?: string;
      /** Field on each option object used as the identity. Defaults
       *  to `id`. */
      id_key?: string;
      value: { id: number | string; display: string }[];
      handleChange: (val: { id: number | string; display: string }[]) => void;
    })
  | (FromFieldBase & {
      type: "json";
      value?: string | object | null;
      height?: number;
      handleChange: (val: string) => void;
    })
  | (FromFieldBase & {
      type: "colour";
      /** Tailwind colour key (e.g. "sky"). null means "no colour set". */
      value?: string | null;
      handleChange: (val: string | null) => void;
    })
  | (FromFieldBase & {
      type: "width";
      /** 1-12 column-grid width (3 = 1/4, 4 = 1/3, 6 = 1/2,
       *  8 = 2/3, 9 = 3/4, 12 = full row). */
      value?: number | null;
      handleChange: (val: number) => void;
    })
  | (FromFieldBase & {
      /** Tri-state access slider — 0 = No access, 1 = View,
       *  2 = Edit. Renders as a Switch-styled pill with three
       *  stops; the thumb carries the active state's icon
       *  (Block / Visibility / Edit). Designed for the ability
       *  override grid on the user record, but generic — any
       *  read / write / nothing decision fits the shape. */
      type: "access_level";
      value?: number | string | null;
      /** Optional custom stops — value / label / icon / colour /
       *  tooltip per stop. Defaults to the 3-level access slider
       *  (No access / View / Edit). Lets the same control drive other
       *  tri-state (or n-state) decisions, e.g. Inherit / Allow / Deny
       *  with their own icons, colours and tooltips. */
      stops?: AccessLevelStop[];
      handleChange: (val: number | string) => void;
    })
  | (FromFieldBase & {
      /** Single-line text input with a `{token}` mention-style
       *  picker. Typing the trigger char (default `{`) opens an
       *  anchored dropdown of available tokens, narrowed by what
       *  the operator types after it. Arrow keys + Enter / Tab
       *  select; Escape dismisses; clicking outside dismisses. The
       *  whole token literal (including braces) is inserted on
       *  pick, replacing any partial trigger text.
       *
       *  Used for filename / path templates on the SFTP credential
       *  form so the operator can discover the supported token set
       *  inline rather than reading docs. */
      type: "token";
      value?: string | unknown;
      handleChange: (val: string) => void;
      tokens: Array<{ token: string; label: string; description?: string }>;
      /** Character that opens the picker. The character itself is
       *  expected to be part of the literal tokens (so the picker
       *  fires on the natural typing rhythm). Defaults to "{". */
      triggerChar?: string;
      max?: number;
      /** Multi-line mode — when set (>1), the control renders a
       *  textarea with this many rows. Enter inserts a newline as
       *  usual; Enter-to-pick stays gated behind the picker being
       *  open. */
      rows?: number;
    });

export type MaskDefinition = {
  mask: string;
  lazy?: boolean;
  placeholderChar?: string;
  definitions?: { [key: string]: RegExp };
  prepare?: (value: string) => string;
  validate?: (value: string) => boolean;
};
