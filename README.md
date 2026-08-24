# GitHub JSON 항공 문제은행 v2

GitHub Pages에서 바로 사용할 수 있는 정적 문제은행입니다.

## 포함 기능

- JSON 문제은행 로드
- 과목 / Study Unit / 소단원 필터
- 랜덤 출제
- 보기 순서 랜덤화
- 학습모드: 선택 즉시 채점 + 해설
- 시험모드: 마지막에 일괄 채점
- LocalStorage 기반 누적 학습기록
- 문제별 풀이 횟수 / 정답 / 오답 / 정답률
- 오답 문제만 재출제
- 즐겨찾기
- 아직 안 푼 문제만 출제
- 학습 통계 화면
- Figure 이미지 표시
- admin.html에서 JSON 병합
- 문제 ID 중복 검사/교체

## 폴더 구조

```text
github-question-bank-v2/
├─ index.html
├─ admin.html
├─ assets/
│  ├─ app.js
│  ├─ admin.js
│  └─ style.css
├─ data/
│  └─ questions.json
└─ figures/
   └─ FIGURE_229.png
```

## GitHub Pages 배포

1. GitHub에서 새 Repository 생성
2. ZIP을 풀고 내부 파일들을 저장소 루트에 업로드
3. Settings → Pages
4. Build and deployment → Deploy from a branch
5. Branch `main`, Folder `/(root)` 선택
6. 저장

## 문제 추가

`admin.html`에서 JSON을 업로드 → 병합 → `questions.json` 다운로드 후
GitHub의 `data/questions.json`을 교체하고 Commit 합니다.

## Figure 이미지

문제에 직접 경로를 지정:

```json
"image": "figures/FIGURE_229.png"
```

또는:

```json
"requires_figure": true,
"figure_refs": ["229"]
```

`figure_refs`만 있으면 앱이 자동으로 다음 경로를 찾습니다.

```text
figures/FIGURE_229.png
```

따라서 PDF에서 Figure 이미지를 추출해 `figures` 폴더에 같은 이름으로 넣으면 됩니다.

## 학습기록

학습기록은 브라우저 LocalStorage에 저장됩니다.

저장 항목:
- attempts
- correct
- incorrect
- lastResult
- lastAnswer
- lastAttempted
- favorite

브라우저/기기가 바뀌면 기록은 공유되지 않습니다.

## 권장 JSON 구조

```json
{
  "questions": [
    {
      "id": "GLEIM-ATP-SU5-001",
      "subject": "Aerodynamics and Airplanes",
      "study_unit": 5,
      "subunit": {
        "code": "5.1",
        "title": "Flight Controls"
      },
      "question": "문제 내용",
      "choices": [
        {"id": "A", "text": "보기 A"},
        {"id": "B", "text": "보기 B"},
        {"id": "C", "text": "보기 C"}
      ],
      "answer": "B",
      "explanation": "해설",
      "reference": "FAA-H-8083",
      "requires_figure": false,
      "figure_refs": []
    }
  ]
}
```

## 로컬 테스트

프로젝트 폴더에서:

```bash
python -m http.server 8000
```

브라우저:

```text
http://localhost:8000
```

## 과목 구조

메인 과목은 아래 6개로 고정되어 있습니다.

- ATP Gleim
- 항공기상
- 공중항법
- 비행이론
- 항공법규
- 항공교통통신정보업무

각 과목 아래에 `study_unit` 값을 추가하면 Study Unit 필터에 자동으로 나타납니다.

예시:

```json
{
  "id": "MET-SU1-001",
  "subject": "항공기상",
  "study_unit": 1,
  "subunit": {
    "code": "1.1",
    "title": "대기의 구조"
  }
}
```

출제 개수는 10 / 20 / 30 / 50 / 100 / 선택 범위 전체 / 직접 입력을 지원합니다.

## v4 변경사항

- ATP Gleim Study Unit 5 전체 276문제 해설을 한국어로 번역
- 문제/보기/정답/참고문헌은 기존 원문 유지
- `explanation_language: "ko"` 필드 추가
- 메인 과목 6개 고정 구조 및 Study Unit 확장 구조 유지
- 출제 개수 `선택 범위 전체` 기능 유지



## 소단원 복수선택

v5부터 소단원은 체크박스로 복수 선택할 수 있습니다.

- 아무 소단원도 선택하지 않음: 해당 과목/SU의 전체 소단원 출제
- 여러 소단원 선택: 선택한 소단원들의 문제만 합쳐서 출제
- `전체 선택`: 현재 표시된 소단원 전체 체크
- `선택 해제`: 체크를 모두 해제하여 전체 범위로 복귀

예: ATP Gleim → SU 5에서 `5.5 Angle of Attack/Lift`, `5.7 Stall Speeds`, `5.11 Turns`만 동시에 선택해 출제할 수 있습니다.


## SU5 Figure 자동 연결 (v6)

운송글레임 SU5 문제에서 실제로 참조하는 고유 Figure 13개를 `figures/` 폴더에 포함했습니다.

포함 Figure:

Figure 229, Figure 230, Figure 231, Figure 232, Figure 233, Figure 234, Figure 237, Figure 238, Figure 239, Figure 240, Figure 41, Figure 998, Figure 999

JSON은 다음처럼 연결되어 있습니다.

```json
"figure_refs": [229, 231],
"images": [
  "figures/FIGURE_229.png",
  "figures/FIGURE_231.png"
]
```

한 문제에서 Figure가 2개 이상 필요한 경우 웹 화면에 모든 Figure를 함께 표시합니다.


## v7 통합 문제은행

포함 Study Unit:

- SU 5 — Aerodynamics and Airplanes
- SU 6 — Airspace and Airports
- SU 7 — Air Traffic Control
- SU 8 — IFR Navigation Equipment, Holding, and Approaches
- SU 9 — IFR Flights
- SU 15 — Aviation Weather
- SU 16 — Weather Reports and Forecasts
- SU 17 — Wind Shear
- SU 18 — Aeromedical Factors and Aeronautical Decision Making (ADM)

총 1,075문제입니다.

새로 추가한 SU의 Figure는 문제의 `figure_refs`와 `images` 필드에 연결되어 있습니다.
Figure 번호의 A/B suffix도 보존합니다. 예:

```json
"figure_refs": ["255A", "257B"],
"images": [
  "figures/FIGURE_255A.png",
  "figures/FIGURE_257B.png"
]
```

SU5의 기존 한글 해설은 그대로 유지됩니다. 이번에 새로 추가한 SU 6/7/8/9/15/16/17/18의
해설은 원문 영어를 보존했습니다.


## v8 — 전체 한글 해설

v8부터 포함된 1,075문제 모두 웹 화면에서 한국어 해설을 표시합니다.

- SU5: 기존 상세 한글 해설 유지
- SU6 / 7 / 8 / 9 / 15 / 16 / 17 / 18: 시험 포인트 중심 한국어 핵심 해설
- 새로 번역된 799문제의 기존 Gleim 영문 상세 해설은 `explanation_en`에 그대로 보존
- 표시용 `explanation`은 한국어
- `explanation_language`는 `ko`

예시:

```json
{
  "answer": "B",
  "explanation": "정답은 B입니다. ...한국어 해설...",
  "explanation_language": "ko",
  "explanation_en": "Original Gleim English explanation..."
}
```

따라서 사이트에서는 한국어로 공부하면서 필요할 경우 JSON에서 원문 상세 해설을 대조할 수 있습니다.


## v9 — 학습 통계 강화 + 시험모드 제외 표시

### 학습 통계
브라우저 LocalStorage에 저장된 학습기록을 기준으로 다음을 계산합니다.

- 전체 문제 수
- 한 번이라도 푼 고유 문제 수
- 전체 진도율
- 누적 풀이 횟수
- 누적 정답률
- 교재/과목별 전체 문제 수 / 푼 문제 수 / 진도율 / 정답률
- Study Unit별 전체 문제 수 / 푼 문제 수 / 진도율 / 정답률
- 풀이 기록이 있는 SU 중 가장 정답률이 낮은 SU 자동 표시

`푼 문제 수`는 고유 문제 기준이며, `정답률`은 모든 시도의 누적 정답/풀이 횟수 기준입니다.

### ! 시험모드 제외
문제 화면의 `!` 버튼을 누르면 해당 문제는 학습모드에는 계속 남아 있지만 이후 시험모드에서는 출제되지 않습니다.

- `!` 활성: 시험모드 제외
- 다시 누르면 해제
- 출제 범위에서 `시험모드 제외 문제만`을 선택해 따로 확인 가능
- 설정은 기존 학습기록과 함께 LocalStorage에 저장

GitHub Pages는 정적 사이트이므로 이 학습 DB는 현재 브라우저/기기에 저장됩니다.


## v10 — 그림 없는 문제만 출제

문제 선택 화면에 `그림 없는 문제만` 체크박스를 추가했습니다.

- 과목 / Study Unit / 소단원 / 오답 / 즐겨찾기 / 미풀이 필터와 함께 조합 가능
- 학습모드와 시험모드 모두 적용
- 오답 다시풀기에도 유지
- `requires_figure`, `figure_refs`, `images`, `image`, `image_path`가 있는 문제는 제외
- 구형/OCR 데이터에서 Figure 메타데이터가 빠진 경우를 대비해 문제 문장의 `그림`, `도표`, `일기도`, `기상도`, `Figure` 참조도 보조적으로 판별

체크를 해제하면 다시 그림 문제까지 포함합니다.


## v10.1 — 문제 DB 반영 확인 개선

- `data/questions.json` 요청에 cache-busting query를 붙여 최신 GitHub Pages 데이터를 강제로 확인합니다.
- 메인 화면에 실제 로드한 과목별 문제 수를 표시합니다.
  - 예: `총 1,672문제 · ATP Gleim 1,075 · 항공기상 597`
- 관리자 페이지에서 JSON 병합 후, 브라우저 병합만 된 상태임을 명확하게 안내합니다.
- 관리자 병합 결과를 실제 사이트에 반영하려면 다운로드된 `questions.json`을 GitHub의 `data/questions.json`에 덮어쓰고 Commit해야 합니다.


## v11 — ERROR 문제 신고 / 자동 건너뛰기

문제 화면에 `ERROR` 버튼과 상단 `오류 목록`을 추가했습니다.

### ERROR 버튼 동작
- 누르는 즉시 해당 문제를 오류 목록에 저장합니다.
- 현재 세션에서 문제를 제거하고 바로 다음 문제로 넘어갑니다.
- 이후 학습모드/시험모드/오답 다시풀기 등 모든 출제에서 자동 제외됩니다.
- 오류 목록에서 `오류 해제`를 누르면 다시 출제 대상에 포함됩니다.

### 오류 목록
- 문제 ID, 과목, SU, 문제 지문, 선택지를 자동 저장합니다.
- 각 문제마다 오류 내용을 메모할 수 있습니다.
- `전체 복사`를 누르면 ChatGPT에 바로 붙여넣기 좋은 텍스트 형식으로 클립보드에 복사됩니다.
- 오류 신고와 메모는 기존 학습기록처럼 LocalStorage에 저장됩니다.


## v11.1 — ERROR / 오류 목록 핫픽스

- 정적 파일 캐시 문제를 막기 위해 `app-v11-1.js`, `style-v11-1.css` 새 파일명을 사용합니다.
- ERROR 관련 버튼은 이벤트 위임 방식으로 연결해 모바일 브라우저에서도 안정적으로 동작합니다.
- LocalStorage 저장이 차단/실패하더라도 현재 세션의 오류 신고, 자동 건너뛰기, 오류 목록 표시는 계속 동작합니다.
- 상단 설명에 `v11.1`이 표시되면 새 코드가 실제 적용된 상태입니다.
