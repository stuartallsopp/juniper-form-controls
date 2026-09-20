/**
 * Values from several axes, as one answer.
 *
 * A payroll's classifications are stored as one flat list, but they are
 * *chosen* along axes — an area, a phase, whatever else a tenant has
 * defined. Asking that in one control per axis fragments the answer the
 * same way a separate groups picker and users picker fragmented "who?",
 * and for the same reason: the number of controls is data, not design.
 * A tenant that adds a third axis should not need a third field.
 *
 * So one field, options grouped by axis, and the axis travels on each
 * pick. `applyFacetPick` is the rule that makes the merged list legal.
 */

export type FacetGroup = {
  uuid: string
  name: string | null
}

export type FacetOption = {
  /**
   * Identity for the control, and what a portal sends back. Bureau
   * surfaces work in int ids and carry `id` alongside — the same
   * both-at-once bargain `PublicPickerResource` describes. Where only
   * an id exists, stringify it: the control never interprets this, it
   * only compares it.
   */
  uuid: string
  /** The int id, for surfaces that address records by it. */
  id?: number
  name: string
  group: FacetGroup
}

/**
 * Fold a new selection into the current one.
 *
 * MUI hands back the whole array after a click, so the field cannot
 * tell an add from a remove by length alone — it compares against what
 * it had. A new pick *replaces* whatever was held on the same axis
 * rather than joining it, which is what makes the illegal state
 * unreachable rather than merely discouraged: the control cannot
 * produce "South and North", so nothing downstream has to reject it.
 *
 * Every axis works this way. There is no multi-valued case — see the
 * `every_dimension_holds_one_value` migration for why the flag that
 * allowed one was dropped.
 */
export function applyFacetPick(
  previous: FacetOption[],
  next: FacetOption[],
): FacetOption[] {
  const held = new Set(previous.map((o) => o.uuid))
  const added = next.filter((o) => !held.has(o.uuid))

  if (added.length === 0) {
    // A removal, or a no-op. Nothing to reconcile.
    return next
  }

  // Drop anything the additions displace. Iterating the additions
  // rather than assuming one keeps this correct if a paste or a
  // "select all" ever hands over several at once.
  const displaced = new Set<string>()
  for (const pick of added) {
    for (const existing of previous) {
      if (existing.group.uuid === pick.group.uuid) {
        displaced.add(existing.uuid)
      }
    }
  }

  return next.filter((o) => !displaced.has(o.uuid))
}

/** The uuids to send, sorted so two equivalent selections compare equal. */
export function facetUuids(picked: FacetOption[]): string[] {
  return picked.map((o) => o.uuid).sort()
}
