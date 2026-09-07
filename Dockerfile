FROM node:24.13.0-alpine3.22 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.json tsconfig.build.json ./
RUN npm install --ignore-scripts=false && npm run build

FROM node:24.13.0-alpine3.22
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY apps/web-client ./apps/web-client
COPY packages/contracts ./packages/contracts
CMD ["node", "dist/apps/api-gateway/src/main.js"]
