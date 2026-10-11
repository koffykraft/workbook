# KoffyKraft

A free, offline-first coffee log from farm to cup: origin and harvest records, roast timer and analysis, Artisan export, brewing, cupping and tasting tests.

Live app: https://roast.koffykraft.coffee

## Licence

Copyright (C) 2026 T M Thomas, Thumpassery Estate, Punalur 691333, Kerala, India.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License, version 3, as published by the Free Software Foundation. See [LICENSE](LICENSE).

If you run a modified version of this app for other people, including over a network, you must make your complete source code available to them under the same licence.

### Additional terms (AGPL section 7)

These apply on top of the AGPL. The full wording is in [NOTICE](NOTICE).

- **Credit stays visible.** Any copy or changed version that people use must show "Made with KoffyKraft" or "Based on KoffyKraft" in its interface, linked to roast.koffykraft.coffee or this repository, and keep the copyright line.
- **Changed versions say so.** Mark them as changed, with the date, and do not present them as the original KoffyKraft.
- **Names and logos are not licensed.** "KoffyKraft" is a registered trade mark of T M Thomas in India, and is also used by him as a trade mark for this app. Use it only for the credit above and to state truthfully where the work comes from.

### Guide text: CC BY-SA 4.0

The written guides (brew guide, crop care, journey of the bean, water, varieties, and the tips and ranges in Origin and Cup) are also under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Reuse them freely with credit: "From KoffyKraft (roast.koffykraft.coffee), © T M Thomas, CC BY-SA 4.0". Say if you changed them, and share your version under the same licence.

## Commercial licence

To use this code in a closed or paid product without the AGPL obligations, you need a separate commercial licence from the copyright holder. Contact info@koffykraft.com.

The KoffyKraft name and logo are not covered by the code licence and may not be used for other products.

## Checks before every deploy

`npm test` runs about 220 automatic checks in roughly 15 seconds:

- **static**: every script and page parses, links point to real files, the offline file list is complete, licence notices are present.
- **api**: the server code runs against a fresh local copy of the database with all migrations, covering sign-in rules, feedback (and its email), shared spaces permissions, public links and profiles.
- **pages**: every main page opens on a phone-sized screen without errors or sideways scrolling, and the key journeys work: share a brew and a green lot, view a space, publish a profile.

`npm run deploy` runs the checks and only deploys if all pass. `npm run test:fast` skips the browser checks. Needs Node 22.5 or newer; the browser checks need Playwright (`npm i -D playwright && npx playwright install chromium`).
