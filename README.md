# v11.60.29 — Jeppesen Theory Detail Overhaul

Base: v11.60.28

This delta patch updates **theory data only** for all Jeppesen reference-study modules added through v11.60.28, plus 9 new source figure crops for `Radio Data - General · Section 1. Navigation Aids`.

Changes:
- Normalizes theory section schema to the renderer-supported `heading / paragraphs / bullets / table / figure` format.
- Normalizes stage quiz linkage to `question_ids` so existing stage quizzes use the intended question pools.
- Adds source-reviewed stage detail tables derived from the existing Jeppesen question explanations.
- Adds deeper source-only notes to all 12 Navigation Aids stages.
- Adds FIG 1-1-1 through FIG 1-1-9 to the relevant theory stages.
- Adds key source tables: VOR/DME/TACAN SSV, NDB SSV, marker indications, ILS minima, and all 40 ILS localizer/glideslope frequency pairs.
- No question/choice/answer data changed.
- Old figure assets are not re-bundled; only the 9 new Navigation Aids theory figures are included.
