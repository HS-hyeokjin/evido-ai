# EVIDO

### 🔗 **[EVIDO-AI 서비스 바로가기](https://www.evido.site)**

<img width="1615" height="936" alt="EVIDO Main Image" src="https://github.com/user-attachments/assets/59951d10-8994-4e5e-8fb7-acf1e8d7eb20" />

---

## 1. 프로젝트 개요

**EVIDO**는 사용자가 업로드한 문서를 기반으로 질문에 답변하고, 답변의 근거가 되는 문서 조각을 함께 제공하는 **문서 기반 AI 검색 및 질의응답 서비스**입니다.

기존의 일반적인 AI 챗봇은 답변의 출처가 불분명하거나 사용자의 실제 문서 내용을 정확히 반영하지 못하는 한계가 있습니다. EVIDO는 사용자의 문서를 워크스페이스 단위로 관리하고, 문서 내용을 벡터화하여 검색한 뒤, 검색된 근거를 기반으로 답변을 생성합니다.

이를 통해 사용자는 긴 문서를 직접 읽지 않아도 필요한 정보를 빠르게 찾을 수 있으며, AI 답변이 어떤 문서 내용을 근거로 생성되었는지 확인할 수 있습니다.

### 프로젝트 기간

EVIDO는 기능 단위로 개발 범위를 나누어 스프린트 방식으로 진행했습니다.  
각 스프린트마다 주요 기능을 우선 구현하고, 이후 UI 개선, 배포 자동화, RAG 성능 개선 방향으로 확장했습니다.

| 구분 | 기간 | 주요 목표 | 주요 작업 |
| --- | --- | --- | --- |
| 1차 스프린트 | 2026.02.01 ~ 2026.02.14 | 프로젝트 기반 설계 및 인증 구조 구축 | 프로젝트 초기 세팅, 도메인 설계, JWT/OAuth2 인증, 워크스페이스 기본 구조 구현 |
| 2차 스프린트 | 2026.02.15 ~ 2026.03.28 | 문서 관리 및 대화 기능 구현 | RAG 서버 연동 및 AI 답변 기능 구현 , FastAPI RAG 서버 연동, Qdrant 검색, LLM 답변 생성, 근거 데이터 반환 
| 3차 스프린트 | 2026.03.28 ~ 2026.04.30 | UI 개선 및 배포 환경 구성 | GPT 스타일 채팅 UI, 문서 뷰어 개선, Docker 배포, NGINX Reverse Proxy, CI/CD 구조 설계 |
| 고도화 예정 | 2026.05 이후 | 서비스 안정화 및 확장 | GitHub Actions 전환, Blue-Green 배포, S3 저장소 전환, OCR, 답변 캐싱, MSA 전환 검토 |

---

## 2. 프로젝트 목적

1. 사용자가 보유한 문서를 AI가 이해할 수 있는 형태로 변환한다.
2. 문서 내용을 기반으로 사용자의 질문에 답변한다.
3. 답변과 함께 근거 문서 조각을 제공하여 신뢰성을 높인다.
4. 워크스페이스 단위로 문서를 관리하여 사용자별, 조직별 문서 활용을 가능하게 한다.
5. 향후 업무 자동화, 사내 지식 검색, 문서 요약, 보고서 생성 등으로 확장 가능한 기반을 만든다.

---

## 3. 주요 기능

### 3.1 사용자 인증 기능

* Google OAuth2 로그인
* JWT 기반 인증
* Access Token / Refresh Token 발급
* HttpOnly Cookie 기반 토큰 저장
* 게스트 사용자 토큰 발급
* 현재 세션 확인 API 제공

### 3.2 워크스페이스 기능

* 사용자별 워크스페이스 생성
* 기본 워크스페이스 초기화
* 워크스페이스 목록 조회
* 워크스페이스 수정
* 워크스페이스 삭제
* 워크스페이스 멤버 권한 확인

### 3.3 문서 관리 기능

* 문서 업로드
* 문서 목록 조회
* 문서 상세 조회
* 문서 원문 조회
* 문서 다운로드
* 문서 삭제
* 문서 상태 관리
* 문서별 버전 관리 확장 가능 구조

### 3.4 문서 뷰어 기능

* TXT 문서 뷰어
* PDF 문서 뷰어
* Markdown 문서 뷰어 확장 가능
* 문서 검색 기능
* 대소문자 구분 검색 옵션
* 줄 번호 표시 옵션
* 검색 결과 개수 표시

### 3.5 대화 기능

* 워크스페이스별 대화 목록 조회
* 새 대화 생성
* 첫 메시지 전송 시 대화 자동 생성
* 기존 대화에 메시지 추가
* 사용자 메시지 저장
* AI 응답 메시지 저장
* 대화별 메시지 목록 조회

### 3.6 AI 질의응답 기능

* 사용자의 질문을 RAG 서버로 전달
* 워크스페이스 기준 문서 검색
* 관련 문서 조각 검색
* LLM 기반 답변 생성
* 근거 문서 조각 반환
* 답변과 근거를 함께 저장

### 3.7 근거 표시 기능

* AI 답변 아래에 근거 영역 표시
* 문서 조각 점수 표시
* 문서 조각 인덱스 표시
* 근거 내용 미리보기 제공
* 사용자가 근거 영역을 펼치고 접을 수 있는 UI 제공

---

## 4. 기술 스택

### 4.1 Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Spring Web
* Spring WebFlux
* Spring Validation
* Spring OAuth2 Client
* Spring Actuator
* Gradle

### 4.2 Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Axios
* Lucide React
* Framer Motion
* React PDF Viewer

### 4.3 AI / RAG

* FastAPI
* Qdrant
* FastEmbed
* Sentence Transformers
* Gemini / Groq / Ollama 연동 가능 구조

### 4.4 Database / Infra

* MySQL / MariaDB
* Redis
* Docker
* Jenkins
* GitHub Actions
* Nginx
* AWS EC2
* AWS RDS
* AWS S3
* Vercel

---

## 5. 전체 시스템 구조

<img width="1602" height="832" alt="EVIDO Architecture" src="https://github.com/user-attachments/assets/dc4daccc-4208-4341-9893-80ae70c337f3" />

### 시스템 아키텍처 설명

EVIDO는 React 기반 프론트엔드, Spring Boot API 서버, FastAPI 기반 RAG 서버를 분리하여 구성한 문서 기반 AI 질의응답 서비스입니다.

사용자는 React 화면에서 문서를 업로드하고 질문을 입력합니다. 요청은 NGINX Reverse Proxy를 거쳐 Spring Boot API Server로 전달되며, 백엔드는 사용자 인증, 워크스페이스, 문서, 대화, 메시지 관리를 담당합니다.

문서 기반 답변이 필요한 경우 Spring Boot 서버는 FastAPI RAG Server에 질문을 전달합니다. RAG 서버는 Qdrant Vector DB에서 질문과 관련된 문서 청크를 검색하고, 검색된 근거를 기반으로 Ollama 또는 Gemini와 같은 LLM을 통해 답변을 생성합니다.

서비스 데이터는 MariaDB 또는 AWS RDS에 저장하고, 빠른 조회가 필요한 인증 정보와 캐시는 Redis에 저장합니다. 업로드된 원본 문서는 AWS S3에 저장할 수 있도록 설계했습니다.

배포는 Docker 기반으로 구성되며, Jenkins 또는 GitHub Actions를 통해 빌드와 배포를 자동화할 수 있습니다. 운영 환경에서는 AWS EC2와 NGINX를 사용하며, 향후 Blue-Green Deployment를 적용하여 무중단 배포와 빠른 롤백이 가능하도록 확장할 수 있습니다.

### 전체 요청 흐름

```text
User / Browser
  ↓
React Frontend
  ↓
NGINX Reverse Proxy
  ↓
Spring Boot API Server
  ↓
FastAPI RAG Server
  ↓
Qdrant Vector DB
  ↓
LLM
  ↓
Spring Boot API Server
  ↓
React Frontend
  ↓
User
```

---

## 6. 답변 생성 파이프라인

EVIDO는 사용자의 질문을 바로 LLM에 전달하지 않고, 질문을 분석하고 문서 근거를 검색한 뒤 검증 과정을 거쳐 답변을 생성합니다.

```text
질문 입력 → 질문 정규화 → 규칙 기반 분류 → 후속 질문 감지 → LLM 분류 → 질의 재작성
→ 캐시 조회 → 문서 검색 → 근거 조립 → LLM 답변 생성 → 근거 검증 → 저장 → 응답
```

### 6.1 질문 분류

사용자의 질문이 일반 대화인지, 문서 기반 질문인지, 후속 질문인지, 요약 요청인지 먼저 판단합니다.

```text
일반 대화
문서 기반 질문
후속 질문
요약 요청
애매한 질문
```

규칙 기반으로 1차 분류하고, 애매한 질문은 LLM을 활용해 추가 분류합니다.

### 6.2 질의 재작성

후속 질문이거나 검색에 적합하지 않은 질문은 문서 검색에 맞게 다시 작성합니다.

예시:

```text
원본 질문:
"그럼 환불은 어떻게 돼?"

재작성된 질문:
"에스크로 결제 과정에서 환불 처리는 어떤 흐름으로 진행되는가?"
```

### 6.3 캐시 조회

이전에 동일하거나 유사한 질문에 대한 답변이 있는지 확인합니다.

```text
Cache Hit  → 저장된 답변 즉시 반환
Cache Miss → 문서 검색 진행
```

### 6.4 문서 검색 및 근거 조립

캐시에 답변이 없으면 Qdrant Vector DB에서 관련 문서 청크를 검색합니다.

검색된 청크는 다음 과정을 거쳐 LLM에 전달할 근거 Context로 조립됩니다.

```text
관련도 높은 청크 선택
중복 청크 제거
문서 출처 정리
청크 순서 정렬
프롬프트 Context 구성
```

### 6.5 LLM 답변 생성 및 검증

LLM은 검색된 근거를 기반으로 답변을 생성합니다.  
이후 생성된 답변이 실제 근거와 일치하는지 검증합니다.

```text
검증 성공 → 답변 반환
검증 실패 → 답변 재생성 또는 근거 부족 안내
```

### 6.6 저장 및 응답

최종적으로 사용자 질문, AI 답변, 근거 목록, 캐시 정보를 저장하고 사용자에게 응답합니다.

```text
User Message 저장
Assistant Message 저장
Evidence 저장
Cache 저장
Response 반환
```

---

## 7. 프론트엔드 화면 구성

### 7.1 주요 화면

* 로그인 화면
* 워크스페이스 선택 화면
* 메인 채팅 화면
* 문서 목록 화면
* 문서 업로드 화면
* 문서 뷰어 화면
* 도움말 / 사용자 매뉴얼 화면

### 7.2 메인 레이아웃

```text
AppLayout
 ├── Sidebar
 │   ├── Logo
 │   ├── Workspace List
 │   ├── Conversation List
 │   └── Document Menu
 │
 └── Main Content
     ├── Chat Page
     ├── Document List Page
     ├── Document Viewer Page
     └── Help Page
```

### 7.3 채팅 화면 요구사항

* GPT 스타일 대화 UI
* 사용자 메시지와 AI 메시지 구분
* 전체 채팅 영역 스크롤
* 답변 생성 중 로딩 표시
* 답변 아래 근거 표시
* 근거 영역 접기/펼치기
* 새 대화 버튼
* 워크스페이스 이동 기능

### 7.4 문서 뷰어 요구사항

* PDF 파일 미리보기
* TXT 파일 내용 표시
* 문서 내 검색
* 검색 결과 하이라이트
* 줄 번호 표시 옵션
* 다운로드 버튼
* 문서 목록으로 돌아가기

---

## 8. 인증 및 보안 설계

### 8.1 인증 방식

EVIDO는 JWT 기반 인증 방식을 사용합니다.

* Access Token: 짧은 만료 시간
* Refresh Token: 긴 만료 시간
* HttpOnly Cookie 저장
* Secure 옵션 적용
* SameSite=None 적용

### 8.2 인증 흐름

```text
사용자 로그인
  ↓
OAuth2 인증 성공
  ↓
서버에서 JWT 발급
  ↓
Access Token / Refresh Token 쿠키 저장
  ↓
프론트엔드에서 API 요청
  ↓
서버 필터에서 JWT 검증
  ↓
SecurityContext에 인증 정보 저장
```

### 8.3 권한 확인

* 사용자는 자신이 속한 워크스페이스에만 접근할 수 있다.
* 문서는 워크스페이스 기준으로 접근이 제한된다.
* 대화 역시 워크스페이스 권한을 기준으로 조회된다.
* 삭제된 문서는 기본 목록에서 제외된다.

---

## 9. 배포 구조

### 9.1 현재 배포 구조

```text
[GitHub]
   ↓ push
[Jenkins]
   ↓ build
[Docker Image]
   ↓ run
[Spring Boot Container]
   ↓ reverse proxy
[Nginx]
   ↓
[evido.cloud]
```

### 9.2 GitHub Actions 전환 계획

현재는 Jenkins 기반 배포 구조를 설계했으며, 향후 GitHub Actions로 CI/CD 파이프라인을 전환하여 빌드, 테스트, Docker 이미지 생성, EC2 배포를 자동화할 예정입니다.

```text
GitHub Push
  ↓
GitHub Actions
  ↓
Build & Test
  ↓
Docker Build
  ↓
Docker Image Push
  ↓
AWS EC2 Deploy
  ↓
NGINX Reverse Proxy
  ↓
Production
```

### 9.3 인프라 구성 요소

* EC2: Spring 서버, Docker, Nginx 실행
* Vercel: React 프론트엔드 배포
* MySQL/RDS: 서비스 데이터 저장
* Redis: Refresh Token 및 캐시 저장
* Qdrant: 문서 벡터 저장
* RAG Server: FastAPI 기반 AI 검색/응답 서버
* S3: 원본 문서 파일 저장

---

## 10. Docker 배포 예시

### 10.1 Dockerfile 예시

```dockerfile
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=builder /app/build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 10.2 컨테이너 실행 예시

```bash
docker run -d \
  --name evido-app \
  -p 8081:8080 \
  --env-file .env \
  evido-app
```

---

## 11. CI/CD 전략

### 11.1 Jenkins 기반 자동 배포

1. GitHub에 코드 push
2. GitHub Webhook이 Jenkins 빌드 트리거
3. Jenkins가 프로젝트 checkout
4. Gradle build 수행
5. Docker image 생성
6. 기존 컨테이너 중지 및 삭제
7. 새 컨테이너 실행
8. Nginx를 통해 서비스 제공

### 11.2 GitHub Actions 기반 자동 배포

GitHub Actions를 활용하면 GitHub 저장소에서 직접 CI/CD 파이프라인을 구성할 수 있습니다.

주요 흐름은 다음과 같습니다.

```text
Code Push
  ↓
GitHub Actions Workflow 실행
  ↓
Gradle Build
  ↓
Test
  ↓
Docker Image Build
  ↓
Docker Image Push
  ↓
EC2 접속
  ↓
Container Pull & Run
  ↓
Nginx Reverse Proxy 연결
```

GitHub Actions 기반 배포는 Jenkins 서버를 별도로 운영하지 않아도 되기 때문에 EC2 리소스 부담을 줄일 수 있고, 저장소와 배포 파이프라인을 한 곳에서 관리할 수 있다는 장점이 있습니다.

### 11.3 Blue-Green 배포 확장 전략

Blue-Green Deployment는 현재 운영 중인 환경과 새 버전이 배포되는 환경을 분리하여 무중단 배포를 가능하게 하는 전략입니다.

```text
현재 운영 중: Blue 컨테이너
새 버전 배포: Green 컨테이너
Green 헬스체크 성공
Nginx upstream을 Green으로 변경
Blue 컨테이너 대기 또는 종료
```

장점:

* 무중단 배포 가능
* 문제 발생 시 빠른 롤백 가능
* 새 버전 검증 후 트래픽 전환 가능

주의사항:

* DB 마이그레이션 호환성 고려 필요
* Redis, RAG 서버 등 외부 의존성 상태 확인 필요
* 여러 서비스로 분리될 경우 버전 호환성 관리 필요

---

## 12. MSA 전환 계획

현재는 모듈형 모놀리식 구조를 기반으로 개발하고, 향후 서비스가 커질 경우 MSA로 분리할 수 있습니다.

### 12.1 분리 후보 서비스

```text
Auth Service
- 로그인
- JWT 발급
- OAuth2 처리

Workspace Service
- 워크스페이스 관리
- 멤버 권한 관리

Document Service
- 문서 업로드
- 문서 메타데이터 관리
- 파일 저장

Conversation Service
- 대화 관리
- 메시지 저장

QA Service
- 질문 처리
- RAG 서버 연동

RAG Service
- 문서 임베딩
- 벡터 검색
- LLM 답변 생성
```

### 12.2 MSA 전환 시 고려사항

* 서비스 간 통신 방식 결정
* 인증 정보 전달 방식 결정
* DB 분리 전략 수립
* 분산 트랜잭션 최소화
* 이벤트 기반 통신 도입 검토
* Kafka 또는 RabbitMQ 도입 검토
* 서비스별 독립 배포 전략 수립
* Gateway 도입 검토

---

## 13. 개발 중 발생한 주요 이슈와 해결 방향

### 13.1 CORS 문제

프론트엔드 도메인과 백엔드 도메인이 다르기 때문에 CORS 설정이 필요했습니다.

해결 방향:

* 로컬 개발 주소 허용
* Vercel 프론트엔드 주소 허용
* 운영 도메인 허용
* 쿠키 인증을 위해 `allowCredentials(true)` 설정
* allowedOrigins에는 trailing slash가 없는 정확한 origin 사용

### 13.2 OAuth2 Redirect URI 문제

Google OAuth2 로그인 시 프론트엔드 주소와 백엔드 redirect URI 설정이 맞아야 합니다.

해결 방향:

* 승인된 JavaScript 원본에 프론트엔드 도메인 등록
* 승인된 리디렉션 URI에 백엔드 OAuth2 callback URI 등록
* 운영 환경과 로컬 환경을 분리하여 관리

### 13.3 Vercel 환경변수 문제

프론트엔드에서 백엔드 API 주소를 사용하기 위해 `VITE_API_BASE_URL` 환경변수가 필요했습니다.

해결 방향:

* Vercel Project Settings에서 환경변수 등록
* 환경변수 변경 후 재배포 수행
* VITE_ prefix가 붙은 값은 브라우저에 노출된다는 점 고려

### 13.4 문서 뷰어 라우팅 문제

문서 파일 API 경로를 프론트엔드 라우터가 처리하려고 하면서 문제가 발생할 수 있습니다.

해결 방향:

* API 요청은 Axios 또는 실제 백엔드 URL로 요청
* React Router 경로와 API 경로를 분리
* PDF iframe 사용 시 X-Frame-Options 확인

### 13.5 RAG 서버 422 오류

FastAPI 서버에서 요구하는 요청 필드와 Spring 서버에서 보내는 JSON 필드가 다를 경우 422 오류가 발생할 수 있습니다.

해결 방향:

* Spring DTO와 FastAPI Pydantic 모델 필드명 일치
* `queryText`, `workspaceId`, `topK` 등 필수 필드 확인
* 요청/응답 로그 추가

---

## 14. 향후 개발 계획

### 14.1 단기 계획

* 문서 업로드 안정화
* PDF / TXT 뷰어 개선
* 문서 검색 기능 개선
* 답변 근거 UI 개선
* 채팅 UX 개선
* Swagger 문서 정리
* 예외 처리 통일
* 공통 응답 구조 도입 검토

### 14.2 중기 계획

* OCR 기반 이미지 PDF 처리
* 문서 요약 기능 추가
* 질문 분류 기능 추가
* 답변 캐싱 기능 추가
* 문서별 권한 관리 강화
* S3 기반 파일 저장소 전환
* Jenkins 기반 배포에서 GitHub Actions 기반 CI/CD로 전환
* Blue-Green Deployment 적용

### 14.3 장기 계획

* MSA 전환
* Kafka 기반 이벤트 처리
* 조직 단위 협업 기능
* 문서 변경 이력 관리
* 실시간 스트리밍 답변 제공
* 업무 자동화 기능 확장
* 기업용 SaaS 형태로 확장
