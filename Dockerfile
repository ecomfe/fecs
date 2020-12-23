FROM node:lts-buster-slim
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
CMD ["yarn", "start"]
