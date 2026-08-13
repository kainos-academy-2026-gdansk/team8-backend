FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY certs/ /tmp/certs/
RUN mkdir -p /usr/local/share/certs \
  && cp /etc/ssl/certs/ca-certificates.crt /usr/local/share/certs/zscaler-chain.pem \
  && if ls /tmp/certs/KAINOS-ZSCALER*.p7b >/dev/null 2>&1; then \
       openssl pkcs7 -inform DER -in /tmp/certs/KAINOS-ZSCALER*.p7b -print_certs >> /usr/local/share/certs/zscaler-chain.pem; \
     fi
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/certs/zscaler-chain.pem
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team8_backend

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
