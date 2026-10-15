# Version 1 — saved flow

Frozen from Git tag `flow-v1` (commit `1fc10df`), with only namespaced imports, an application stylesheet entry and the Version 1 / Version 2 selector added for side-by-side access.

This copy contains its own screens, widgets, question engine, data, scenarios, stores and styles. Future interaction changes belong in the editable Version 2 source under `/src`, not here.

`manifest.json` records every frozen source file. Run `npm run test:versions` to check its integrity and regression contracts. Shared vendor packages and static public fonts/brand assets remain common to the repository.

Open `/mobile?flow=v1`. Switching versions reloads the document and starts the selected scenario fresh; live app data is not copied across versions.
