# @juniper/form-controls

`FormField` and its twenty-two controls — the form primitives shared by
Juniper's payroll and finance products.

Consumed as raw TypeScript, as a git submodule inside each product's npm
workspace. There is no build step: the host app's bundler compiles these files
as source, which is why every dependency here is a peer dependency pinned at
`*` — the app decides the React and MUI versions, and two copies of MUI in one
bundle is a broken theme and a doubled download.

## Using it

Add it as a submodule under the workspace glob, then re-export from your own
shared barrel so consumers never import this package by name:

```sh
git submodule add https://github.com/stuartallsopp/juniper-form-controls.git packages/form-controls
```

```ts
// packages/shared/src/index.ts
export { FormField, type FormFieldProps } from "@juniper/form-controls";
```

The controls that fetch — autocomplete, multi-autocomplete, dropdown given a
URL — need an HTTP client. The host app injects its own, so the same control
works against whichever auth and base URL that product uses:

```tsx
<FormApiContext.Provider value={axiosInstance}>
  <App />
</FormApiContext.Provider>
```

## Taking an update

Pulled, never pushed. Each product pins a commit and moves when it is ready:

```sh
git -C packages/form-controls fetch --tags
git -C packages/form-controls checkout v1.1.0
git add packages/form-controls && git commit -m "Take form controls v1.1.0"
```

Deliberately not automatic. A change that is right for one product can break
the other, and the pointer bump is where that gets noticed.

## The rules this package lives by

A change that breaks one of these is a change that has to go back.

- **No application imports.** React, MUI, FontAwesome, dayjs, axios types and
  this package's own files. Nothing else. A control that needs data takes a
  prop; a control that needs HTTP takes the client from `FormApiContext`.
- **Everything is a peer dependency, pinned at `*`.**
- **No product vocabulary in a new control.** `ActorFieldControl` is here for
  history; the next one is named for what it does, not for the table it
  happened to serve first.
- **A breaking prop change gets a major tag**, so a consumer can tell a
  five-minute bump from a scheduled one.

## History

This package was extracted from the payroll monorepo, where these files lived
under `packages/shared/src`. The history starts here deliberately: the original
commits were payroll feature work that touched these paths incidentally, and
their messages describe that product rather than this code.
