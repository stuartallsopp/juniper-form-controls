import { forwardRef } from "react";
import { IMaskInput } from "react-imask";

const MaskedInput = forwardRef<HTMLInputElement, any>(function MaskedInput(
  props,
  ref
) {
  const { onChange, mask, ...other } = props;

  return (
    <IMaskInput
      {...other}
      mask={mask}
      inputRef={ref}
      overwrite
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
    />
  );
});
export default MaskedInput;
