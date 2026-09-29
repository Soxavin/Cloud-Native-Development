FROM node:22-alpine
WORKDIR /app

# Copy manifests first so the npm install layer is cached until dependencies change
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 5002
CMD ["node", "authentication-service.js"]