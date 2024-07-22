FROM node:20.14.0

WORKDIR /

COPY package*.json .

RUN corepack enable pnpm

RUN pnpm install

COPY . .

EXPOSE 8000

CMD [ "pnpm","dev"]






