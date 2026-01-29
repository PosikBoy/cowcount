# 🚀 Быстрый старт CowCount

## Docker (Рекомендуется)

### 1. Запуск

```bash
docker-compose up -d --build
```

### 2. Проверка

```bash
docker-compose ps
```

### 3. Открыть приложение

- **Frontend**: http://localhost:5006
- **Backend API**: http://localhost:5007
- **API Docs**: http://localhost:5007/docs

### 4. Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только frontend
docker-compose logs -f frontend

# Только backend
docker-compose logs -f ml-service
```

### 5. Остановка

```bash
docker-compose down
```

---

## Локальная разработка

### Backend

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

**Доступен на**: http://localhost:8000

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

**Доступен на**: http://localhost:3000

---

## Использование

### 1. Распознавание изображений

- Перейдите на вкладку "Изображение"
- Загрузите фото с коровами
- Нажмите "Распознать"

### 2. Обработка видео

- Перейдите на вкладку "Видео"
- Загрузите видео (макс 10 минут)
- Дождитесь обработки
- Используйте плеер для просмотра с детекциями

### 3. Камера в реальном времени

- Перейдите на вкладку "Камера"
- Разрешите доступ к камере
- Наведите на коров для распознавания

### 4. История

- Перейдите в раздел "История"
- Просмотрите все прошлые распознавания
- Кликните на карточку для деталей

---

## Troubleshooting

### Порты заняты

Измените порты в `docker-compose.yml`:

```yaml
ports:
  - "НОВЫЙ_ПОРТ:3000" # frontend
  - "НОВЫЙ_ПОРТ:8000" # ml-service
```

### Контейнер не запускается

```bash
docker-compose logs ml-service
docker-compose logs frontend
```

### Очистка Docker

```bash
docker-compose down -v
docker system prune -a
```

---

## Очистка базы данных

### Docker

```bash
# Очистить только базу данных (сохранить файлы)
docker-compose exec ml-service python clear_database.py

# Очистить базу данных И удалить все файлы
docker-compose exec ml-service python clear_database.py --delete-files
```

### Локальная разработка

```bash
cd ml-service
source venv/bin/activate  # Windows: venv\Scripts\activate

# Очистить только базу данных
python clear_database.py

# Очистить базу данных И удалить файлы
python clear_database.py --delete-files
```

### Альтернатива: Удаление файла БД

```bash
# Остановить сервисы
docker-compose down

# Удалить базу данных
rm ml-service/cowcount.db

# Запустить заново (БД создастся автоматически)
docker-compose up -d
```

---

## Дополнительная документация

- 📖 [README.md](README.md) - Полная документация
- 🐳 [DOCKER.md](DOCKER.md) - Docker развертывание
- 🗄️ [DATABASE_MANAGEMENT.md](DATABASE_MANAGEMENT.md) - Управление базой данных
- 🏗️ [frontend/FSD_ARCHITECTURE.md](frontend/FSD_ARCHITECTURE.md) - Архитектура фронтенда
- 🔧 [frontend/REFACTORING.md](frontend/REFACTORING.md) - История рефакторинга
- 🔒 [ml-service/SECURITY.md](ml-service/SECURITY.md) - Безопасность
