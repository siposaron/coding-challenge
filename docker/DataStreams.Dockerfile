# building the data-streams app
FROM node:14-alpine AS build
WORKDIR /usr/src

COPY package.json .
COPY package-lock.json .
COPY tsconfig.build.json .
COPY tsconfig.json .
COPY nest-cli.json .
COPY apps ./apps

RUN npm install
RUN npm run build

ENV NODE_ENV production
EXPOSE 3000
CMD npm run start