// fields/ActorFieldControl.tsx
import React from "react";
import { Autocomplete, Chip, Stack, TextField, debounce } from "@mui/material";
import Icon from "../../display/Icon";
import {
  SUBJECT_UUID,
  type Actor,
  type ActorKind,
} from "../../helpers/actorHelper";
import { useNoAutofill } from "../../helpers/useNoAutofill";
import { useFormApi } from "../FormApiContext";

/**
 * "Who?" — people and groups in one field.
 *
 * Every surface that asks this asks it twice: a groups picker, then
 * a users picker, because that is how the answer is *stored*
 * (`group_uuids` and `user_uuids`). Nobody thinks that way — they
 * think "Jean, or anyone in Payroll", which is one question with one
 * answer — so the field takes both, and `splitActors` puts them back
 * into two arrays on the way out.
 *
 * The icon carries the kind. That is what makes one field work: a
 * row says what it is by looking at it, rather than by which box it
 * was typed into.
 */
const iconFor = (kind: ActorKind) =>
  kind === "group"
    ? "Groups"
    : kind === "subject"
      ? "PersonPin"
      : kind === "role"
        ? "AccountTree"
        : kind === "employee"
          ? // Distinct from a portal user on purpose: the two are different
            // models, and a panel of "three people" reads very differently
            // when you can see which of them can actually log in.
            "Badge"
          : "Person";

const ActorFieldControl = React.memo((props: any) => {
  const noFill = useNoAutofill(props.autoComplete);
  const api = useFormApi();

  /**
   * Server-side search, when the caller gives a `url`.
   *
   * A preloaded directory stops being a picker somewhere around a few hundred
   * people — it becomes a scroll, and it ships the whole staff list to the
   * browser to do it. With a url the control asks the server per keystroke
   * instead, and the passed-in lists below become the fallback for the
   * surfaces that have always handed them in.
   */
  const [fetched, setFetched] = React.useState<Actor[]>([]);
  const [input, setInput] = React.useState("");

  const search = React.useCallback(
    (q: string) => {
      if (!props.url) return;
      const sep = props.url.includes("?") ? "&" : "?";
      api
        .get(`${props.url}${sep}q=${encodeURIComponent(q)}`)
        .then((r: any) => setFetched(r.data?.data ?? []))
        .catch(() => setFetched([]));
    },
    [props.url, api],
  );

  const debounced = React.useMemo(() => debounce(search, 300), [search]);

  // Primed on open so the field offers something before anybody types —
  // an empty dropdown reads as "nothing to pick", not "start typing".
  React.useEffect(() => {
    if (props.url) search("");
  }, [props.url, search]);

  React.useEffect(() => {
    if (props.url && input) debounced(input);
  }, [input, props.url, debounced]);

  const users: { uuid: string; name: string }[] = props.users ?? [];
  const groups: { uuid: string; name: string }[] = props.groups ?? [];
  const employees: { uuid: string; name: string }[] = props.employees ?? [];
  // Roles the caller wants offered beside the directory — the same
  // bargain as `subjectLabel`, for surfaces with more than one.
  const roles: { uuid: string; name: string }[] = props.roles ?? [];

  // The subject first when offered — "the person this is about" is
  // the commonest answer where it applies. Then groups, because a
  // team is the usual answer, and a named person is the exception
  // you reach for when no team fits.
  const options: Actor[] = [
    ...(props.subjectLabel
      ? [
          {
            kind: "subject" as const,
            uuid: SUBJECT_UUID,
            name: props.subjectLabel as string,
          },
        ]
      : []),
    ...roles.map((r) => ({
      kind: "role" as const,
      uuid: r.uuid,
      name: r.name,
    })),
    ...groups.map((g) => ({
      kind: "group" as const,
      uuid: g.uuid,
      name: g.name,
    })),
    ...users.map((u) => ({
      kind: "user" as const,
      uuid: u.uuid,
      name: u.name,
    })),
    ...employees.map((e) => ({
      kind: "employee" as const,
      uuid: e.uuid,
      name: e.name,
    })),
    // What the server last returned. Concatenated rather than replacing, so a
    // caller can offer a subject or a role beside a searched directory.
    ...fetched,
    // Already-picked rows, so a selection whose option has since scrolled out
    // of the search results does not read as unknown to the control and get
    // dropped on the next change.
    ...((props.value ?? []) as Actor[]),
  ].filter(
    (o, i, all) =>
      all.findIndex((x) => x.uuid === o.uuid && x.kind === o.kind) === i,
  );

  return (
    <Autocomplete
      fullWidth
      selectOnFocus
      autoHighlight
      multiple
      // Default height, like every other control. `compact` is the
      // opt-in the autocomplete family already uses for the few
      // places that want a shorter field.
      size={props.compact ? "small" : undefined}
      disabled={props.disabled}
      options={options}
      value={props.value ?? []}
      // Kind is part of identity: a person and a group could share a
      // uuid space, and comparing on uuid alone would let one
      // deselect the other.
      isOptionEqualToValue={(a: Actor, b: Actor) =>
        a.uuid === b.uuid && a.kind === b.kind
      }
      getOptionLabel={(o: Actor) => o.name}
      groupBy={(o: Actor) =>
        o.kind === "group"
          ? "Groups"
          : o.kind === "subject" || o.kind === "role"
            ? ""
            : o.kind === "employee"
              ? "Staff"
              : "Portal users"
      }
      // The server has already narrowed; filtering again would hide rows it
      // matched on something not in the label — an employee's code, say.
      filterOptions={props.url ? (x) => x : undefined}
      onInputChange={(_, v) => setInput(v)}
      onChange={(_, v) => props.handleChange(v)}
      renderOption={(optionProps, option: Actor) => {
        const { key, ...rest } =
          optionProps as React.HTMLAttributes<HTMLLIElement> & {
            key: string;
          };
        return (
          <li key={key} {...rest}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon
                name={iconFor(option.kind)}
                fontSize="small"
                color="action"
              />
              <span>{option.name}</span>
            </Stack>
          </li>
        );
      }}
      renderTags={(picked: Actor[], getTagProps) =>
        picked.map((option, index) => {
          const { key, ...rest } = getTagProps({ index });
          // A caller can say something extra about a pick — a panel marks
          // its chair. Rendered on the chip that is already there rather than
          // in a second row of the same names below it.
          const extra = props.decorateChip?.(option) ?? {};

          return (
            <Chip
              {...rest}
              key={key}
              variant="outlined"
              icon={<Icon name={iconFor(option.kind)} fontSize="small" />}
              label={option.name}
              {...extra}
              onClick={
                props.onChipClick ? () => props.onChipClick(option) : undefined
              }
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          error={props.has_errors}
          // Chrome / Edge ignore `autocomplete="off"` on
          // name-shaped fields and apply contact-card autofill
          // anyway — and this field is full of people's names, so
          // it is the worst case: the browser's menu lands directly
          // over the options you are trying to pick.
          autoComplete={props.autoComplete || "off"}
          slotProps={{ htmlInput: { ...params.inputProps, ...noFill } }}
        />
      )}
    />
  );
});

export default ActorFieldControl;
