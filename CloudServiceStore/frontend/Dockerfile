# Môi trường Node.js nhẹ
FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json (tận dụng cache layer)
COPY package.json package-lock.json ./

# Cài đặt các gói phụ thuộc
RUN npm ci

# Copy toàn bộ mã nguồn còn lại
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Chế độ dev cho phép Hot Reload
CMD ["npm", "run", "dev"]
