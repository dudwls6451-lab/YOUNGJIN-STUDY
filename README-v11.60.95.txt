Aviquestionbank v11.60.95 — 참고서 · 항공약어 학습지

적용 방법
v11.60.94가 적용된 기존 사이트 루트에 이 ZIP의 파일을 같은 경로로 덮어씁니다.
배포 후 새로고침합니다. 이전 화면이 남으면 강력 새로고침합니다.
기존 참고서 학습 모듈과 v11.60.94까지의 사이트 파일이 필요합니다.
이 ZIP은 변경 파일 5개만 포함하며 전체 사이트가 아닙니다.
DB/SQL 변경이나 APK 재빌드가 필요하지 않습니다.

이용 경로
참고서 → 항공약어 학습지
또는 학습 모드 선택 → 참고서 학습 → 항공약어 학습지

학습 구성
200개 학습 항목, 400개 4지선다 문항입니다.
항목마다 아래 두 유형을 한 문항씩 제공합니다.
1. 약어·기호 → 영문 명칭 또는 의미 선택
2. 한국어 뜻 → 해당 약어·기호 선택

분야별 학습 항목 / 문항
속도·성능: 25 / 50
항법·항법장비: 25 / 50
계기비행·접근·고도: 33 / 66
공항·활주로·등화: 25 / 50
관제·통신·운항시각: 27 / 54
기상·METAR·TAF: 36 / 72
항공기·운항·안전: 29 / 58
합계: 200 / 400
같은 철자라도 뜻이 다른 GS, RA, VA 등은 분야 문맥으로 구분한 별도 학습 항목입니다.
QNH·QFE·QNE는 Q 부호이므로 영문 머리글자를 임의로 풀지 않고 의미를 묻습니다.
기관별 영문 표기의 차이나 동의 표현을 서로 오답 보기로 섞지 않았습니다.

기능
- 분야별 선택, 두 유형 혼합 또는 한 유형만 선택
- 학습: 문제마다 즉시 채점하고 영문 명칭·한국어 뜻·학습 포인트 확인
- 시험: 마지막에 일괄 채점, 기존 결과 화면과 문제 복습 이용
- 전체 / 미풀이 / 누적 오답 / 즐겨찾기 범위 선택
- 10·20·50문항 또는 선택 범위 전체 출제
- 한 번의 풀이에서는 같은 학습 항목을 한 번만 출제
  전체 400문항은 두 유형의 합계이며, 혼합 전체 풀이는 200항목당 하나씩 뽑습니다.
  두 유형을 모두 풀려면 유형별로 각각 전체 풀이를 실행하면 됩니다.
- 약어 정리표: 약어·영문·한국어 검색, 뜻과 학습 포인트 확인
  정리표 검색은 표를 검색하는 기능이며 출제 범위는 위 분야·복습 설정을 따릅니다.
- 풀이 중 나가기 확인 및 결과에서 학습지로 돌아오기
- 기존 문제은행의 정오답·즐겨찾기·오류 신고·학습 기록 저장 기능 사용
  새 항목은 AV-ABBR- 접두사의 고정 문항 ID로 구분합니다.

기존 기능 보존
기존 문제·정답·태그·학습 기록과 v11.60.94의 오류 수정은 변경하지 않습니다.
기존 참고서 카드도 유지합니다. index.html에는 새 CSS/JS 참조 두 줄만 추가했습니다.
주 앱 파일은 v11.60.94를 그대로 사용합니다.

공식 참고자료
FAA AIM Appendix 3: https://www.faa.gov/air_traffic/publications/atpubs/aim_html/appendix_3.html
EASA abbreviations: https://www.easa.europa.eu/en/abbreviations
14 CFR 1.2: https://www.govinfo.gov/content/pkg/CFR-2025-title14-vol1/html/CFR-2025-title14-vol1.htm
FAA weather codes: https://www.faa.gov/air_traffic/publications/atpubs/aip_html/chap7_section_1.html
FAA Q glossary: https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-q.html
EUROCONTROL timing: https://www.eurocontrol.int/sites/default/files/2023-07/chmi-atfcm-reference-guide-edition-9.pdf
FAA NOTAM: https://www.faa.gov/about/initiatives/notam/what_is_a_notam
각 문항 해설과 학습지의 출처 안내에서도 해당 자료 링크를 확인할 수 있습니다.

포함 파일 (5개)
index.html
assets/aviation-abbreviations-v11-60-95.js
assets/aviation-abbreviations-v11-60-95.css
data/questions-aviation-abbreviations-v1.json
README-v11.60.95.txt

검증
정적 검증 13개 항목 통과: 200항목·400문항, 유형별 대응, 보기 중복 방지,
정답 일치, A~D 정답키 각 100개, 출처·해설, 구문과 index 변경 범위 등.
jsdom 기능 검증 26개 항목 통과: 실제 참고서 메뉴 연결, 검색·범위 필터,
혼합 중복 방지, 학습·시험 채점, 오답·즐겨찾기 기록, 나가기 확인,
데이터 로드 실패·재시도, 기존 오류 수정·학습 기록 유지 등.
실제 브라우저 화면의 시각 검증은 실행 환경 제약으로 수행하지 않았습니다.
