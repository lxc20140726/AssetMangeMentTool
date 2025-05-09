FROM node:18-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# 创建数据目录
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["npm", "run", "dev"] 