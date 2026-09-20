import type { DataObject } from "../types/DataObject";
import { get_value } from "./valueHelper";

// encodeURIComponent escapes commas to %2C, which is correct
// for path segments but unnecessary in a query string —
// commas are sub-delims per RFC 3986 and pass through HTTP
// without ambiguity. Leaving them literal keeps comma-joined
// id lists (?payroll_id=5,7,9) readable in the URL bar and
// matches what the page splits on. Other reserved characters
// stay encoded.
function encodePart(value: string): string {
  return encodeURIComponent(value).replace(/%2C/g, ",");
}

export function resolveUrl(urlTemplate: string, source?: DataObject,params?:{[key:string]:string},referrer?:string): string {
  if (source==undefined){return urlTemplate;}
  return urlTemplate.replace(/\{(\w+)\}/g, (_, key) => {
    const get_v=(params&&params[key])?get_value(params[key],source):null;
    if (get_v){
      return encodePart(get_v);
    }
    if (key=='referrer'&&referrer){

      return encodePart(referrer as string);
    }
    if (source[key] === undefined || source[key] === null) {
      console.warn(`Property "${key}" not found on source object`);
      return `{${key}}`; // leave as-is if not found
    }
    return encodePart(source[key] as string);
  });
}