export function resolve_size(i: number): string {
  switch (i) {
    case 1:
      return "w-full md:w-1/2 lg:w-1/12";
    case 2:
      return "w-full md:w-1/2 lg:w-1/6";
    case 3:
      return "w-full md:w-1/2 lg:w-1/4";
    case 4:
      return "w-full md:w-1/2 lg:w-1/3";
    case 5:
      return "w-full md:w-1/2 lg:w-5/12";
    case 6:
      return "w-full md:w-1/2 lg:w-1/2";
    case 7:
      return "w-full lg:w-7/12";
    case 8:
      return "w-full lg:w-2/3";
    case 9:
      return "w-full lg:w-3/4";
    case 10:
      return "w-full lg:w-5/6";
    case 11:
      return "w-full lg:w-11/12";
    default:
      return "w-full";
  }
}
/**
 * The same twelve as `resolve_size`, expressed as a grid span rather
 * than a width.
 *
 * `resolve_size` sizes a cell inside a flex-wrap row; this sizes a
 * child inside a twelve-column grid — what `help_placement="beside"`
 * builds inside a field so the control and its guidance divide the
 * row on the same twelfths as every other field on the panel.
 *
 * Spans apply from `lg` up. Below that the grid is a single column
 * and the guidance sits under the control, which is the only thing
 * that fits on a narrow screen.
 *
 * The classes are written out rather than interpolated because
 * Tailwind reads the source for them and never sees a built string.
 */
export function resolve_span(i: number): string {
  switch (i) {
    case 1:
      return "lg:col-span-1";
    case 2:
      return "lg:col-span-2";
    case 3:
      return "lg:col-span-3";
    case 4:
      return "lg:col-span-4";
    case 5:
      return "lg:col-span-5";
    case 6:
      return "lg:col-span-6";
    case 7:
      return "lg:col-span-7";
    case 8:
      return "lg:col-span-8";
    case 9:
      return "lg:col-span-9";
    case 10:
      return "lg:col-span-10";
    case 11:
      return "lg:col-span-11";
    default:
      return "lg:col-span-12";
  }
}
