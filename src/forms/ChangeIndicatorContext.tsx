import { createContext, type ReactNode } from "react";

/**
 * Apps that surface a "this field changed" indicator on FormFields supply
 * a render function via this context. The bureau side uses it to show an
 * audit-history popover; the public side leaves it null and the indicator
 * never renders.
 */
export type ChangeIndicatorRenderer = (
  path: string,
  id: string | undefined,
  type: string | undefined,
  /**
   * Optional — invoked by the indicator when its popover opens or
   * closes. Lets the caller (e.g. a read-mode field cell) highlight
   * itself while the audit popup is showing, so the user can see
   * which field the popup refers to.
   */
  onOpenChange?: (open: boolean) => void,
) => ReactNode;

export const ChangeIndicatorContext =
  createContext<ChangeIndicatorRenderer | null>(null);
