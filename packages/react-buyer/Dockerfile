# =============================================================================
# Stage 1: Build (Node)
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (shared packages + buyer)
COPY package.json yarn.lock ./
COPY packages/shared-ui/package.json packages/shared-ui/
COPY packages/shared-hooks/package.json packages/shared-hooks/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/react-buyer/package.json packages/react-buyer/

RUN yarn install --frozen-lockfile --production=false

# Copy source
COPY packages/shared-ui/src packages/shared-ui/src
COPY packages/shared-hooks/src packages/shared-hooks/src
COPY packages/shared-types/src packages/shared-types/src
COPY packages/react-buyer/ packages/react-buyer/

# Build
RUN yarn workspace @shop/buyer build

# =============================================================================
# Stage 2: Serve (Nginx)
# =============================================================================
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy nginx config
COPY packages/react-buyer/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts
COPY --from=builder /app/packages/react-buyer/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
