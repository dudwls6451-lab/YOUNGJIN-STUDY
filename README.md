# v11.60.32 - CPL Gleim 2024 delta patch

Base: v11.60.31. Apply this archive over an installation that already has v11.60.31.

- Adds CPL Gleim to 각 교재 학습 > 문제 풀이.
- Adds 859 validated 3-choice questions with answers and explanations.
- Uses lazy loading; the CPL JSON is fetched only when CPL Gleim is selected.
- Existing question-bank files and database schema are unchanged.
- 31 malformed extraction rows were excluded to prevent broken questions.
- Figure-dependent rows keep source-page metadata; source figures are not bundled.
