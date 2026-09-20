import { createContext, useContext } from "react";
import type { AxiosInstance } from "axios";

/**
 * The form controls that fetch from URLs (autocomplete, multi-autocomplete,
 * dropdown when given a URL) need to talk to an HTTP backend. The hosting
 * app injects its axios client here so the same control works against
 * whichever auth + base URL the app uses.
 */
export const FormApiContext = createContext<AxiosInstance | null>(null);

export function useFormApi(): AxiosInstance {
  const api = useContext(FormApiContext);
  if (!api) {
    throw new Error(
      "FormApiContext is not provided — wrap your tree in <FormApiContext.Provider value={axiosInstance}>.",
    );
  }
  return api;
}
