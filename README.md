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
