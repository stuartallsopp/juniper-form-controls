import type { ReactNode } from "react";
import { resolve_size } from "../helpers/formHelper";

export type FieldRowProps = {
  size?: number;
  className?: string;
  children: ReactNode;
};

/**
 * A horizontal grouping of form fields that wraps onto a new row.
 * Standard `<div className={`${resolve_size(n)} flex flex-wrap`}>`
 * pattern lifted into one component so visual groups don't drift
 * (typos like `flex-wra` were sneaking in) and so adding a row
 * doesn't require remembering the wrapper boilerplate.
 */
const FieldRow: React.FC<FieldRowProps> = ({
  size = 12,
  className = "",
  children,
}) => (
  <div className={`${resolve_size(size)} flex flex-wrap ${className}`.trim()}>
    {children}
  </div>
);

export default FieldRow;
