# AX 및 DX 실전 교육 랜딩페이지

최종 디자인 기준은 **Editorial Kinetic(B안)** 이다.

- 기본 경로: `/` → `/concept-b/`
- 최종 구현: `concept-b/`
- 비교 화면: `compare/`
- A안 보존 기록: `concept-a/` — 이후 개발 및 수정 대상이 아님
- DB, API, 실제 결제 및 관리자 기능: 미구현

## 교육 참여 효과 대표 사진 교체

다음 세 파일을 동일한 이름으로 교체하면 코드 수정 없이 반영된다.

- `assets/ax-education/join01.png` — 효과 1~2
- `assets/ax-education/join02.png` — 효과 3~4
- `assets/ax-education/join03.png` — 효과 5

권장 원본은 세로 4:5 비율의 1600×2000px PNG이며, 최소 1200×1500px 이상을 사용한다.

표시 위치는 `concept-b/style.css`의 `--benefits-image-position`으로 조정한다.

## 스마트메이커 참고용 캡처 지점

최종 페이지의 p3~p8에는 `data-capture-point="p3"`부터 `data-capture-point="p8"`까지 지정되어 있다.

캡처 스크립트:

`scripts/capture-designs.mjs`

캡처 없이 검증만 실행할 때는 `--verify`를 사용한다.

결과 경로:

- 전체 페이지: `docs/captures/concept-b-desktop.png`, `docs/captures/concept-b-mobile.png`
- 구간별: `docs/captures/sections/desktop-p3.png`~`desktop-p8.png`
- 모바일 구간별: `docs/captures/sections/mobile-p3.png`~`mobile-p8.png`
