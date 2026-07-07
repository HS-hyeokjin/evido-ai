# EVIDO AI

### 문서 기반 AI 검색 및 질의응답 서비스

🔗 **서비스 바로가기**
https://www.evido.site

<img width="1615" height="936" alt="EVIDO Main Image" src="https://github.com/user-attachments/assets/59951d10-8994-4e5e-8fb7-acf1e8d7eb20" />

---

## 프로젝트 소개

**EVIDO AI**는 사용자가 업로드한 PDF, TXT 문서를 기반으로 질문에 답변하고, 답변의 근거가 되는 문서 조각을 함께 제공하는 AI 문서 검색 서비스입니다.

일반적인 AI 챗봇은 답변의 출처가 불분명하거나 사용자의 실제 문서 내용을 반영하지 못하는 한계가 있습니다.
EVIDO AI는 문서를 워크스페이스 단위로 관리하고, 문서 내용을 청크 단위로 분할한 뒤 벡터 검색을 통해 질문과 관련된 근거를 찾습니다.

또한 사용자의 질문을 바로 LLM에 전달하지 않고 다음 과정을 거쳐 답변을 생성합니다.

```text
질문 분류 → 후속 질문 감지 → 질의 재작성 → 캐시 조회 → 문서 검색 → 답변 생성 → 근거 검증
```

이를 통해 단순한 챗봇이 아니라, **문서 기반 업무 지식 검색 시스템**으로 확장할 수 있도록 설계했습니다.

---

## 프로젝트 목표

<img width="1409" height="764" alt="EVIDO Core Value" src="https://github.com/user-attachments/assets/b7b13f96-7ce4-4abf-bb5e-c8c6780c234a" />

EVIDO AI의 목표는 긴 문서를 직접 읽지 않아도 필요한 정보를 빠르게 찾고, AI 답변이 어떤 문서 내용을 근거로 생성되었는지 확인할 수 있는 환경을 제공하는 것입니다.

기업 환경에서는 업무 매뉴얼, 정책 문서, 보고서, 장애 대응 기록과 같은 내부 자료가 외부로 전달되는 것에 부담이 있습니다.
이를 고려하여 EVIDO AI는 문서 저장, 검색, 답변 생성 흐름을 분리하고, LLM 호출 영역을 어댑터 형태로 구성했습니다.

현재는 외부 LLM API를 활용할 수 있지만, 향후 GPU 서버나 내부 연산 환경이 제공될 경우 오픈소스 LLM 또는 온프레미스 LLM로 전환할 수 있도록 확장 가능한 구조를 목표로 합니다.

---

## 주요 기능

<table>
  <tr>
    <td width="33%" valign="top">
      <a href="./docs/01-auth.md"><b>1. 사용자 인증</b></a><br/><br/>
      Google OAuth2 로그인과 JWT 기반 인증을 제공합니다.<br/>
      Access Token과 Refresh Token을 활용하고, HttpOnly Cookie로 토큰을 안전하게 관리합니다.
    </td>
    <td width="33%" valign="top">
      <a href="./docs/02-workspace.md"><b>2. 워크스페이스</b></a><br/><br/>
      사용자별 워크스페이스를 생성하고 관리할 수 있습니다.<br/>
      문서, 대화, 권한을 워크스페이스 단위로 분리하여 관리합니다.
    </td>
    <td width="33%" valign="top">
      <a href="./docs/03-document-management.md"><b>3. 문서 관리</b></a><br/><br/>
      PDF, TXT 문서를 업로드하고 상태를 관리할 수 있습니다.<br/>
      문서 상세 조회와 문서 뷰어를 통해 원본 내용을 확인할 수 있습니다.
    </td>
  </tr>
  <tr>
    <td width="33%" valign="top">
      <a href="./docs/05-rag-answer.md"><b>4. AI 질의응답</b></a><br/><br/>
      업로드된 문서를 기반으로 질문에 답변합니다.<br/>
      Qdrant Vector DB에서 관련 문서 청크를 검색하고, LLM을 통해 답변을 생성합니다.
    </td>
    <td width="33%" valign="top">
      <a href="./docs/06-conversation.md"><b>5. 대화 관리</b></a><br/><br/>
      워크스페이스별 대화 목록을 관리합니다.<br/>
      첫 메시지 전송 시 새 대화가 자동 생성되고, 이후 메시지를 이어서 저장할 수 있습니다.
    </td>
    <td width="33%" valign="top">
      <a href="./docs/04-document-processing.md"><b>6. 문서 처리 / 근거 검색</b></a><br/><br/>
      문서를 청크 단위로 분할하고 임베딩을 생성합니다.<br/>
      AI 답변 아래에 근거 문서 조각을 함께 제공하여 신뢰성을 높입니다.
    </td>
  </tr>
</table>
---

## 상세 문서

EVIDO AI의 기능별 구현 내용은 아래 문서에서 확인할 수 있습니다.

| 문서 | 설명 |
| --- | --- |
| [사용자 인증](./docs/01-auth.md) | Google OAuth2 로그인, JWT 발급, Refresh Token 저장, Access Token 자동 재발급 흐름 |
| [워크스페이스](./docs/02-workspace.md) | 사용자별 워크스페이스 생성, 기본 워크스페이스 초기화, 권한 분리 구조 |
| [문서 관리](./docs/03-document-management.md) | PDF/TXT 업로드, 문서 목록 조회, 문서 상세 조회, 버전 관리, 삭제 처리 |
| [문서 처리](./docs/04-document-processing.md) | 텍스트 추출, 정규화, 청킹, 임베딩 생성, Qdrant Vector DB 저장 구조 |
| [RAG 답변 생성](./docs/05-rag-answer.md) | 질문 분류, 후속 질문 감지, 질의 재작성, 문서 검색, LLM 답변 생성, 근거 검증 |
| [대화 관리](./docs/06-conversation.md) | 대화 생성, 메시지 저장, SSE 스트리밍 응답, 근거 이벤트 처리 |
| [사용자 설정](./docs/07-user-settings.md) | 표시 이름, 답변 스타일, 근거 표시 방식, 테마 설정 관리 |
| [공통 API / 예외 처리](./docs/08-common-api.md) | CommonResponse, ErrorCode, BusinessException, Axios Interceptor, 공통 에러 처리 |

---

## 기술 스택

| 영역       | 기술                                                                                 |
| -------- | ---------------------------------------------------------------------------------- |
| Backend  | Java 21, Spring Boot, Spring Security, Spring Data JPA, WebFlux, Validation        |
| Frontend | React, Vite, TypeScript, Tailwind CSS, React Router, Axios                         |
| AI / RAG | FastAPI, Qdrant, FastEmbed, Sentence Transformers, Groq / Gemini / Ollama 연동 가능 구조 |
| Database | MySQL / MariaDB, Redis                                                             |
| Infra    | AWS EC2, AWS RDS, AWS S3, Docker, Nginx, GitHub Actions                            |

---

## 시스템 아키텍처

<img width="1602" height="832" alt="EVIDO Architecture" src="https://github.com/user-attachments/assets/dc4daccc-4208-4341-9893-80ae70c337f3" />

EVIDO는 React 기반 프론트엔드, Spring Boot API 서버, FastAPI 기반 RAG 서버를 분리하여 구성했습니다.

사용자는 React 화면에서 문서를 업로드하고 질문을 입력합니다.
요청은 Nginx Reverse Proxy를 거쳐 Spring Boot API Server로 전달됩니다.

Spring Boot 서버는 사용자 인증, 워크스페이스, 문서, 대화, 메시지 관리를 담당합니다.
문서 기반 답변이 필요한 경우 FastAPI RAG Server에 질문을 전달하고, RAG 서버는 Qdrant Vector DB에서 관련 문서 청크를 검색한 뒤 LLM을 통해 답변을 생성합니다.

```text
User / Browser → React Frontend → Nginx Reverse Proxy → Spring Boot API Server → FastAPI RAG Server
→ Qdrant Vector DB → LLM → Spring Boot API Server → React Frontend
```


## 프로젝트 진행 기간

| 구분      | 기간                      | 주요 목표                 | 주요 작업                                                        |
| ------- | ----------------------- | --------------------- | ------------------------------------------------------------ |
| 1차 스프린트 | 2026.02.01 ~ 2026.02.14 | 프로젝트 기반 설계 및 인증 구조 구축 | 초기 세팅, 도메인 설계, JWT/OAuth2 인증, 워크스페이스 기본 구조 구현                |
| 2차 스프린트 | 2026.02.15 ~ 2026.03.28 | 문서 관리 및 RAG 연동        | 문서 업로드, FastAPI RAG 서버 연동, Qdrant 검색, LLM 답변 생성, 근거 데이터 반환   |
| 3차 스프린트 | 2026.03.28 ~ 2026.04.30 | UI 개선 및 배포 환경 구성      | GPT 스타일 채팅 UI, 문서 뷰어 개선, Docker 배포, Nginx Reverse Proxy 구성   |
| 4차 스프린트 | 2026.05.01 ~ 2026.05.30 | 오케스트레이션 및 배포 개선       | 질문 분류, 후속 질문 처리, 질의 재작성, GitHub Actions, Blue-Green 배포 구조 적용 |
| 5차 스프린트 | 2026.06 이후              | 서비스 안정화 및 확장          | OCR, 답변 캐싱 고도화, S3 저장소 고도화, 스트리밍 답변, MSA 전환 검토               |

---
