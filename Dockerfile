FROM node:19.6.0-bullseye-slim as cacher
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

FROM node:19.6.0-bullseye-slim as builder
WORKDIR /app
COPY --from=cacher /app/node_modules ./node_modules
COPY . .
RUN npm run build

ENTRYPOINT [ "./entrypoint.sh" ]