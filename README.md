# EVIDO

### 🔗 **[EVIDO-AI 서비스 바로가기](https://www.evido.site)**  

<img width="1615" height="936" alt="image" src="https://github.com/user-attachments/assets/59951d10-8994-4e5e-8fb7-acf1e8d7eb20" />



## 1. 프로젝트 개요

**EVIDO**는 사용자가 업로드한 문서를 기반으로 질문에 답변하고, 답변의 근거가 되는 문서 조각을 함께 제공하는 **문서 기반 AI 검색 및 질의응답 서비스**입니다.

기존의 일반적인 AI 챗봇은 답변의 출처가 불분명하거나 사용자의 실제 문서 내용을 정확히 반영하지 못하는 한계가 있습니다. EVIDO는 사용자의 문서를 워크스페이스 단위로 관리하고, 문서 내용을 벡터화하여 검색한 뒤, 검색된 근거를 기반으로 답변을 생성합니다.

이를 통해 사용자는 긴 문서를 직접 읽지 않아도 필요한 정보를 빠르게 찾을 수 있으며, AI 답변이 어떤 문서 내용을 근거로 생성되었는지 확인할 수 있습니다.

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

* MySQL 또는 MariaDB
* Redis
* Docker
* Jenkins
* Nginx
* AWS EC2
* AWS RDS 확장 가능
* AWS S3 확장 가능
* Vercel

---

## 5. 전체 시스템 구조

<img width="1565" height="752" alt="제목 없는 다이어그램 drawio" src="https://github.com/user-attachments/assets/47b8963c-0838-455b-bcf1-9ea70ef0ad19" />

## 시스템 아키텍처 설명

EVIDO는 사용자가 업로드한 문서를 기반으로 질문에 답변하고, 답변의 근거까지 제공하는 문서 기반 AI 질의응답 서비스입니다. 전체 시스템은 크게 **Client / Frontend**, **Backend API**, **AI / RAG**, **Data / Storage**, **CI/CD & Infra** 영역으로 구성됩니다.

### 1. Client / Frontend

사용자는 브라우저를 통해 EVIDO에 접속합니다.  
프론트엔드는 React 기반으로 구현되었으며, Vite를 사용해 빠른 개발 환경과 빌드 환경을 구성했습니다. Tailwind CSS를 활용하여 UI를 구성하고, PDF Viewer / Export 기능을 통해 사용자가 업로드한 문서를 화면에서 확인할 수 있도록 설계했습니다.

프론트엔드는 사용자 질문, 문서 조회, 문서 업로드, 대화 조회 등의 요청을 백엔드 API 서버로 전달합니다.

### 2. Backend API

백엔드 API 서버는 EVIDO의 핵심 비즈니스 로직을 담당합니다.  
외부 요청은 NGINX Reverse Proxy를 통해 Spring Boot API Server로 전달됩니다.

Spring Boot 서버는 다음과 같은 역할을 수행합니다.

- 사용자 인증 및 인가 처리
- 워크스페이스 관리
- 문서 메타데이터 관리
- 대화 및 메시지 저장
- 문서 기반 질문 요청 처리
- RAG 서버와의 연동
- 데이터베이스 및 캐시 저장소와의 연동

Spring Security를 통해 인증과 권한 검사를 수행하며, Spring Data JPA를 통해 MariaDB 또는 RDS와 데이터를 주고받습니다.  
서버는 Docker Container로 패키징하여 배포 환경에서 일관되게 실행될 수 있도록 구성했습니다.

### 3. AI / RAG

AI / RAG 영역은 사용자의 질문에 대해 문서 기반 답변을 생성하는 역할을 담당합니다.  
Spring Boot API 서버에서 질문 요청을 받으면 FastAPI 기반 RAG Server로 전달됩니다.

RAG 서버는 질문을 임베딩하고, Qdrant Vector DB에서 관련 문서 청크를 검색합니다.  
검색된 문서 조각은 LLM에 전달할 근거 Context로 조립되며, Ollama 또는 Gemini와 같은 LLM을 통해 최종 답변이 생성됩니다.

이 구조를 통해 EVIDO는 단순한 일반 AI 답변이 아니라, 사용자가 업로드한 문서 내용을 기반으로 한 근거 있는 답변을 제공할 수 있습니다.

### 4. Data / Storage

EVIDO는 서비스 데이터와 문서 데이터를 목적에 따라 분리하여 저장합니다.

- **MariaDB**: 문서 메타데이터, 사용자, 워크스페이스, 대화 정보 저장
- **Redis**: 인증 토큰, 세션, 캐시 데이터 저장
- **AWS S3**: 업로드된 원본 문서 파일 저장
- **AWS RDS**: 운영 환경에서 사용하는 관리형 관계형 데이터베이스

문서 원본은 S3에 저장하고, 문서 정보와 대화 기록은 관계형 데이터베이스에 저장합니다.  
Redis는 빠른 조회가 필요한 인증 정보나 캐시 데이터를 관리하는 데 사용됩니다.

### 5. CI/CD & Infra

EVIDO는 GitHub에 저장된 코드를 기반으로 자동 배포 환경을 구성합니다.  
현재 구조에서는 GitHub, Jenkins, Docker, AWS EC2, NGINX를 활용한 배포 흐름을 나타냅니다.

배포 흐름은 다음과 같습니다.

```text
GitHub
→ Jenkins
→ Docker Build & Push
→ AWS EC2
→ NGINX Reverse Proxy
→ Production

---

## 6. 아키텍처 설계

EVIDO는 유지보수성과 확장성을 고려하여 **헥사고날 아키텍처**를 기반으로 설계했습니다.

### 6.1 헥사고날 아키텍처 적용 이유

* 비즈니스 로직과 외부 기술을 분리하기 위해
* DB, 외부 API, RAG 서버 변경에 유연하게 대응하기 위해
* 테스트 가능한 구조를 만들기 위해
* 향후 MSA 전환 시 도메인 분리가 쉽도록 하기 위해

---

## 7. RAG 처리 흐름

### 7.1 문서 업로드 후 처리 흐름

```text
문서 업로드
  ↓
파일 저장
  ↓
문서 메타데이터 저장
  ↓
RAG 서버에 문서 처리 요청
  ↓
문서 텍스트 추출
  ↓
청크 분할
  ↓
임베딩 생성
  ↓
Qdrant에 벡터 저장
  ↓
문서 처리 완료 상태 반영
```

### 7.2 질문 처리 흐름

```text
사용자 질문 입력
  ↓
Spring 서버에서 권한 확인
  ↓
사용자 메시지 저장
  ↓
RAG 서버로 질문 전달
  ↓
질문 임베딩 생성
  ↓
Qdrant에서 관련 청크 검색
  ↓
검색 결과 기반 프롬프트 구성
  ↓
LLM 답변 생성
  ↓
AI 메시지 저장
  ↓
답변과 근거 반환
```

---

## 8. 프론트엔드 화면 구성

### 8.1 주요 화면

* 로그인 화면
* 워크스페이스 선택 화면
* 메인 채팅 화면
* 문서 목록 화면
* 문서 업로드 화면
* 문서 뷰어 화면
* 도움말 / 사용자 매뉴얼 화면

### 8.2 메인 레이아웃

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

### 8.3 채팅 화면 요구사항

* GPT 스타일 대화 UI
* 사용자 메시지와 AI 메시지 구분
* 전체 채팅 영역 스크롤
* 답변 생성 중 로딩 표시
* 답변 아래 근거 표시
* 근거 영역 접기/펼치기
* 새 대화 버튼
* 워크스페이스 이동 기능

### 8.4 문서 뷰어 요구사항

* PDF 파일 미리보기
* TXT 파일 내용 표시
* 문서 내 검색
* 검색 결과 하이라이트
* 줄 번호 표시 옵션
* 다운로드 버튼
* 문서 목록으로 돌아가기

---

## 9. 인증 및 보안 설계

### 9.1 인증 방식

EVIDO는 JWT 기반 인증 방식을 사용합니다.

* Access Token: 짧은 만료 시간
* Refresh Token: 긴 만료 시간
* HttpOnly Cookie 저장
* Secure 옵션 적용
* SameSite=None 적용

### 9.2 인증 흐름

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

### 9.3 권한 확인

* 사용자는 자신이 속한 워크스페이스에만 접근할 수 있다.
* 문서는 워크스페이스 기준으로 접근이 제한된다.
* 대화 역시 워크스페이스 권한을 기준으로 조회된다.
* 삭제된 문서는 기본 목록에서 제외된다.

---

## 10. 배포 구조

### 10.1 현재 배포 구조

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

### 10.2 프론트엔드 배포

```text
[GitHub]
   ↓
[Vercel]
   ↓
[evido.site]
```

### 10.3 인프라 구성 요소

* EC2: Spring 서버, Jenkins, Docker, Nginx 실행
* Vercel: React 프론트엔드 배포
* MySQL/RDS: 서비스 데이터 저장
* Redis: Refresh Token 및 캐시 저장
* Qdrant: 문서 벡터 저장
* RAG Server: FastAPI 기반 AI 검색/응답 서버

---

## 11. Docker 배포 예시

### 11.1 Dockerfile 예시

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

### 11.2 컨테이너 실행 예시

```bash
docker run -d \
  --name evido-app \
  -p 8081:8080 \
  --env-file .env \
  evido-app
```

---

## 12. CI/CD 전략

### 12.1 Jenkins 기반 자동 배포

1. GitHub에 코드 push
2. GitHub Webhook이 Jenkins 빌드 트리거
3. Jenkins가 프로젝트 checkout
4. Gradle build 수행
5. Docker image 생성
6. 기존 컨테이너 중지 및 삭제
7. 새 컨테이너 실행
8. Nginx를 통해 서비스 제공

### 12.2 Blue-Green 배포 확장 전략

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

## 13. MSA 전환 계획

현재는 모듈형 모놀리식 구조를 기반으로 개발하고, 향후 서비스가 커질 경우 MSA로 분리할 수 있습니다.

### 13.1 분리 후보 서비스

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

### 13.2 MSA 전환 시 고려사항

* 서비스 간 통신 방식 결정
* 인증 정보 전달 방식 결정
* DB 분리 전략 수립
* 분산 트랜잭션 최소화
* 이벤트 기반 통신 도입 검토
* Kafka 또는 RabbitMQ 도입 검토
* 서비스별 독립 배포 전략 수립
* Gateway 도입 검토

---

## 14. 예외 처리 전략

### 14.1 공통 예외 처리

* GlobalExceptionHandler 사용
* 비즈니스 예외와 시스템 예외 분리
* 일관된 에러 응답 구조 제공

### 14.2 예외 응답 예시

```json
{
  "success": false,
  "code": "DOCUMENT_NOT_FOUND",
  "message": "문서를 찾을 수 없습니다."
}
```

### 14.3 주요 예외

| Code                     | Description |
| ------------------------ | ----------- |
| `UNAUTHORIZED`           | 인증되지 않은 사용자 |
| `FORBIDDEN`              | 접근 권한 없음    |
| `WORKSPACE_NOT_FOUND`    | 워크스페이스 없음   |
| `DOCUMENT_NOT_FOUND`     | 문서 없음       |
| `CONVERSATION_NOT_FOUND` | 대화 없음       |
| `RAG_SERVER_ERROR`       | RAG 서버 오류   |
| `FILE_UPLOAD_FAILED`     | 파일 업로드 실패   |

---

## 15. 공통 응답 구조

EVIDO는 API 응답의 일관성을 위해 공통 응답 구조를 사용할 수 있습니다.

### 15.1 성공 응답 예시

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "기본 워크스페이스"
  },
  "message": "요청이 성공했습니다."
}
```

### 15.2 실패 응답 예시

```json
{
  "success": false,
  "code": "FORBIDDEN",
  "message": "접근 권한이 없습니다."
}
```

주의할 점은 공통 응답 구조를 도입하면 프론트엔드에서 기존 응답 처리 코드를 함께 수정해야 합니다.

---

## 16. 개발 중 발생한 주요 이슈와 해결 방향

### 16.1 CORS 문제

프론트엔드 도메인과 백엔드 도메인이 다르기 때문에 CORS 설정이 필요했습니다.

해결 방향:

* 로컬 개발 주소 허용
* Vercel 프론트엔드 주소 허용
* 운영 도메인 허용
* 쿠키 인증을 위해 `allowCredentials(true)` 설정
* allowedOrigins에는 trailing slash가 없는 정확한 origin 사용

### 16.2 OAuth2 Redirect URI 문제

Google OAuth2 로그인 시 프론트엔드 주소와 백엔드 redirect URI 설정이 맞아야 합니다.

해결 방향:

* 승인된 JavaScript 원본에 프론트엔드 도메인 등록
* 승인된 리디렉션 URI에 백엔드 OAuth2 callback URI 등록
* 운영 환경과 로컬 환경을 분리하여 관리

### 16.3 Vercel 환경변수 문제

프론트엔드에서 백엔드 API 주소를 사용하기 위해 `VITE_API_BASE_URL` 환경변수가 필요했습니다.

해결 방향:

* Vercel Project Settings에서 환경변수 등록
* 환경변수 변경 후 재배포 수행
* VITE_ prefix가 붙은 값은 브라우저에 노출된다는 점 고려

### 16.4 문서 뷰어 라우팅 문제

문서 파일 API 경로를 프론트엔드 라우터가 처리하려고 하면서 문제가 발생할 수 있습니다.

해결 방향:

* API 요청은 Axios 또는 실제 백엔드 URL로 요청
* React Router 경로와 API 경로를 분리
* PDF iframe 사용 시 X-Frame-Options 확인

### 16.5 RAG 서버 422 오류

FastAPI 서버에서 요구하는 요청 필드와 Spring 서버에서 보내는 JSON 필드가 다를 경우 422 오류가 발생할 수 있습니다.

해결 방향:

* Spring DTO와 FastAPI Pydantic 모델 필드명 일치
* `queryText`, `workspaceId`, `topK` 등 필수 필드 확인
* 요청/응답 로그 추가

---

## 17. 향후 개발 계획

### 17.1 단기 계획

* 문서 업로드 안정화
* PDF / TXT 뷰어 개선
* 문서 검색 기능 개선
* 답변 근거 UI 개선
* 채팅 UX 개선
* Swagger 문서 정리
* 예외 처리 통일
* 공통 응답 구조 도입 검토

### 17.2 중기 계획

* OCR 기반 이미지 PDF 처리
* 문서 요약 기능 추가
* 질문 분류 기능 추가
* 답변 캐싱 기능 추가
* 문서별 권한 관리 강화
* S3 기반 파일 저장소 전환
* GitHub Actions 기반 CI/CD 검토

### 17.3 장기 계획

* MSA 전환
* Kafka 기반 이벤트 처리
* 조직 단위 협업 기능
* 문서 변경 이력 관리
* 실시간 스트리밍 답변 제공
* 업무 자동화 기능 확장
* 기업용 SaaS 형태로 확장
