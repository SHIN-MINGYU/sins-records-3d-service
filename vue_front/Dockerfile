FROM node:lts-alpine

USER root

RUN mkdir vue_front

RUN chmod -R 777 /vue_front

WORKDIR /vue_front

# COPY package.json .
COPY . .

# CMD ["yarn"]
# RUN yarn