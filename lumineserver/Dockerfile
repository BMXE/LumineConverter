FROM node

COPY . .
RUN npm install
EXPOSE 8080:8080
ENTRYPOINT [ "node", "./api.js" ]