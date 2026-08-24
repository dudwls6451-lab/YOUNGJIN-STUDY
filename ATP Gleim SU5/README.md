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
