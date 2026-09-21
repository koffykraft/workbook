# KoffyKraft Engine - Core Model v0.1

## Purpose
One shared engine for KoffyKraft tools. Apps are touch points on the same underlying journey, not isolated databases.

## Invariants
1. A user owns data and may explicitly share selected templates or records.
2. Reference data, reusable templates, actual runs, observations/results, and temporary working state are distinct.
3. Resetting working state never deletes saved records, templates, or history.
4. A template is an intended method. A run is what actually happened.
5. Runs retain the exact template version used; later template edits never rewrite history.
6. KoffyKraft defaults are immutable originals. Users may use or duplicate them into editable personal templates.
7. Every event may carry time, actor, input/material, quantity/unit, measurement, target/range, observation, attachment reference, and provenance.
8. All major entities are searchable/filterable and may be compared where their measurements are compatible.
9. Authentication, ownership, quota, sharing, search/filter, versioning, export and deletion are engine services shared by every app.
10. Anonymous/local operation remains possible where an app supports it.

## Coffee journey
Farm / Estate -> Harvest / Lot -> Process -> Green Coffee -> Roast -> Rest -> Brew -> Result

Each stage is optional and independently usable, but relationships are retained when known.

## Core entities
User; Farm/Estate; Coffee/Variety; Harvest/Lot; Process Template; Process Template Version; Process Run; Process Step; Observation/Measurement; Green Coffee; Roast Profile; Roast Run; Rest Schedule/Run; Brew Recipe; Brew Run; Equipment/Machine; Tag; Share; Attachment reference.

## Process engine
A Process Template is an ordered or branching map of configurable steps. It can represent conventional processing, preferments, koji, fermentation, staged additions, drying, conditioning/resting, roasting, brewing, or future workflows.

A step may define only what is needed: action/instruction; input/material and quantity; duration/wait; temperature; pH; moisture; salinity/concentration; target/range; observation prompt; decision/branch; next step.

A Process Run instantiates a template version and records actual events without changing the template.

## Template scopes
KoffyKraft Defaults are curated read-only starting templates.
My Processes are user-created templates or editable copies.
Shared Processes are explicitly shared templates. Recipient use creates a run or copy and never mutates the author's master.
Visibility is private by default. Historical run provenance remains.

## Working state
Quick/on-the-fly work uses temporary state. Quick Roast clears the active job while preserving stable machine/roastery preferences and all saved database records. A temporary run may later be saved/promoted without automatically creating reusable reference data.

## Search/filter service
Common dimensions include user, estate/farm, coffee/variety, lot, process/process type, date/range, roast type/target, machine, operator, tags and app-specific measurements. Filters are composable. Apps expose only relevant filters.

## First clients
1. Roast: Pre-roast -> Roast Run -> Result/Graph
2. Roastbook: saved coffees, roasts, filters, compare
3. Process: process maps, field runs, drying/rest schedules
4. Brew: recipe/run linked back to roast and coffee

## Cloud persistence
D1 should implement this model without embedding UI assumptions. Large binary files are not stored in D1; records hold attachment references. Quotas are enforced server-side per user. Local browser storage remains a working/offline layer, not the authoritative cloud ownership boundary.
