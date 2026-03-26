FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

ENV NODE_ENV=production
ENV PORT=5005

EXPOSE 5005

HEALTHCHECK --interval=15s --timeout=5s --retries=8 CMD wget -qO- http://localhost:5005/api/health || exit 1

CMD ["dumb-init", "node", "src/index.js"]
