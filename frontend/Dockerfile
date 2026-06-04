FROM node:20

# 1. Set the working directory
WORKDIR /app

# 2. Copy the dependency files first
# (This assumes package.json and package-lock.json are in your /frontend folder)
COPY package*.json ./

# 3. Install dependencies
RUN npm ci

# 4. Copy the rest of your frontend code
COPY . .

EXPOSE 5173

# 5. Run the app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
