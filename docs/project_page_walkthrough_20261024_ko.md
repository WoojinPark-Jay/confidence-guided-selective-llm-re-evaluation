# 프로젝트 페이지 보강: 알고리즘과 실제 실행 사례

## 변경 내용

- 두 저자의 고려대학교 소속 확인 후, 기존 bounded-history-agreement 페이지와 같은 고려대학교 로고를 상단에 배치했다. 학과나 추가 소속은 추정하지 않았다.
- 전체 아키텍처 그림은 유지했다. Algorithm 항목에서 사전 준비(보정, 임계값 선택, 모델별 plan 저장)와 게시글별 실행(분류, 라우팅, 재평가, 라벨 추출)을 분리했다.
- confidence 0.70 이상이면 Phase 1 예측을 유지하고, 미만이면 원문을 재평가하는 분기를 표시했다. 라벨 추출 실패 시 Phase 1으로 돌아가는 규칙과 접을 수 있는 의사코드를 추가했다.
- Case walkthrough에서 입력 원문, Phase 1 라벨/확신도, 라우팅 여부, 최종 라벨, 평가용 정답을 한 흐름으로 표시한다. 선택 메뉴로 네 사례를 전환하고 실제 모델 응답 전문을 펼쳐 볼 수 있다.

## 공개한 사례

| ID | 유형 | 실제 결과 |
|---|---|---|
| MEV2_DEP_046 | 교정 | Happy → Depression, confidence 68.82% |
| MEV2_HAP_003 | 새 오류 | Happy → Neutral, 정답은 Happy |
| MEV2_NEU_004 | 파싱 실패 | 유효한 최종 라벨이 없어 Phase 1 Neutral 유지 |
| MEV2_DEP_001 | 미라우팅 오류 | confidence 79.59%로 LLM 호출 없이 Happy 유지, 정답은 Depression |

실제 환자나 Reddit 원문 사례가 아니다. 공개된 합성 Mixed Emotion 데이터에 대한 실제 최종 Llama 3 SELF-DISCOVER 실행 기록이다. 새로운 추론을 실행하거나 모델 응답을 창작하지 않았다. 첫 번째 교정 사례, 유일한 새 오류, 유일한 파싱 실패, 데이터의 첫 번째 행을 선택했다. 대표 표본이나 추가 성능 검증으로 주장하지 않는다.

## 데이터 검증

- 원본 `llama3_self_discover_mixed_emotion_sd_v6c_compact_results.csv`의 SHA-256이 기존 감사 기록 `77fdf9430614fb48d0af4f47aee108944b64bc4736925d8923ccb4747e98cb15`와 일치함을 확인했다.
- 86개 routed 행 전체에 대해 합성 원문, 공개된 Llama 3 plan, Phase 1 라벨/확신도, fallback 적용 후 최종 라벨을 공개 파일과 대조했다.
- 예전 비-v6c 결과 파일은 사용하지 않았다. 모델 출력의 일부 근거 연결이 부정확할 수 있으므로 원문은 고치지 않고, 설명 문장과 모델 응답을 구분했다.
- 화면의 Emotional Arc / Counterfactual 부분은 실제 모델 응답에서 발췌한다. 모델 응답 전문은 공개 JSON에도 보존했다.
- 공개 자료는 합성 글 4건과 그중 routed 3건의 모델 응답이다. Reddit 원문, 사용자 식별정보, 인증정보는 포함하지 않는다.

## 파일과 검수

- `data/mixed_emotion/site_case_records.json`: 사례와 출처/선정 기준
- `scripts/build_site_cases.py`: 원본 해시 및 행 대조 후 내보내기, 공개 JSON에서 웹 자료 재생성
- `site/cases.js`: 사례 전환, 발췌, 원문 응답 표시
- `site/index.html`, `site/styles.css`: 로고, 알고리즘, 사례 UI
- 배포 시 새 JS도 콘텐츠 해시가 붙는 파일명으로 제공한다. 로컬 HTML에서도 외부 API 없이 작동한다.
- 테스트 10개 통과. 브라우저에서 네 사례, 원문 펼치기, 기존 저장 plan 선택, 로고 로딩, 데스크톱/모바일 가로 넘침을 확인했다.
- 논문, 실험 설정, 전체 성능 수치는 변경하지 않았다.
