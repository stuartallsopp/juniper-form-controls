// FormField.tsx
import React from "react";

import TextFieldControl from "./controls/TextFieldControl";
import PasswordFieldControl from "./controls/PasswordFieldControl";
import TokenFieldControl from "./controls/TokenFieldControl";
import NumberFieldControl from "./controls/NumberFieldControl";
import BooleanFieldControl from "./controls/BooleanFieldControl";
import DropdownFieldControl from "./controls/DropdownFieldControl";
import SegmentedFieldControl from "./controls/SegmentedFieldControl";
import AutocompleteFieldControl from "./controls/AutoCompleteFieldControl";
import AutoCompleteScalarFieldControl from "./controls/AutoCompleteScalarFieldControl";
import DateFieldControl from "./controls/DateFieldControl";
import DateTimeFieldControl from "./controls/DateTimeFieldControl";
import YearFieldControl from "./controls/YearFieldControl";
import FieldWrapper from "./FormFieldWrapper";
import type { FormFieldProps } from "./FormFieldProps";
import MultiAutocompleteFieldControl from "./controls/MultiAutoCompleteFieldControl";
import MultiTextAutoCompleteControl from "./controls/MultiTextAutoCompleteControl";
import JsonEditorFieldControl from "./controls/JsonEditorFieldControl";
import ColourFieldControl from "./controls/ColourFieldControl";
import WidthFieldControl from "./controls/WidthFieldControl";
import AccessLevelFieldControl from "./controls/AccessLevelFieldControl";
import ActorFieldControl from "./controls/ActorFieldControl";
import FacetFieldControl from "./controls/FacetFieldControl";
import CatalogueFieldControl from "./controls/CatalogueFieldControl";

const FormField = (props: FormFieldProps) => {
  let Field = null;

  switch (props.type) {
    case "text":
      Field = <TextFieldControl {...props} />;
      break;
    case "password":
      Field = <PasswordFieldControl {...props} />;
      break;
    case "token":
      Field = <TokenFieldControl {...props} />;
      break;
    case "number":
      Field = <NumberFieldControl {...props} />;
      break;
    case "boolean":
      Field = <BooleanFieldControl {...props} />;
      break;
    case "dropdown":
      Field = <DropdownFieldControl {...props} />;
      break;
    case "segmented":
      Field = <SegmentedFieldControl {...props} />;
      break;
    case "catalogue":
      Field = <CatalogueFieldControl {...props} />;
      break;
    case "autocomplete":
      Field = <AutocompleteFieldControl {...props} />;
      break;
    case "autocomplete_scalar":
      Field = <AutoCompleteScalarFieldControl {...props} />;
      break;
    case "multitext":
      Field = <MultiTextAutoCompleteControl {...props} />;
      break;
    case "date":
      Field = <DateFieldControl {...props} />;
      break;
    case "year":
      Field = <YearFieldControl {...props} />;
      break;
    case "datetime":
      Field = <DateTimeFieldControl {...props} />;
      break;
    case "actors":
      Field = <ActorFieldControl {...props} />;
      break;
    case "facets":
      Field = <FacetFieldControl {...props} />;
      break;
    case "multi":
      Field = (
        <MultiAutocompleteFieldControl
          {...props}
        ></MultiAutocompleteFieldControl>
      );
      break;
    case "json":
      Field = <JsonEditorFieldControl {...props} />;
      break;
    case "colour":
      Field = <ColourFieldControl {...props} />;
      break;
    case "width":
      Field = <WidthFieldControl {...props} />;
      break;
    case "access_level":
      Field = <AccessLevelFieldControl {...props} />;
      break;
    default:
      return null;
  }

  return (
    <FieldWrapper
      // `!` on both: the wrapper hardcodes `min-h-17` and the cell's own
      // padding, so an override has to win the cascade rather than hope
      // to come later in it.
      className={[
        props.type == "boolean" && props.slim == true ? "max-h-14!" : "",
        props.type == "boolean" && props.vSlim == true ? "min-h-0!" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      type={props.type}
      size={props.size}
      errors={props.errors}
      changes={props.changes}
      highlight={props.highlight}
      help_text={props.help_text}
      help_placement={props.help_placement}
      // Only so the wrapper knows whether there is room under the
      // control for the guidance to float in. See FieldWrapper.
      rows={"rows" in props ? props.rows : undefined}
    >
      {Field}
    </FieldWrapper>
  );
};

export default React.memo(FormField);
