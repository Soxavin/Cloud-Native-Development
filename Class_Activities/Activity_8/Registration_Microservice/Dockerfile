FROM node:24-alpine
WORKDIR /app

# Copy manifests first so the npm install layer is cached until dependencies change
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 5001
CMD ["node", "registration.js"]