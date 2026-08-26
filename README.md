# v11.33 UI Recovery Patch

v11.32 패치에서 index.html이 `assets/style-v11-29.css`를 참조했지만 패치 ZIP에 해당 CSS가 포함되지 않아, 패치만 업로드한 경우 로그인 UI만 정상이고 본문 UI가 스타일 없이 깨질 수 있었습니다.

이번 패치는 `assets/style-v11-33.css`를 **패치 안에 직접 포함**하고 index.html도 그 파일만 참조합니다.
자료실 이미지는 계속 `assets/` 바로 아래에 평탄화되어 있으며 `assets/resources/` 폴더는 만들지 않습니다.
