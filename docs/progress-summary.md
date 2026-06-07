# GKE 쇼핑몰 시스템 — 작업 진행 요약

> 작성일: 2026-06-07

---

## 1. 프로젝트 개요

GKE(Google Kubernetes Engine) 기반 쇼핑몰 플랫폼. Buyer/Supplier Frontend 분리, Spring Boot + FastAPI 백엔드, Cloud SQL (PostgreSQL).

### 기술 스택

| 계층 | 기술 |
|---|---|
| Backend | Spring Boot 3.5.6, JDK 21, Gradle |
| AI | FastAPI (추천/검색) |
| Frontend (Buyer) | React 19, Vite 5 |
| Frontend (Supplier) | React 19, Vite 5 |
| Database | PostgreSQL 17 (로컬), Cloud SQL (GCP) |
| Storage | GCS (shopping-mall-public / shopping-mall-private) |
| Auth | JWT (jjwt 0.12.6, HMAC-SHA512) |
| E2E | Playwright 1.60.0 |
| Infra | GKE, Docker, Cloud Run |

---

## 2. 작업 완료 목록

### 2.1 GCS (Google Cloud Storage) 연동

- **GCP 프로젝트** `gke-shop` 생성
- **서비스 어카운트** `gcs-sa` 생성, 키 파일 `~/gcs-sa-key.json` 저장
- **GCS 버킷 2개 생성:**
  - `shopping-mall-public` — public allUsers/objectViewer + CDN
  - `shopping-mall-private` — Signed URL only
- **StorageService.java** — V4 Signed URL 발급 (업로드/다운로드)
- **StorageController** — REST API (`/api/storage/*`)
- **CORS 설정** — localhost:3000, localhost:3001 허용
- **Buyer React 이미지 업로드 UI** — Upload/Change Image 버튼 → Signed URL 발급 → GCS PUT

### 2.2 JWT 인증 시스템

#### 백엔드 (`packages/spring-app/`)

| 파일 | 역할 |
|---|---|
| `model/User.java` | 사용자 엔티티 (id, username, password, role, email) |
| `repository/UserRepository.java` | User JPA Repository |
| `security/JwtTokenProvider.java` | JWT 생성 + 검증 (HMAC-SHA512, 64-byte secret key) |
| `security/JwtAuthenticationFilter.java` | OncePerRequestFilter — Bearer 토큰 → SecurityContext |
| `security/UserDetailsServiceImpl.java` | loadUserByUsername → UserDetails |
| `controller/AuthController.java` | `POST /auth/login`, `POST /auth/register` |
| `dto/LoginRequest.java` | username + password |
| `dto/RegisterRequest.java` | username + password + email + role |
| `dto/AuthResponse.java` | token + username + role |
| `config/SecurityConfig.java` | BCryptPasswordEncoder, stateless session, JWT filter 등록, `/supplier/**` → `hasRole("SUPPLIER")` |
| `build.gradle.kts` | jjwt 0.12.6 의존성 추가 |
| `application.yaml` | `jwt.secret` + `jwt.expiration-ms` 설정 |

**시드 사용자 (data-local.sql):**

| Username | Role | PW (BCrypt) |
|---|---|---|
| techsupplier | SUPPLIER | password123 |
| keycraft | SUPPLIER | password123 |
| buyer1 | BUYER | password123 |
| buyer2 | BUYER | password123 |

#### 프론트엔드 (`packages/react-supplier/`)

| 파일 | 역할 |
|---|---|
| `src/context/AuthContext.tsx` | AuthProvider + useAuth() hook (token/login/logout) |
| `src/components/LoginPage.tsx` | username/password 로그인 폼 |
| `src/api.ts` | `apiFetch<T>` — fetch wrapper with Bearer header |
| `src/App.tsx` | 로그인 상태에 따라 LoginPage ↔ Dashboard 전환 |
| `src/main.tsx` | AuthProvider로 전체 앱 래핑 |

**Vite proxy 설정** — `/auth` 경로를 localhost:8080으로 프록시 (buyer + supplier 둘 다)

### 2.3 Supplier 상품 CRUD

#### 백엔드

| 파일 | 역할 |
|---|---|
| `controller/SupplierProductController.java` | `GET/POST/PUT/DELETE /supplier/products` |
| `dto/ProductRequest.java` | 상품 생성/수정 요청 DTO (name, price, stock, status 등) |
| `dto/ProductResponse.java` | 상품 응답 DTO (id, name, price, status, thumbnailUrl 등) |

**보안:** JWT에서 supplierId 추출 → 제품 소유자 검증 (타 공급업체 제품 접근 차단)

#### 프론트엔드

| 파일 | 역할 |
|---|---|
| `src/components/ProductList.tsx` | 상품 테이블 + Status Badge + Edit/Delete 버튼 |
| `src/components/ProductForm.tsx` | Create/Edit 모달 폼 (htmlFor/id로 접근성 개선) |
| `src/App.tsx` | Dashboard / Products 네비게이션 탭 추가 |

### 2.4 E2E 테스트 (Playwright)

총 **39개 테스트**, 37개 통과, 2개 pre-existing fail (FastAPI 미실행)

#### `e2e/tests/integration.spec.ts` — API 통합 테스트

- Spring Health 엔드포인트 검증
- Buyer 상품 목록 API (카테고리 필터 포함)
- Supplier 대시보드 통계 API
- Supplier 주문 목록 API
- **Supplier 상품 CRUD 5개 테스트** (목록/생성/조회/수정/삭제)
- CORS 헤더 미설정 확인

#### `e2e/tests/supplier.spec.ts` — Supplier 브라우저 테스트

- 페이지 타이틀/헤더 렌더링
- 대시보드 통계 카드 표시
- 시드 데이터 통계값 검증
- 주문 테이블 컬럼 + 상태 Badge
- **상품 탭 이동 + 목록 표시**
- **New Product 모달 열기/닫기** (getByLabel Name/Description/Price/Stock)
- **상품 생성 → 목록에 반영 확인**

#### `e2e/tests/storage.spec.ts` — Storage API 테스트

- Signed URL 발급
- 404 처리
- Content-Type 전달
- 필수 파라미터 검증 (fileName, objectPath)

#### `e2e/tests/buyer.spec.ts` — Buyer 브라우저 테스트

- 상품 목록 렌더링 (5개 active 제품)
- 원화 가격 포맷 (₩)
- 판매자명 + 카테고리 표시
- Draft 제품 제외 확인
- 이미지 업로드 UI (버튼 표시, 업로드 중 disabled, 성공 메시지)

---

## 3. 실행 방법

### 사전 요구사항

| 요구사항 | 버전/설정 |
|---|---|
| PostgreSQL 17 | 네이티브 설치, 데이터베이스 `shop_local` |
| JDK 21 | 환경변수 `JAVA_HOME` |
| Node.js 22 | `.nvmrc` 참조 |
| GCS 서비스 키 | `GOOGLE_APPLICATION_CREDENTIALS=C:\Users\jhlee\gcs-sa-key.json` |

### 로컬 실행

```powershell
# 1. PostgreSQL 실행
$env:PGPASSWORD="postgres"; psql -U postgres -d shop_local -f packages/spring-app/src/main/resources/schema.sql

# 2. Spring Boot 실행
$env:SPRING_PROFILES_ACTIVE="local"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\jhlee\gcs-sa-key.json"
cd packages/spring-app; ./gradlew bootRun

# 3. Buyer Frontend 실행 (포트 3000)
cd packages/react-buyer; npx vite

# 4. Supplier Frontend 실행 (포트 3001)
cd packages/react-supplier; npx vite --port 3001 --strictPort

# 5. E2E 테스트 실행
cd e2e; npx playwright test
```

### 환경변수

| 변수 | 설명 |
|---|---|
| `SPRING_PROFILES_ACTIVE=local` | 로컬 프로파일 (data-local.sql 실행) |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCS 서비스 계정 키 경로 |
| `JWT_SECRET` | JWT signing key (선택, 기본값 내장) |
| `DB_URL` | PostgreSQL JDBC URL (선택) |
| `DB_USER` / `DB_PASSWORD` | DB 접속 계정 (선택) |

---

## 4. 파일 구조

```
packages/
├── react-buyer/                 # Buyer Frontend
│   ├── src/
│   │   ├── App.tsx              # 메인 앱
│   │   ├── components/          # ProductCard, UploadButton 등
│   │   └── vite.config.ts       # Vite proxy (/api, /auth → :8080)
│   └── package.json
├── react-supplier/              # Supplier Frontend
│   ├── src/
│   │   ├── App.tsx              # Dashboard + Products 탭
│   │   ├── main.tsx             # AuthProvider 래핑
│   │   ├── api.ts               # apiFetch Bearer wrapper
│   │   ├── context/AuthContext.tsx  # JWT 로그인 상태 관리
│   │   └── components/
│   │       ├── LoginPage.tsx     # 로그인 폼
│   │       ├── ProductList.tsx   # 상품 목록 테이블
│   │       └── ProductForm.tsx   # 상품 생성/수정 모달
│   └── vite.config.ts
├── spring-app/                  # Spring Boot Backend
│   ├── src/main/java/com/shop/
│   │   ├── config/
│   │   │   └── SecurityConfig.java  # JWT + Role 인증 설정
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java    # JWT 생성/검증
│   │   │   ├── JwtAuthenticationFilter.java  # Bearer 필터
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── controller/
│   │   │   ├── AuthController.java      # /auth/login, /auth/register
│   │   │   ├── SupplierProductController.java  # 상품 CRUD
│   │   │   ├── StorageController.java   # GCS Signed URL
│   │   │   └── BuyerProductController.java  # Buyer 상품 목록
│   │   ├── model/
│   │   │   ├── Product.java
│   │   │   └── User.java                # 사용자 엔티티
│   │   ├── repository/
│   │   │   ├── ProductRepository.java
│   │   │   └── UserRepository.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java, RegisterRequest.java
│   │   │   ├── AuthResponse.java
│   │   │   ├── ProductRequest.java, ProductResponse.java
│   │   │   └── ... (Storage DTOs)
│   │   └── service/
│   │       └── StorageService.java      # GCS V4 Signed URL
│   └── src/main/resources/
│       ├── application.yaml      # JWT + DB 설정
│       ├── schema.sql
│       └── data-local.sql        # 시드 데이터 (users, products, orders)
├── fastapi-ai/                   # FastAPI AI (추천/검색)
└── shared-ui/ shared-hooks/ shared-types/  # (준비 중)
e2e/
├── tests/
│   ├── integration.spec.ts       # API 통합 테스트 (JWT + CRUD)
│   ├── supplier.spec.ts          # Supplier 브라우저 테스트
│   ├── buyer.spec.ts             # Buyer 브라우저 테스트
│   └── storage.spec.ts           # GCS Storage API 테스트
├── playwright.config.ts
└── .auth/                        # auth.json (Playwright auth state)
```

---

## 5. 주요 설계 결정

| 결정 | 사유 |
|---|---|
| JWT HMAC-SHA512, 64-byte hex key | 충분한 보안 강도, 대칭키로 단순 운영 |
| jjwt 0.12.6 | Spring Boot 3.5.6 호환, 최신 안정 버전 |
| V4 Signed URL (V2에서 migration) | V2 SignatureDoesNotMatch 오류 수정 |
| GCS public 버킷: Uniform + allUsers/objectViewer | CDN 연동 용이 |
| JWT principal name = user.getId() (UUID) | 숫자/문자열 ID 충돌回避 |
| Supplier role: `hasRole("SUPPLIER")` | SecurityConfig에서 path-based 인가 |
| E2E 브라우저 테스트: `addInitScript` | JWT를 localStorage에 주입하여 인증된 세션 시뮬레이션 |
| Supplier React: react-router 미사용 | 단순한 탭 전환만 필요, 불필요한 의존성 배제 |
| ProductForm: inline styles + modal overlay | react-router 불필요, 컴포넌트 단순성 유지 |
| Label-Input: htmlFor/id 연결 | Playwright getByLabel 호환 + 웹 접근성 향상 |

---

## 6. 테스트 현황

```
  ✓ 37 passed (16.5s)
  ✘ 2 failed (FastAPI 서버 미실행)
```

### 통과 테스트 (37)

| 테스트 파일 | 개수 | 내용 |
|---|---|---|
| integration.spec.ts | 12 | API 통합 (Health, Buyer, Supplier, CRUD, CORS) |
| supplier.spec.ts | 9 | Supplier UI (대시보드, 주문, 상품 CRUD) |
| buyer.spec.ts | 10 | Buyer UI (상품 목록, 가격, 이미지 업로드) |
| storage.spec.ts | 6 | GCS Signed URL 발급/검증 |

### 실패 테스트 (2, pre-existing)

| 테스트 | 원인 |
|---|---|
| FastAPI Health → UP | FastAPI 서버 미실행 (Connection refused) |
| Recommendation → user_id | FastAPI 서버 미실행 (Connection refused) |

---

## 7. 향후 계획

우선순위 순:

1. ~~data-local.sql ON CONFLICT thumbnail_url 누락 수정~~ ✅ 완료
2. Buyer React JWT 로그인 UI (현재 permitAll)
3. Buyer role enforcement (BUYER role 추가)
4. Redis/Memorystore 캐싱
5. Buyer 장바구니/주문 시스템
6. GCP 배포 (Cloud Run → GKE)
7. GitHub Actions CI/CD (E2E 테스트 자동화)
