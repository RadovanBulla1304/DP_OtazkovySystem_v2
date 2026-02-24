FROM node:20

WORKDIR /usr/src/app

# install only production dependencies inside the image
COPY package.json ./
RUN npm install --production

COPY . .

CMD ["node", "server.js"]
