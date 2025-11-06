FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --production
COPY src ./src
ENV PORT=5005
EXPOSE 5005
CMD ["node", "src/index.js"]