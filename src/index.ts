// The public surface. Named to match what `@payroll/shared` already exports,
// so a product can re-export straight from here and no consumer file changes.

// The control itself, and the wrapper that gives it its label and errors.
export { default as FormField } from "./forms/FormField";
export { default as FormFieldWrapper } from "./forms/FormFieldWrapper";
export { default as FieldRow } from "./forms/FieldRow";
export type { FieldRowProps } from "./forms/FieldRow";
export type {
  FormFieldProps,
  MaskDefinition,
  AccessLevelStop,
  CatalogueOption,
  CatalogueRelevance,
} from "./forms/FormFieldProps";

// The axios client the fetching controls talk through. A host app provides
// its own, which is what lets one control serve two products.
export { FormApiContext, useFormApi } from "./forms/FormApiContext";
export {
  ChangeIndicatorContext,
  type ChangeIndicatorRenderer,
} from "./forms/ChangeIndicatorContext";

// Controls reached for directly rather than through FormField's `type`.
export { default as AutocompleteFieldControl } from "./forms/controls/AutoCompleteFieldControl";
export { default as ComparatorFields } from "./forms/controls/ComparatorFields";
export type {
  ComparatorOperator,
  ComparatorValue,
} from "./forms/controls/ComparatorFields";
export {
  default as ColourFieldControl,
  colourHex,
} from "./forms/controls/ColourFieldControl";
export { default as WidthFieldControl } from "./forms/controls/WidthFieldControl";

// Fields that are their own thing rather than a FormField `type`.
export { default as PostcodeField } from "./forms/PostcodeField";
export type { PostcodeCheck } from "./forms/PostcodeField";
export { default as LogoField, LOGO_ACCEPT } from "./forms/LogoField";
export type { LogoFieldChange } from "./forms/LogoField";
export { default as FormDisplay } from "./forms/FormDisplay";

export {
  useEnumerations,
  clearEnumerationsCache,
} from "./forms/useEnumerations";
export type { EnumerationMap, EnumerationMaps } from "./forms/useEnumerations";

// Helpers the controls are built on, exported because consumers lay out forms
// with the same vocabulary.
export { resolve_size, resolve_span } from "./helpers/formHelper";
export { splitActors, mergeActors, SUBJECT_UUID } from "./helpers/actorHelper";
export type { Actor, ActorKind, ActorOption } from "./helpers/actorHelper";
export { applyFacetPick, facetUuids } from "./helpers/facetHelper";
export type { FacetGroup, FacetOption } from "./helpers/facetHelper";
export { resolveUrl } from "./helpers/urlHelper";
export { useNoAutofill } from "./helpers/useNoAutofill";
export { fmtDate } from "./helpers/fmtDate";
export {
  set_value,
  get_value,
  check_object,
  hasAnyValue,
  resolve_value,
} from "./helpers/valueHelper";
export type { DataObject } from "./types/DataObject";

export { default as Icon } from "./display/Icon";
export type { IconName, IconProps } from "./display/Icon";
export { format_number } from "./display/format_number";
export type { FormatNumberOptions } from "./display/format_number";
