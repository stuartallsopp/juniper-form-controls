import { Parser } from 'expr-eval';
import type { DataObject } from '../types/DataObject';

export function set_value<T extends object>(obj: T, path: string, value: any): void {
    const keys = path.split('.'); // Split the path into keys
    let current: any = obj;

    // Traverse the object to the second last key
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        // If the key doesn't exist, create an empty object
        if (!(key in current)) {
            current[key] = {};
        }
        current = current[key];
    }

    // Set the value at the final key
    current[keys[keys.length - 1]] = value;
}

export function check_object<T>(t: any, k: string): T | undefined {
  if (t != undefined) {
    return t[k] as T;
  }
  return undefined;
}

export function get_value(expr:string,source:any):any
{
    if (source==null||source==undefined){return null;}
    const parser=new Parser();
    parser.functions.isNull = function (value:any) {
        return value === null;
      };
    parser.functions.isNotNull=function(value:any){
        return value!==null;
    };
    parser.functions.arrayLength=function(value:any){
        if (Array.isArray(value)==false){return 0;}
        return value.length;
    }
    parser.functions.emptyArray=function(){
        return [];
    }
    try
    {
        const ev=parser.parse(expr);
        return ev.evaluate(source);
    }catch(e)
    {
        console.error(expr,source,e);
        return undefined;
    } 
}

/**
 * Type-narrow an `unknown` value to `T`, optionally falling
 * back to a default when the source is null / undefined.
 *
 * Idiomatic use: walk the record via optional chaining, hand
 * the result to `resolve_value` with the type you expect. The
 * call site then satisfies a typed `FormField` value prop
 * without scattering `as number` / `as string` casts.
 *
 *   resolve_value<number>(record?.salary, 0) → number
 *   resolve_value<number>(record?.salary)    → number | undefined
 *
 * The cast is unchecked at runtime — `T` is the *expectation*,
 * not a guard. Pass the fallback when you want to absorb the
 * null case at this site; omit it when the consumer is happy
 * to handle undefined.
 */
export function resolve_value<T>(source: unknown): T | undefined;
export function resolve_value<T>(source: unknown, fallback: T): T;
export function resolve_value<T>(source: unknown, fallback?: T): T | undefined {
    if (source === null || source === undefined) {
        return fallback;
    }
    return source as T;
}

export function hasAnyValue(obj: DataObject|undefined): boolean {
    if (obj==undefined){return false;}
  return Object.values(obj).some(
    v => v !== null && v !== undefined && v !== ""
  );
}