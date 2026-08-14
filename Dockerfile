FROM node:22-bookworm-slim AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM dependencies AS build

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src


RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY certs/ /tmp/certs/
RUN mkdir -p /usr/local/share/certs \
  && cp /etc/ssl/certs/ca-certificates.crt /usr/local/share/certs/zscaler-chain.pem \
  && if ls /tmp/certs/KAINOS-ZSCALER*.p7b >/dev/null 2>&1; then \
       openssl pkcs7 -inform DER -in /tmp/certs/KAINOS-ZSCALER*.p7b -print_certs >> /usr/local/share/certs/zscaler-chain.pem; \
     fi \
  && rm -rf /tmp/certs

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/certs/zscaler-chain.pem
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team8_backend

RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY certs/ /tmp/certs/
RUN mkdir -p /usr/local/share/certs \
  && cp /etc/ssl/certs/ca-certificates.crt /usr/local/share/certs/zscaler-chain.pem \
  && if ls /tmp/certs/KAINOS-ZSCALER*.p7b >/dev/null 2>&1; then \
       openssl pkcs7 -inform DER -in /tmp/certs/KAINOS-ZSCALER*.p7b -print_certs >> /usr/local/share/certs/zscaler-chain.pem; \
     fi \
  && rm -rf /tmp/certs

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/certs/zscaler-chain.pem
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team8_backend


WORKDIR /app


COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma.config.ts ./
COPY tsconfig.json ./
COPY package*.json ./

EXPOSE 3000


CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]
