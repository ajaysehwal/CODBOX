FROM node:20.14.0 AS base
WORKDIR /
COPY package*.json ./
RUN yarn install
FROM base AS development
COPY prisma "./prisma/"
COPY . .
CMD ["yarn", "dev"]

FROM base AS production
COPY prisma "./prisma/"
COPY . .

RUN npx prisma generate

CMD ["yarn", "start"]

EXPOSE 7000
