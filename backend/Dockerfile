# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Run stage
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY src/prisma ./src/prisma/

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push --schema=src/prisma/schema.prisma && node dist/index.js"]
