# v11.60.47 메뉴 높이 복구

v11.60.46 위에 ZIP 내용을 덮어쓰세요. index.html 교체와 assets의 새 CSS/JS 추가가 모두 필요합니다. SQL은 없습니다. 배포 후 강력 새로고침하세요.

메뉴와 배경막을 backdrop-filter가 적용된 헤더 밖으로 이동했습니다. backdrop-filter는 fixed 자식 요소의 containing block을 만들기 때문에 기존 top/bottom 계산이 헤더 높이를 기준으로 수행되어 메뉴가 잘렸습니다. 메뉴 높이는 viewport 높이에서 헤더 높이를 뺀 값으로 명시했습니다. JS에도 부모 위치 복구를 넣었습니다.

홈 로고 아래 설명 삭제, 버튼 ID, 학습 바로가기, 모바일 메뉴, 대메뉴 접기 기능은 유지했습니다.

DOM 검증과 JS 문법 검증 결과는 validation.json에 있습니다. 브라우저 렌더링과 운영 서버 통합 테스트는 실행하지 못했습니다.
