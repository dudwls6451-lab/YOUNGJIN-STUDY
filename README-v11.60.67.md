# Aviquestionbank v11.60.67 — 164단계 이론학습 심화 및 리더 UX 보강

## 적용 기준
- **필수 선행 버전**: v11.60.66 (K-AIM OCR hotfix)까지 적용된 웹 저장소
- **패치 유형**: 정적 웹 파일 덮어쓰기 / **SQL 실행 없음** / **APK 재설치 필요 없음** (기존 앱이 웹 내용을 로드한다는 전제)
- **포함하지 않는 것**: GitHub 저장소 전체 복사본, 서버 계정정보, Supabase DB 변경, 10월 17일 Work 모드 세션의 저장되지 않은 임시 편집 파일
- 이 배포 ZIP은 변경 파일만 포함한다. 저장소의 다른 `assets/`, `data/` 파일을 삭제하지 말 것.

## 변경 파일 (9개)
```text
index.html
assets/app-v11-60-67.js
assets/style-v11-60-67-theory-reader.css
data/theory-weather-all.json
data/theory-airlaw-all.json
data/theory-atccomm-all.json
data/theory-kaim-course-v3.json
data/theory-flight-theory-v1.json
data/theory-air-navigation-v1.json
```
추가 검증 자료: `validation-v11-60-67-final.json`, `validation-v11-60-67-data.json`.

## 과정별 반영 규모

| 과정 | 단계 | 변경 요약 |
|---|---:|---|
| 항공기상 | 40 | 원리·성립조건, 기상 판단 사례, 혼동 사례를 단계별 작성 |
| 검댕이 항공법규 | 15 | 국제협약/한국 법령의 구분과 법적 판단 예시 보강 |
| 항공교통통신 | 25 | ATC 용어, 항공정보, 관제 상황에서의 판단 보강 |
| K-AIM | 30 | 기존 Aviwiki 장문 내용 및 표·그림 보존, 공식자료·복습 카드 연결 |
| 비행이론 | 23 | 공력·실속·성능·계기·중량중심 사례 및 예제 보강 |
| 공중항법 | 31 | 기초항법 계산, 고도계, 관제·항공차트·인적요소 사례 보강 |
| **합계** | **164** | **134개 단계에 새 심화 본문 3절씩, 전체 164단계 공식 참고자료·복습 카드 제공** |

### 주요 교육적 보강
- 각 기존 절과 표/그림/본문은 **원문을 그대로 유지**하고 심화 섹션만 추가.
- 대표 계산 사례: 60° 선회 시 하중계수와 실속속도 증가, CG 모멘트합과 CG 산출, UTC/KST, 거리-속도-시간, QNH 설정오차 근사.
- 기존 문항 풀이를 암기하기보다 개념의 원인·적용조건·예외를 설명하고, FAA 중심 자료를 한국 국내 규정인 것처럼 표기하지 않도록 구분.
- **참고 자료 링크는 공식 발행기관의 접근점**이다. 모든 문장이 공식 원문과 항목 단위로 교차 검증·인증되었다는 뜻이 아니다.

### 리더 UI
1. 각 단계의 **목차**를 최상단에 자동 생성(누르면 해당 절로 이동).
2. 본문 각 절을 기본 펼침 상태의 **접이식 카드**로 표시하여 길어진 본문을 수동으로 정리 가능.
3. 단계별 공식 레퍼런스 링크와 한국/미국 적용 범위를 표시.
4. 기존 **시험 직전 핵심** 아래에 **복습 카드(개념 → 적용 → 함정)** 추가.
5. 원래의 학습 완료 감지 센티널, 단계 잠금, 성적 기록, 쪽지시험 랜덤 문항 출제, 진도·권한 로직 **변경하지 않음**.

## 배포 방법
1. 현재 GitHub 저장소의 웹 파일을 백업한다.
2. ZIP의 `index.html`, `assets/`, `data/` 경로를 **저장소 루트와 동일한 경로**에 덮어쓴다. 기존 파일을 먼저 삭제하거나 assets 전체를 교체하지 말 것.
3. 브라우저 강력 새로고침 후 항공기상→이론학습, 비행이론→이론학습, K-AIM→이론학습 등 6개 과정에 접근한다.
4. 목차 이동 / 단락 접기 / 복습 카드 / 공식링크 확인 후 첫 단계 읽기 완료 → 단계시험 → 합격 진행을 실제 계정에서 1개 이상 검증한다.
5. 문제가 있으면 이 패치로 추가된 `index.html`·신규 JS/CSS·6개 이론 JSON만 이전 버전으로 복구한다. 다른 패치 기록에 따라 필요할 수 있는 파일은 보존한다.

## 데이터 및 학습 진행 호환성
- 단계 수 40+15+25+30+23+31=164 유지.
- 모든 단계 ID, 순서, 제목, quiz `question_ids`, `quiz_questions`, `pass_percent`, 인쇄/PDF 페이지 정보, 요약 포인트 및 기존 절/그림/표 보존.
- 화면 렌더링 함수 블록과 이론 렌더링 호출부 외에 기존 `app-v11-60-66.js`의 업무 로직은 변경하지 않음.
- CSS는 독립 신규 파일로만 추가됨.
- K-AIM의 기존 단계 ID `KAIM-COURSE-01`~`30`과 `kaimCourse30` 진도 키 유지.

## 공식자료 접근 링크 및 관할 구분
- [국토교통부 대한민국 eAIP 발효판](https://aim.koca.go.kr/eaipPub/Package/history-en-GB.html) — 운항정보는 현행 AIP와 NOTAM 확인.
- [국가법령정보센터 항공안전법](https://www.law.go.kr/LSW/lsInfoP.do?lsId=012524) — 한국 법령 확인. 시행령·시행규칙은 별도 확인.
- [FAA Pilot’s Handbook of Aeronautical Knowledge](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak) — 항공기상/공력/항법 원리 보충.
- [FAA Aviation Weather Handbook](https://www.faa.gov/regulationspolicies/handbooksmanuals/aviation/faa-h-8083-28b-aviation-weather-handbook) — 기상 이론 보충.
- [FAA Aeronautical Information Manual](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/) — **미국 관제·운항 절차의 비교**. 한국 규정과 반드시 구분.

## 검증 범위
**통과**: JSON 6개 파싱, 164단계 수량, 기존 단계/퀴즈/페이지/원문 항목 동일성, `node --check`, JS 변경 범위 비교, 새 JS/CSS 참조 확인, 독립 Chromium 렌더링 164단계, 목차/참고링크/복습/접기 기능, 390px 모바일 수평 넘침 방지.

**실행하지 못한 검사**: 실 GitHub/운영 서버 배포, 실 계정 Supabase 학습진도·쪽지시험 E2E, 원본 PDF·규정 각 페이지에 대한 줄 단위 출처 인증. 따라서 이 패치는 **교육·UI 개선의 기능검증을 통과한 배포 후보**이며 실서비스 통합확인은 배포 전에 필요하다.

## 데이터 원본의 계보
Work 모드에서 변경 중이었으나 출력되지 않은 작업 파일은 직접 가져올 수 없었기 때문에 보관된 다음 기존 패치의 단계 JSON을 복구해 보강했다.
- 항공기상: v11.18 / 항공법규: v11.20 / ATC: v11.34
- K-AIM: v11.58.1 / 비행이론: v11.58.7 / 공중항법: v11.58.8

원본 코드의 나머지 최신 기능은 **v11.60.66 기준 파일**을 유지했다. 이와 달리 다른 작업에서 이미 같은 JSON을 수정했다면, 적용 전 병합·diff 확인이 필요하다.
