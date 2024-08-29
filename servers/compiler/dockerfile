FROM node:20.14.0 AS base

WORKDIR /
COPY package*.json ./

RUN yarn install

FROM base AS development
COPY . .
CMD ["yarn", "dev"]

FROM base AS production
COPY . .
CMD ["yarn", "start"]

EXPOSE 5000
