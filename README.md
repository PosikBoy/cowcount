# 🐄 CowCount - Система мониторинга коров

Веб-система для автоматического распознавания коров на изображениях и видео с использованием нейросети YOLOv8.

## 📋 Архитектура

```
┌─────────────────────────────────────────┐
│         cowcount-network (Docker)       │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │  ML Service  │  │
│  │   (Next.js)  │───▶│   (FastAPI)  │  │
│  │   Port 3000  │    │   Port 8000  │  │
│  └──────────────┘    └──────────────┘  │
│         │                    │          │
└─────────┼────────────────────┼──────────┘
          │                    │
     Port 5006             Port 5007
          │                    │
          └────────────────────┘
              Host Machine
```

## 🚀 Быстрый старт

### Вариант 1: Docker (Рекомендуется)

**Предварительные требования:**

- Docker
- Docker Compose

```bash
# Клонировать репозиторий
git clone <repository-url>
cd cowcount

# Запустить все сервисы
docker-compose up -d --build

# Проверить статус
docker-compose ps

# Открыть приложение
# Frontend: http://localhost:5006
# Backend API: http://localhost:5007
# API Docs: http://localhost:5007/docs
```

📖 **Подробная документация по Docker:** [DOCKER.md](DOCKER.md)

### Вариант 2: Локальная разработка

**Предварительные требования:**

- Node.js 18+
- Python 3.11+
- npm или yarn

**1. Backend (FastAPI):**

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Backend будет доступен на: **http://localhost:8000**

**2. Frontend (Next.js):**

```bash
cd frontend
npm install

# Создать .env.local файл
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Frontend будет доступен на: **http://localhost:3000**

## 📁 Структура проекта

```
cowcount/
├── ml-service/          # FastAPI Backend + YOLO + SQLAlchemy
│   ├── main.py          # Unified backend with all endpoints
│   ├── requirements.txt
│   └── cowcount.db      # SQLite database (auto-created)
├── frontend/            # Next.js + Material UI
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   └── package.json
├── uploads/             # Загруженные изображения
└── README.md
```

## 🎯 Функциональность

### ✅ Реализовано

#### Распознавание изображений

- ✅ Загрузка изображений (JPG, PNG, WEBP, AVIF, макс 10 МБ)
- ✅ Распознавание коров с помощью YOLOv8
- ✅ Визуализация bounding boxes на изображении
- ✅ Интерактивный выбор коров
- ✅ Drag & Drop загрузка

#### Обработка видео

- ✅ Загрузка видео (MP4, AVI, MOV, макс 200 МБ, макс 10 минут)
- ✅ Анализ видео с детекцией по кадрам
- ✅ Видеоплеер с перемоткой и маркерами детекций
- ✅ Поддержка вертикальных видео
- ✅ HTTP Range requests для плавной перемотки

#### Потоковое видео

- ✅ Распознавание в реальном времени с камеры устройства
- ✅ WebSocket соединение для низкой задержки
- ✅ Отображение bounding boxes в реальном времени
- ✅ ~10 FPS обработка

#### Интерфейс

- ✅ Material UI v5 компоненты
- ✅ SCSS модули для стилизации
- ✅ TypeScript для типобезопасности
- ✅ Адаптивный дизайн (мобильные устройства)
- ✅ Feature-Sliced Design архитектура
- ✅ Централизованная обработка ошибок
- ✅ Axios interceptors

#### Безопасность

- ✅ Rate limiting (1 запрос/минуту для обработки)
- ✅ Валидация файлов
- ✅ Ограничение размера и длительности
- ✅ DDoS защита

#### Другое

- ✅ История распознаваний с миниатюрами
- ✅ Статистика распознаваний
- ✅ SQLite база данных
- ✅ Docker контейнеризация
- ✅ Health checks

### 📊 API Endpoints

#### Распознавание изображений (`/detect`)

- `POST /detect` - Загрузка и распознавание изображения
- `GET /detect/history` - История распознаваний
- `GET /detect/{id}` - Детали распознавания
- `DELETE /detect/{id}` - Удаление распознавания
- `GET /detect/stats/summary` - Статистика

#### Обработка видео (`/video`)

- `POST /video/analyze` - Анализ видео (rate limit: 1/мин)
- `GET /video/stream/{filename}` - Стриминг видео с Range support
- `DELETE /video/{filename}` - Удаление видео

#### Потоковое видео (`/stream`)

- `WebSocket /stream/video` - Реал-тайм обработка с камеры

#### Служебные

- `GET /` - Информация о API
- `GET /health` - Health check
- `GET /uploads/{filename}` - Статические файлы

📖 **API документация:** http://localhost:5007/docs (при запущенном сервере)

## 🗄️ База данных

### SQLite (автоматически создается)

**Таблица `recognitions`:**

| Поле       | Тип      | Описание                      |
| ---------- | -------- | ----------------------------- |
| id         | INTEGER  | Первичный ключ                |
| image_path | VARCHAR  | Путь к файлу изображения      |
| result     | JSON     | Результаты YOLO               |
| cows_count | INTEGER  | Количество обнаруженных коров |
| created_at | DATETIME | Дата и время распознавания    |

**Преимущества SQLite:**

- Не требует установки отдельного сервера БД
- Автоматически создается при первом запуске
- Идеально для разработки и небольших проектов
- Файл `cowcount.db` содержит всю базу данных

## 🎨 Интерфейс

### Экран распознавания

- Загрузка изображения через кнопку
- Предпросмотр изображения
- Визуализация результата в виде квадратов
- Каждый квадрат = одна корова

### Экран истории

- Карточки с миниатюрами изображений
- Дата и время распознавания
- Количество коров (квадраты)
- Адаптивная сетка

## 📝 Технологии

### Backend (Unified)

- **Python 3.10+**
- **FastAPI** - Web фреймворк
- **YOLOv8 (Ultralytics)** - Нейросеть
- **SQLAlchemy** - ORM
- **SQLite** - База данных
- **Pillow** - Обработка изображений

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Material UI v5**
- **SCSS Modules**
- **Axios**

## 🐛 Отладка

### Проверка сервисов

```bash
# Backend
curl http://localhost:9000/health

# Frontend
open http://localhost:3001
```

### Просмотр базы данных

```bash
# Установите sqlite3
sqlite3 ml-service/cowcount.db

# Команды SQLite
.tables                    # Показать таблицы
SELECT * FROM recognitions; # Показать все записи
.exit                      # Выход
```

## 📦 Развертывание

### Docker (Production)

```bash
# Сборка и запуск
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Переменные окружения

**Frontend (`.env.local`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:5007
```

**Backend:**

- Настраивается через `docker-compose.yml`
- По умолчанию использует SQLite

### Обновление

```bash
git pull
docker-compose down
docker-compose up -d --build
```

## 🎓 Особенности реализации

✅ **Feature-Sliced Design** - модульная архитектура фронтенда
✅ **WebSocket** - для реал-тайм обработки видео
✅ **HTTP Range Requests** - для перемотки видео
✅ **Rate Limiting** - защита от перегрузки
✅ **Docker Network** - изолированная сеть контейнеров
✅ **Health Checks** - мониторинг состояния сервисов
✅ **Responsive Design** - адаптация под мобильные устройства

## 📄 Лицензия

ISC

## 👨‍💻 Автор

Разработано для демонстрации интеграции Next.js, FastAPI и YOLOv8.
