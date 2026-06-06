# =============================================================================
# Stage 1: Build (Node)
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (shared packages + supplier)
COPY package.json yarn.lock ./
COPY packages/shared-ui/package.json packages/shared-ui/
COPY packages/shared-hooks/package.json packages/shared-hooks/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/react-supplier/package.json packages/react-supplier/

RUN yarn install --frozen-lockfile --production=false

# Copy source
COPY packages/shared-ui/src packages/shared-ui/src
COPY packages/shared-hooks/src packages/shared-hooks/src
COPY packages/shared-types/src packages/shared-types/src
COPY packages/react-supplier/ packages/react-supplier/

# Build
RUN yarn workspace @shop/supplier build

# =============================================================================
# Stage 2: Serve (Nginx)
# =============================================================================
FROM nginx:1.27-alpine

RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

COPY packages/react-supplier/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/packages/react-supplier/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
