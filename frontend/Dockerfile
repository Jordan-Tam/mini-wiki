# Lighter image I came across, should build faster
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Use host flag to expose
CMD ["npm", "run", "dev", "--", "--host"]
