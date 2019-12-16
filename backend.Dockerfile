FROM node:12.13.1-stretch as builder

COPY . .

RUN yarn

RUN cd src/backend && node server.js