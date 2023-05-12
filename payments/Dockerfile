FROM node:alpine

WORKDIR /app
COPY package.json ./
RUN npm install -p
COPY ./ ./

CMD ["npm","start"]
