Aviquestionbank v11.60.89 — 보고 오류 20건 수정 패치

적용 방법
압축을 풀고 index.html, assets, data와 검수내역 파일을 기존 GitHub 저장소 루트에 경로 그대로 덮어쓰세요. ZIP 자체를 업로드하는 방식이 아닙니다. 기존 저장소를 삭제할 필요가 없습니다. v11.60.86~88 저장소 기준이며, 앞선 회독 목표(v87)와 오늘 풀이 수(v88) 파일도 포함하므로 따로 먼저 적용할 필요가 없습니다. 그 이전까지 사용하던 문제 데이터·분류 파일은 기존 저장소에 유지하세요. 추가 SQL·Python 설치·APK 재빌드는 필요 없습니다. Pages 배포 후 앱/웹을 새로 열어 주세요.

범위
신규 누락 그림 3건과 이전에 수정한 17건을 합쳐 보고된 20건 전체에 적용합니다. 그림 파일이 빠진 채 배포된 경우도 보완할 수 있도록 필요한 그림 19개를 함께 담았습니다. PDF 전체 페이지 캡처가 아니라 문제를 푸는 데 필요한 기호·도해만 표시합니다.

주요 보완
- WX-SU12-036: 510/XXX 원문 도해 복원. 운정 FL510, 운저 FL250 미만을 명확히 해설합니다.
- WX-SU12-038: 300/XXX 난류 도해 복원. 실제 그림과 맞지 않던 base 250 해설을 정정합니다.
- AIR-NAV-381/773: 출발 항로의 실선 화살표를 별도 그림으로 표시합니다.
- AIR-NAV-676: 누락 보기 복원과 함께 “5 NM 초과”를 공식 기준인 “5 NM 이상”으로 바로잡습니다.
- WX-SU11-035: 원본 수치 모순을 보완한 기온 27°C/이슬점 21°C 도해 및 정답 C를 유지합니다.
- 나머지 OCR 오류, 네 보기 기호, 고도 숫자 윗줄/밑줄 등은 검수내역 CSV에서 확인할 수 있습니다.

기록 및 호환성
문제 ID, 과목, SU, 학습영역 태그, 기존 풀이 횟수·정답 횟수·오답 횟수와 목표 설정은 유지합니다. 검토 시점보다 이전의 관리자 OCR 저장본이 수정 내용을 되돌리지 않도록 보호하며, 검토 후 관리자 수정은 허용합니다. 이번 보고 시각까지의 해당 문제 오류 제외 표시만 해제하고, 새로운 신고·시각이 없는 신고·다른 문제 신고는 보존합니다. 신고 원문·스냅샷은 기록용으로 유지합니다. 기존 오답 횟수를 바뀐 정답에 맞춰 소급 재채점하지 않습니다.

원본 및 공식 근거
- 항공기상.pdf: PDF p.154 / 인쇄 p.148의 36·38번 도해와 정답표 대조
- 공중항법.pdf: PDF p.127 / 인쇄 p.123의 17번, 범례 및 각 모의고사 원문 대조
- FAA Aviation Weather Handbook: https://www.faa.gov/sites/faa.gov/files/FAA-H-8083-28B.pdf
- FAA Pilot/Controller Glossary APPROACH GATE: https://www.faa.gov/Air_Traffic/publications/atpubs/pcg_html/glossary-a.html
- FAA AIM 제트항로: https://www.faa.gov/air_traffic/publications/aim_html/chap5_section_3.html
- FAA AIM 고도 표기: https://www.faa.gov/air_traffic/publications/aim_html/chap5_section_4.html

검증 결과
20문항 × 모바일/PC × 화이트/다크 = 80개 실제 화면의 보기 수·그림 로드·정답 채점 검증을 통과했습니다. 분류·기록 보존, 과거/이후 관리자 수정, 신고 시각 경계 및 기존 홈 카운터/목표 설정도 검증했습니다.

정답 목록
WX-SU12-038: B
WX-SU12-036: C
AIR-NAV-381: A
AIR-NAV-773: A
AIR-NAV-676: B
AIR-NAV-642: C
AIR-NAV-629: C
AIR-NAV-613: D
AIR-NAV-042: D
WX-SU11-034: B
WX-SU11-030: C
WX-SU11-036: A
WX-SU11-007: D
WX-SU11-017: C
WX-SU11-035: C
WX-MOCK5-018: C
AIM72-C5-S03-Q035: C
AIM72-C5-S04-Q013: D
ATC-COMM-762: B
ATC-COMM-738: D
