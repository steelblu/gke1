# GKE 쇼핑몰 시스템 아키텍처

## 시스템 구성

| 레이어 | 기술 스택 | 역할 |
|---|---|---|
| Frontend (Buyer) | React | 바이어용 상품 목록/상세/장바구니/결제 |
| Frontend (Supplier) | React | 공급자용 대시보드/상품관리/주문관리 |
| Business API | Spring (Java) | 비즈니스 로직, API Gateway, BFF |
| AI | FastAPI (Python) | 추천/검색/이미지 처리 |
| Database | Google Cloud SQL for PostgreSQL | 트랜잭션 데이터 |
| Infra | GKE (Google Kubernetes Engine) | 컨테이너 오케스트레이션 |

---

## Frontend 아키텍처 (Monorepo)

```
monorepo/
├── packages/
│   ├── shared-ui/               # 공통 컴포넌트 (Button, Card, Table, Modal, Pagination)
│   ├── shared-hooks/            # 공통 훅 (useAuth, usePagination, useDebounce)
│   ├── shared-types/            # TypeScript interface 공유 (Product, Order, User)
│   ├── buyer/                   # 바이어용 frontend
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── product-list/      # 상품 목록 (필터/검색/정렬/카드형)
│   │       │   ├── product-detail/    # 상품 상세 (이미지/리뷰/옵션선택)
│   │       │   ├── cart/              # 장바구니
│   │       │   ├── checkout/          # 결제
│   │       │   ├── orders/            # 주문 내역
│   │       │   └── my-page/           # 마이페이지
│   │       └── components/            # buyer 전용 컴포넌트
│   └── supplier/                # 공급자용 frontend
│       └── src/
│           ├── pages/
│           │   ├── dashboard/         # 대시보드 (매출/주문/방문자 통계)
│           │   ├── products/          # 상품 등록/수정/관리 (테이블형)
│           │   ├── orders/            # 주문 관리 (접수/발송/환불)
│           │   ├── inventory/         # 재고 관리
│           │   └── statistics/        # 매출 통계
│           └── components/            # supplier 전용 컴포넌트
├── turbo.json / nx.json
└── package.json                     # workspace root
```

### Buyer / Supplier 구분 기준

| 영역 | Buyer | Supplier |
|---|---|---|
| 테마 | 상품 중심, 이미지/가격 강조 | 데이터 중심, 테이블/차트 |
| 레이아웃 | 모바일 퍼스트, 카드형 | 데스크탑 퍼스트, 리스트형 |
| 네비게이션 | 카테고리, 검색, 장바구니 | 대시보드, 상품관리, 주문관리 |
| 인증 | 이메일/소셜 로그인 | ID/비번 + 2FA |
| API 권한 | `/buyer/api/*` | `/supplier/api/*` |
| 빌드 | `yarn build:buyer` | `yarn build:supplier` |
| Docker 이미지 | `gcr.io/.../react-buyer` | `gcr.io/.../react-supplier` |

### 공유 컴포넌트 전략

- 완전히 동일한 UI → `shared-ui`에 배치
- 단순 role 분기만 있는 경우 → `shared-ui`에 `isSupplier` prop으로 분기
- UX 자체가 완전히 다른 경우 → 각 패키지에서 별도 구현 (중복 허용)

---

## Backend API 구조

### Endpoint 구성

```
/buyer/api/v1/*
  GET    /products                    상품 목록 (페이징, 필터, 정렬)
  GET    /products/{id}               상품 상세
  POST   /cart                        장바구니 담기
  GET    /cart                        장바구니 조회
  POST   /orders                      주문 생성
  GET    /orders/{id}                 주문 내역
  POST   /payments/confirm            결제 승인

/supplier/api/v1/*
  GET    /dashboard/stats             대시보드 통계
  POST   /products                    상품 등록
  PUT    /products/{id}               상품 수정
  DELETE /products/{id}               상품 삭제
  PATCH  /inventory/batch             재고 일괄 수정
  GET    /orders                      주문 관리 (필터: 기간/상태)
  PUT    /orders/{id}/status          주문 상태 변경
  GET    /statistics/sales            매출 통계

/common/api/v1/*
  POST   /auth/login                  로그인
  POST   /auth/refresh                토큰 갱신
  GET    /users/me                    내 정보
  POST   /auth/register               회원가입
```

### Spring Security 권한 제어

```java
"/buyer/api/**"   → hasRole("BUYER") or hasRole("ADMIN")
"/supplier/api/**" → hasRole("SUPPLIER") or hasRole("ADMIN")
"/common/api/**"  → permitAll() 또는 authenticated()
```

---

## 데이터 흐름

### Buyer: 상품 목록 조회

```
React (Buyer)
  └─ useEffect → fetch('/buyer/api/v1/products?page=1&size=20&category=electronics')
      └─ Spring ProductController
          └─ Spring ProductService
              └─ SELECT * FROM products WHERE category = ? AND status = 'active'
                   ORDER BY created_at DESC LIMIT ? OFFSET ?
              └─ Redis Cache (hot products, TTL 5min, cache-aside)
          └─ DTO → ProductSummary(id, name, price, thumbnailUrl, sellerName)
      └─ JSON Response
  └─ React 렌더링 → ProductCard 컴포넌트 리스트 + Pagination
```

### Supplier: 상품 관리

```
React (Supplier)
  └─ useEffect → fetch('/supplier/api/v1/products?page=1&status=draft')
      └─ Spring SupplierProductController
          └─ Spring ProductService (supplierId로 필터)
              └─ SELECT * FROM products WHERE supplier_id = ? AND status = ?
              └─ 추가: 재고수, 노출수, 클릭률 등 supplier용 통계 포함
      └─ JSON Response (buyer용과 다른 DTO: 재고/가격설정/상태포함)
  └─ React 렌더링 → ProductTable + Edit 버튼
```

---

## Database Schema (PostgreSQL)

```sql
-- Core
CREATE SCHEMA core;

CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'BUYER',  -- 'BUYER', 'SUPPLIER', 'ADMIN'
    name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Product
CREATE TABLE core.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES core.users(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,              -- 소수점 없는 정수 (원 기준)
    stock INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'out_of_stock', 'discontinued'
    category VARCHAR(100),
    metadata JSONB,                      -- 카테고리별 동적 필드
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE core.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES core.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0
);

-- Order
CREATE TABLE core.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES core.users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'canceled'
    total_amount BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE core.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES core.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES core.products(id),
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL
);
```

---

## GKE 배포

### Ingress + Domain

```
buyer.gke1.com       → React (Buyer)   → /api/buyer/*  → Spring Buyer Controller
supplier.gke1.com    → React (Supplier) → /api/supplier/* → Spring Supplier Controller
api.gke1.com         → (직접 접근 차단, internal only)
```

### Ingress 예시

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop-ingress
  annotations:
    kubernetes.io/ingress.global-static-ip-name: "shop-static-ip"
    networking.gke.io/managed-certificates: "shop-cert"
spec:
  rules:
  - host: buyer.gke1.com
    http:
      paths:
      - path: /*
        backend:
          service:
            name: react-buyer
            port:
              number: 80
  - host: supplier.gke1.com
    http:
      paths:
      - path: /*
        backend:
          service:
            name: react-supplier
            port:
              number: 80
  - host: api.gke1.com
    http:
      paths:
      - path: /buyer/api/*
        backend:
          service:
            name: spring-app
            port:
              number: 8080
      - path: /supplier/api/*
        backend:
          service:
            name: spring-app
            port:
              number: 8080
```

### Service 구조

| Service | Deployment | Replicas | HPA 기준 |
|---|---|---|---|
| react-buyer | Nginx 정적 서빙 | 2 | CPU 70% |
| react-supplier | Nginx 정적 서빙 | 2 | CPU 70% |
| spring-app | Spring Boot (JVM) | 2-3 | CPU 70% |
| fastapi-ai | FastAPI (GPU node pool) | 1-2 | GPU utilization |
| cloud-sql-proxy | Sidecar (spring-app과 함께) | - | - |

---

## 서비스 간 통신

```
[Client] ──HTTPS──> [Ingress] ──> [React (Nginx)] ──> [Spring (REST)]
                                                      │
                                                      ├──> [Cloud SQL] (JDBC)
                                                      ├──> [Redis] (Cache)
                                                      └──> [FastAPI] (gRPC or HTTP) — AI 추천/검색
```

- **Spring ↔ Cloud SQL**: JDBC (직접 연결 or Cloud SQL Proxy sidecar)
- **Spring ↔ Redis**: Memorystore Redis (세션/캐시)
- **Spring ↔ FastAPI**: 내부 ClusterIP Service, HTTP or gRPC
- **FastAPI ↔ Cloud SQL**: 읽기 전용 DB User, AI 전용 view/테이블만 접근

---

## AI 레이어 (FastAPI) 격리 원칙

- FastAPI는 **비즈니스 트랜잭션에 직접 관여하지 않음**
- 결제/주문/재고 변경 등은 **Spring만 담당**
- FastAPI는 Spring API를 통해 구독/권한 상태를 확인하거나, 전용 read-only DB view 조회
- AI가 필요한 데이터는 전용 테이블/뷰를 통해 읽기 전용으로 제공

---

## Spring App 분할 검토 (Buyer API / Supplier API)

### 검토: 단일 Spring App vs 두 개로 분할

| 항목 | 단일 App | 분할 App |
|---|---|---|
| **공격 표면** | Buyer/Supplier 모든 endpoint가 동일 프로세스 | Buyer App에 Supplier endpoint가 없음 |
| **종속성 공격** | Supplier용 라이브러리(Excel/PDF)가 Buyer에도 영향 | 분리되어 전파 안 됨 |
| **Blast Radius** | 취약점 하나로 두 도메인 모두 영향 | 한쪽만 영향 |
| **Network Policy** | Pod 하나라 세밀한 제어 어려움 | 각자 다른 Network Policy 적용 가능 |
| **DB 격리** | 동일 DB user / schema | 분할해도 DB는 보통 공유 → 격리 효과 없음 |
| **운영 복잡도** | 낮음 (Deployment 1개, Secret 1벌) | 2배 (실수 가능성 증가) |

### 판단: 보안 이점은 미미함

**Spring Security로 이미 endpoint 수준 격리가 완료됨.**

```java
// 단일 App에서도 아래 설정이면 Buyer가 Supplier endpoint 접근 불가
.requestMatchers("/buyer/**").hasRole("BUYER")
.requestMatchers("/supplier/**").hasRole("SUPPLIER")
```

**진짜 보안 격리를 원한다면 분할이 아니라 DB 격리가 우선:**

```yaml
# 같은 Pod, 다른 NetworkPolicy — App 분할 없이 network 격리 가능
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: buyer-api-policy
spec:
  podSelector:
    matchLabels:
      role: buyer-api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: buyer-frontend
```

```sql
-- 동일 PostgreSQL, 다른 schema + 다른 DB user
CREATE USER buyer_user WITH PASSWORD '...';
GRANT USAGE ON SCHEMA buyer TO buyer_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA buyer TO buyer_user;

CREATE USER supplier_user WITH PASSWORD '...';
GRANT USAGE ON SCHEMA supplier TO supplier_user;
GRANT ALL ON ALL TABLES IN SCHEMA supplier TO supplier_user;
```

### 분할이 정당한 경우 (보안 외 이유)

| 상황 | 이유 |
|---|---|
| **배포 주기 차이** | Buyer: 주 3회 / Supplier: 월 1회 → 분할하면 Buyer 배포가 Supplier에 영향 없음 |
| **스케일링 요구 차이** | Buyer는 트래픽 1000x, Supplier는 10x → 각각 HPA 운영 필요 |
| **리소스 프로파일 차이** | Supplier가 Excel 생성 등 무거운 작업 → 별도 리소스 할당 |
| **팀 분리** | Buyer팀 / Supplier팀 각자 CI/CD 소유 |

### 권장

```
초기: 단일 Spring App 유지 (Security + NetworkPolicy + DB Schema로 격리)
  ↓ 필요시
팀/배포주기/스케일링 요구가 분명히 갈릴 때 분할
```

---

## CI/CD 파이프라인 (Cloud Build 예시)

```
Git Push (monorepo)
  └─ Cloud Build Trigger
      ├─ packages/buyer/ 변경 → build:buyer → push gcr.io/.../react-buyer
      ├─ packages/supplier/ 변경 → build:supplier → push gcr.io/.../react-supplier
      ├─ spring-app/ 변경 → gradle build → push gcr.io/.../spring-app
      └─ fastapi/ 변경 → poetry build → push gcr.io/.../fastapi-ai
```

---

## 보안

- **Network Policy**: FastAPI → Cloud SQL은 특정 테이블만 SELECT 가능
- **Cloud SQL IAM**: Spring은 full access, FastAPI는 read-only user
- **JWT 인증**: Spring Security에서 발급/검증, FastAPI는 JWT public key로 검증
- **Webhook**: Stripe/Toss webhook은 signature 검증 필수
