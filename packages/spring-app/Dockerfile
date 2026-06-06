# =============================================================================
# Stage 1: Build (Gradle)
# =============================================================================
FROM gradle:8-jdk21 AS builder

WORKDIR /app

# Cache dependencies layer (only Gradle files)
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle gradle

RUN gradle dependencies --no-daemon --quiet || true

# Copy source and build
COPY src src
RUN gradle bootJar --no-daemon -x test

# =============================================================================
# Stage 2: Run (JRE)
# =============================================================================
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

RUN chown -R spring:spring /app

USER spring

# Spring Boot Actuator endpoints
EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
