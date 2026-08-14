FROM node:24-alpine

WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar cache de Docker
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto por defecto de Vite
EXPOSE 3000

# Comando por defecto en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]