#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Запуск клиента Miagra...${NC}"

# Проверяем наличие .env.local файла
if [ ! -f ".env.local" ]; then
  echo -e "${RED}Ошибка: Файл .env.local не найден!${NC}"
  echo -e "${YELLOW}Создаю файл .env.local из примера...${NC}"
  
  if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}Файл .env.local создан из примера.${NC}"
  else
    echo -e "${RED}Файл .env.local.example не найден! Создаю базовый .env.local файл...${NC}"
    
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
    
    echo -e "${GREEN}Базовый файл .env.local создан.${NC}"
  fi
fi

# Проверяем наличие node_modules
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Папка node_modules не найдена. Устанавливаю зависимости...${NC}"
  npm install
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при установке зависимостей!${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Зависимости успешно установлены.${NC}"
fi

# Запускаем клиент
echo -e "${GREEN}Запускаю клиент на порту 3000...${NC}"
echo -e "${YELLOW}Нажмите Ctrl+C для остановки клиента.${NC}"
npm run dev
