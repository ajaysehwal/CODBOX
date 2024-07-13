FROM node:20.14.0

WORKDIR /

COPY package*.json .

RUN corepack enable yarn

RUN yarn install

COPY . .

EXPOSE 8000

CMD [ "yarn","dev"]






