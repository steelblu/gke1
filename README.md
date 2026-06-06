# GKE 쇼핑몰 시스템

> **GKE** 기반 쇼핑몰 플랫폼 — Buyer/Supplier Frontend 분리, Spring + FastAPI, Cloud SQL (PostgreSQL)

---

## 전체 아키텍처

```mermaid
flowchart TB
    subgraph Client["클라이언트"]
        B[Buyer Browser<br/>buyer.gke1.com]
        S[Supplier Browser<br/>supplier.gke1.com]
    end

    subgraph Frontend["Frontend Layer — React (Monorepo)"]
        FB["react-buyer<br/>상품 목록/장바구니/결제"]
        FS["react-supplier<br/>대시보드/상품관리/통계"]
        SHARED["shared-ui / shared-hooks<br/>공통 컴포넌트"]
    end

    subgraph Backend["Backend Layer — Spring"]
        GW["Spring Security<br/>(JWT + Role Auth)"]
        BC["Buyer Controller<br/>/buyer/api/*"]
        SC["Supplier Controller<br/>/supplier/api/*"]
        SRV["Service Layer<br/>Product / Order / Payment"]
    end

    subgraph AI["AI Layer — FastAPI"]
        AI_SVC["추천 / 검색 / 이미지 처리"]
    end

    subgraph Storage["Data Layer"]
        PG[("Cloud SQL<br/>PostgreSQL")]
        RD[("Memorystore<br/>Redis Cache")]
    end

    B -->|HTTPS| FB
    S -->|HTTPS| FS
    FB -->|REST API| BC
    FS -->|REST API| SC
    BC --> GW
    SC --> GW
    GW --> SRV
    SRV --> PG
    SRV --> RD
    SRV -->|내부 HTTP/gRPC| AI_SVC
    AI_SVC -.->|읽기 전용| PG
```

---

## 주요 데이터 흐름

### 상품 목록 조회 (Buyer)

```mermaid
sequenceDiagram
    participant Buyer as React (Buyer)
    participant Spring as Spring API
    participant Cache as Redis
    participant DB as Cloud SQL
    participant AI as FastAPI

    Buyer->>Spring: GET /buyer/api/v1/products?category=electronics
    Spring->>Cache: 조회 (TTL 5min)
    alt Cache Hit
        Cache-->>Spring: 캐시된 데이터
    else Cache Miss
        Spring->>DB: SELECT ... WHERE status='active'
        DB-->>Spring: 결과
        Spring->>Cache: 저장
    end
    Spring-->>Buyer: JSON (ProductSummary[])
    Note over Buyer: ProductCard 리스트 렌더링
```

### 상품 등록 (Supplier)

```mermaid
sequenceDiagram
    participant Seller as React (Supplier)
    participant Spring as Spring API
    participant DB as Cloud SQL

    Seller->>Spring: POST /supplier/api/v1/products
    Note over Seller: JWT (role: SUPPLIER)
    Spring->>Spring: hasRole("SUPPLIER") 확인
    Spring->>DB: INSERT INTO products
    Spring-->>Seller: 201 Created
    Note over Seller: 상품 목록으로 리다이렉트
```

---

## 인프라 (GKE)

```mermaid
graph LR
    subgraph GKE Cluster
        subgraph "Namespace: buyer"
            IB[Ingress<br/>buyer.gke1.com] --> RB[Pod: react-buyer<br/>Nginx x2]
        end
        subgraph "Namespace: supplier"
            IS[Ingress<br/>supplier.gke1.com] --> RS[Pod: react-supplier<br/>Nginx x2]
        end
        subgraph "Namespace: api"
            RB --> SA[Pod: spring-app<br/>JVM x2-3]
            RS --> SA
            SA --> CS[Sidecar: cloud-sql-proxy]
            SA --> AI[Pod: fastapi-ai<br/>GPU x1-2]
        end
    end
    CS --> PG[Cloud SQL<br/>PostgreSQL]
    SA --> RD[Memorystore<br/>Redis]
    AI -.->|read-only| PG
```

---

## 시작하기

```bash
# Monorepo 구조
packages/
├── shared-ui/       # 공통 UI 컴포넌트
├── shared-hooks/    # 공통 React Hooks
├── shared-types/    # TypeScript interfaces
├── buyer/           # Buyer Frontend
└── supplier/        # Supplier Frontend
```

---

## 핵심 설계 원칙

- **Spring 단일 App 유지** — Security + NetworkPolicy로 Buyer/Supplier 격리, 분할은 팀/배포주기가 갈릴 때
- **AI 격리** — FastAPI는 비즈니스 트랜잭션에 직접 관여하지 않음, DB는 read-only
- **Role 기반 인가** — `BUYER` / `SUPPLIER` role로 endpoint 접근 제어
- **공유 컴포넌트** — 완전히 동일한 UI만 `shared-ui`, UX가 다르면 각 패키지에서 별도 구현

> 상세 문서: [gke.md](gke.md)
