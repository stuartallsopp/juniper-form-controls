/**
 * People and groups, as one answer.
 *
 * The API stores "who?" as two arrays — `user_uuids` and
 * `group_uuids` — because they are two relations. An operator
 * answers it as one list. These are the two functions that sit
 * between those facts, so no caller has to know the answer comes
 * apart.
 */

/**
 * `subject` is not a directory row. It stands for whoever the thing
 * is about — resolved when the message is sent, not when it is
 * written — so it has no uuid to look up and no membership to
 * expand. It is offered alongside people and groups because the
 * question is the same one, and asking it in a second control
 * fragments the answer.
 */
/**
 * `role` is the same idea as `subject`, generalised: something worked
 * out when the message is sent rather than named now — "whoever's
 * turn it is", "whoever raised it". Its uuid is the caller's own key
 * for that role, not a directory row.
 */
/**
 * `employee` is not a kind of `user`. The employer portal authenticates a
 * User and the employee portal an Employee — different models, neither a
 * special case of the other — so somebody on an interview panel may be one,
 * the other, or a person who is both and reachable as either.
 */
export type ActorKind = "user" | "group" | "subject" | "role" | "employee";

/** The stand-in uuid for `subject` — it has no row of its own. */
export const SUBJECT_UUID = "__subject__";

export type Actor = {
  kind: ActorKind;
  uuid: string;
  name: string;
};

/** A thing that can be picked — the shape both lists share. */
export type ActorOption = { uuid: string; name: string };

/**
 * Back into the two arrays the API persists — the last thing that
 * happens before a save, and the only place the kinds are separated.
 */
export const splitActors = (
  actors: Actor[],
): {
  user_uuids: string[];
  group_uuids: string[];
  employee_uuids: string[];
} => ({
  user_uuids: actors.filter((a) => a.kind === "user").map((a) => a.uuid),
  group_uuids: actors.filter((a) => a.kind === "group").map((a) => a.uuid),
  // Its own array rather than folded in with users, because the two are
  // different models on the API side and merging them here would only push
  // the question of which is which onto whoever reads the payload.
  employee_uuids: actors
    .filter((a) => a.kind === "employee")
    .map((a) => a.uuid),
  // `subject` and `role` are deliberately absent: neither has a uuid
  // to store. A caller that offers them reads them off the value.
});

/**
 * …and back out of them, for editing.
 *
 * A uuid with no match in the lists still comes back, named by its
 * uuid: somebody removed from the tenant should show as a row you
 * can see and delete, not vanish from a stage that still points at
 * them.
 */
export const mergeActors = (
  userUuids: string[],
  groupUuids: string[],
  users: ActorOption[],
  groups: ActorOption[],
): Actor[] => [
  ...groupUuids.map((uuid) => ({
    kind: "group" as const,
    uuid,
    name: groups.find((g) => g.uuid === uuid)?.name ?? uuid,
  })),
  ...userUuids.map((uuid) => ({
    kind: "user" as const,
    uuid,
    name: users.find((u) => u.uuid === uuid)?.name ?? uuid,
  })),
];
