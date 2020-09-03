FROM node:lts-alpine as build-stage
RUN apk add vim psql
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

