---
title: "HyDE — 가설 문서로 라벨 없이 Dense Retrieval 하기"
date: 2026-06-15
categories: [논문 리뷰]
tags: [RAG, Retrieval, LLM, Embedding]
description: "관련성 라벨 없이도 LLM이 만든 '가설 문서'의 임베딩을 검색 키로 써서 zero-shot dense retrieval을 fine-tuned 수준까지 끌어올리는 방법. Precise Zero-Shot Dense Retrieval without Relevance Labels (ACL 2023) 정리."
---

> HyDE는 관련성 라벨 없이도 LLM이 만든 *가설 문서*의 임베딩을 검색 키로 사용해 zero-shot dense retrieval을 달성하는 방법이다. Contriever 대비 fine-tuned 수준의 성능을 다양한 태스크/언어에서 보인다.

**참고 자료**

- [arXiv 2212.10496](https://arxiv.org/abs/2212.10496)
- 저자: Luyu Gao, Xueguang Ma, Jimmy Lin, Jamie Callan (CMU, University of Waterloo)
- 발표: 2022.12 (ACL 2023)

## 논문 선정 배경

사용자 질문을 벡터 검색으로 풀 때 *쿼리-문서 임베딩 공간의 비대칭* 문제로 검색 품질이 떨어지는 지점이 자주 보입니다. 사용자가 던지는 짧은 질문과 실제 참고 문서(긴 답변/근거)는 어휘·문체가 달라 vanilla dense retrieval이 종종 헛다리를 짚습니다.

HyDE는 이 비대칭을 *쿼리를 문서로 변환한 뒤 검색*하는 단순하지만 강력한 아이디어로 풀어내고, 별도 라벨링이 필요 없습니다. fine-tuning 비용 없이 LLM 호출 한 번만 끼워 넣어 retrieval 품질을 끌어올릴 수 있는지 가능성을 살펴보고자 이 논문을 정리해 봤습니다.

## 한눈에 보기

- **저자/소속:** Luyu Gao, Xueguang Ma, Jimmy Lin, Jamie Callan (CMU, University of Waterloo)
- **분량/출처:** 본문 9p, arXiv ID 2212.10496, ACL 2023
- **핵심 주장:** 관련성 라벨 없이도, LLM이 생성한 가설 문서를 인코딩하여 검색 키로 쓰면 zero-shot dense retrieval이 fine-tuned 모델 수준에 도달한다
- **핵심 개념:** Hypothetical Document Embeddings (HyDE), dense bottleneck, zero-shot retrieval
- **방법론:** InstructGPT(text-davinci-003) + Contriever 조합. 쿼리 → 가설 문서 생성 → 인코더로 벡터화 → 코퍼스에서 유사도 검색
- **포지션:** 학습이 아닌 *추론 시 query rewriting* 으로 zero-shot retrieval 한계를 우회

## 1. 문제 정의 — Zero-shot dense retrieval은 왜 어려운가

Dense retrieval은 쿼리와 문서를 같은 임베딩 공간으로 매핑한 뒤 내적으로 유사도를 계산합니다. 그런데 *내적이 relevance를 포착하려면 (q, d) 쌍에 대한 관련성 라벨이 필요*합니다. 라벨 없이는 두 인코더 함수의 학습이 사실상 불가능합니다.

대안인 MS-MARCO 같은 대규모 라벨 데이터는 상용 제약으로 활용이 어렵고, 도메인이 다른 새 코퍼스에서는 전이가 잘 되지 않습니다. 그래서 BM25 같은 lexical baseline을 결국 다시 쓰게 되는 상황이 흔합니다. 본 논문은 *이 문제를 학습이 아닌 추론 시점의 query rewriting으로 우회*합니다.

## 2. HyDE 핵심 아이디어 — Pivot through Hypothetical Document

HyDE의 통찰은 *관련성 함수를 직접 배우지 말고, 관련성 자체를 LLM이 만든 가설 문서로 대체*하자는 것입니다.

파이프라인은 4단계로 매우 단순합니다.

| 단계 | 구성요소 | 역할 |
|---|---|---|
| 1. Query | 사용자 입력 | 자연어 질문 또는 명령 |
| 2. Generate | InstructGPT (text-davinci-003) | "질문에 답하는 문서를 작성하시오" 형태의 지시를 받아 가설 문서를 생성. 사실이 틀릴 수 있지만 *relevance pattern*은 포착됨 |
| 3. Encode | Contriever (unsupervised contrastive) | 생성 문서를 dense vector로 인코딩. *dense bottleneck*이 환각 디테일을 필터링 |
| 4. Search | vector similarity | 가설 문서 벡터와 가까운 실제 문서를 코퍼스에서 retrieval |

핵심은 두 가지 디커플링입니다.

1. **Relevance 모델링** — instruction-following LLM이 담당 (학습 불요, 라벨 불요)
2. **Grounding** — contrastive 인코더의 dense bottleneck이 환각을 거르고 실제 코퍼스에 묶음

이 분리 덕분에 *완전 zero-shot* 인데도 검색 품질이 fine-tuned 모델에 근접합니다.

## 3. Task별 Instruction Prompt

논문 부록은 도메인마다 다른 instruction을 명시합니다. 도메인 신호를 prompt에 한 줄 더하는 것만으로 충분합니다.

| Task | Prompt 핵심 |
|---|---|
| Web Search | Please write a passage to answer the question |
| SciFact | Please write a scientific paper passage to support/refute the claim |
| Arguana | Please write a counter argument for the passage |
| TREC-COVID | Please write a scientific paper passage to answer the question |
| FiQA | Please write a financial article passage to answer the question |
| TREC-NEWS | Please write a news passage about the topic |
| Mr.TyDi | Please write a passage in [Language] to answer the question in detail |

## 4. 실험 결과

평가 데이터셋은 총 11종 (TREC DL19/20, BEIR 6종, Mr.TyDi 다국어 4종).

### 4.1 Web Search (TREC DL19/20)

| 모델 | DL19 MAP | DL19 nDCG@10 | DL19 R@1K | DL20 MAP | DL20 nDCG@10 |
|---|---|---|---|---|---|
| Contriever (zero-shot) | 24.0 | 44.5 | 74.6 | 24.0 | 42.1 |
| **HyDE (zero-shot)** | **41.8** | **61.3** | **88.0** | **38.2** | **57.9** |
| Contriever-FT (fine-tuned) | 41.7 | 62.1 | 83.6 | 43.6 | 63.2 |

zero-shot HyDE가 Contriever 대비 MAP +74%, nDCG@10 +37%. 놀라운 점은 *fine-tuned Contriever와 거의 동급에 도달*했다는 점입니다.

### 4.2 Low-Resource BEIR (nDCG@10)

| Dataset | BM25 | Contriever | **HyDE** | Contriever-FT |
|---|---|---|---|---|
| SciFact | 67.9 | 64.9 | **69.1** | 67.7 |
| Arguana | 39.7 | 37.9 | **46.6** | 44.6 |
| TREC-COVID | 59.5 | 27.3 | **59.3** | 59.6 |
| FiQA | 23.6 | 24.5 | 27.3 | 32.9 |
| DBPedia | 31.8 | 29.2 | 36.8 | 41.3 |
| TREC-NEWS | 39.5 | 34.8 | **44.0** | 42.8 |

TREC-COVID처럼 *Contriever가 BM25에 크게 밀리던* 어려운 도메인에서 HyDE가 BM25 수준까지 회복합니다 (27.3 → 59.3). 단, FiQA·DBPedia처럼 *fine-tuned encoder가 우위인 도메인*은 zero-shot HyDE로 따라잡지 못합니다.

### 4.3 다국어 (Mr.TyDi, MRR@100)

| 언어 | mDPR | mContriever | **HyDE** | mContriever-FT |
|---|---|---|---|---|
| Swahili | 7.3 | 38.3 | **41.7** | 51.2 |
| Korean | 21.9 | 22.3 | **30.6** | 34.2 |
| Japanese | 18.1 | 19.5 | **30.7** | 32.4 |
| Bengali | 25.8 | 35.3 | 41.3 | 42.3 |

한국어·일본어에서도 비지도 mContriever 대비 +8~11 MRR 향상. fine-tuned과의 격차는 남지만, *라벨 없이 도달한 수치*라는 점이 중요합니다.

### 4.4 생성 모델 크기 영향 (DL19 nDCG@10)

| 생성 모델 | 크기 | DL19 nDCG@10 |
|---|---|---|
| (Contriever만) | — | 44.5 |
| Flan-T5 | 11B | 48.9 |
| Cohere | 52B | 53.8 |
| **InstructGPT** | 175B | **61.3** |

생성 모델 품질이 그대로 검색 품질로 직결됩니다. 더 좋은 LLM이 등장하면 retrieval 품질도 자동으로 따라 올라가는 *scaling property*가 작동합니다.

## 5. 핵심 통찰

HyDE의 효과를 한 줄로 요약하면 *"임베딩 공간의 비대칭을 LLM이 미리 해소한다"* 입니다. 기존 dense retrieval은 짧은 query와 긴 document를 *같은 공간으로* 사상하려고 노력했지만, HyDE는 *query를 미리 document처럼 만들어서* 같은 분포에서 비교합니다.

또 주목할 점은 **dense bottleneck = lossy compressor as a feature** 라는 관점입니다. LLM이 만든 가설 문서가 사실관계가 틀려도, 임베딩 차원으로 압축되는 과정에서 *틀린 디테일*은 평균화돼 사라지고 *relevance signal*만 남습니다. 환각이 *명시적 위험*이 아니라 *압축 과정에서 자연 소거되는 노이즈*로 다뤄진다는 시각이 신선합니다.

## 시사점

**① RAG Search 즉시 적용 가능** — 입력 쿼리 단에 HyDE 노드를 추가하면, fine-tuning 비용 없이 search recall을 끌어올릴 여지가 있습니다. 특히 사용자 질문이 짧고 모호한 대화형 환경에서 효과가 클 것으로 보입니다.

**② trade-off 명확화 필요** — LLM 호출 1회가 추가되므로 latency·token 비용이 늘어납니다. 실제 도입 전 (a) 가설 문서 생성 캐싱, (b) 짧고 모호한 쿼리에만 선택적 적용, (c) Mr.TyDi 한국어 결과처럼 *국문 도메인에서 실측 ablation* 을 먼저 돌려보는 게 안전합니다. FiQA·DBPedia 사례처럼 fine-tuned encoder가 압도하는 도메인이 있어, *코퍼스 특성에 따라 효과가 달라질 수 있다*는 점도 같이 인지해야 합니다.

## 정리

- HyDE는 dense retrieval의 *관련성 라벨* 의존을 제거하는 가장 단순한 방법: 쿼리를 LLM으로 *가설 문서화*한 뒤 인코딩
- 생성 모델은 *관련성 모델링*, 인코더는 *grounding*으로 책임 분리 → zero-shot 인데도 fine-tuned 수준
- 11개 task 평균 +20~70% 성능 향상, 다국어(ko/ja/sw)에서도 동작
- 한계: latency·비용 증가, fine-tuned encoder가 강한 도메인(FiQA, DBPedia)에서는 격차 존재
