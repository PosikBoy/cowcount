# Docker Deployment Guide

## Обзор

Проект CowCount использует Docker для контейнеризации и упрощения развертывания. Все сервисы работают в изолированной Docker сети `cowcount-network`.

## Архитектура

```
┌─────────────────────────────────────────┐
│         cowcount-network (bridge)       │
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

## Порты

- **Frontend**: `5006` (внешний) → `3000` (внутренний)
- **ML Service**: `5007` (внешний) → `8000` (внутренний)

## Быстрый старт

### 1. Убедитесь, что Docker установлен

```bash
docker --version
docker-compose --version
```

### 2. Соберите и запустите контейнеры

```bash
# Сборка и запуск в фоновом режиме
docker-compose up -d --build

# Или без пересборки (если образы уже существуют)
docker-compose up -d
```

### 3. Проверьте статус контейнеров

```bash
docker-compose ps
```

### 4. Откройте приложение

- Frontend: http://localhost:5006
- ML Service API: http://localhost:5007
- API Documentation: http://localhost:5007/docs

## Управление контейнерами

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только frontend
docker-compose logs -f frontend

# Только ml-service
docker-compose logs -f ml-service
```

### Остановка контейнеров

```bash
# Остановить без удаления
docker-compose stop

# Остановить и удалить контейнеры
docker-compose down

# Остановить и удалить контейнеры + volumes
docker-compose down -v
```

### Перезапуск сервисов

```bash
# Перезапустить все
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart frontend
docker-compose restart ml-service
```

### Пересборка после изменений

```bash
# Пересобрать все образы
docker-compose build

# Пересобрать конкретный сервис
docker-compose build frontend
docker-compose build ml-service

# Пересобрать и запустить
docker-compose up -d --build
```

## Volumes

Проект использует следующие volumes:

- `./uploads:/app/uploads` - хранение загруженных изображений и видео
- `./ml-service/cowcount.db:/app/cowcount.db` - база данных SQLite

## Переменные окружения

### Frontend

Создайте файл `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5007
```

### ML Service

Переменные окружения задаются в `docker-compose.yml`:

```yaml
environment:
  - PYTHONUNBUFFERED=1
```

## Health Checks

Оба сервиса имеют health checks:

- **Frontend**: проверка доступности на порту 3000
- **ML Service**: проверка эндпоинта `/health`

Проверить здоровье контейнеров:

```bash
docker-compose ps
```

## Troubleshooting

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs ml-service
docker-compose logs frontend

# Проверьте статус
docker-compose ps
```

### Порты заняты

Если порты 5006 или 5007 заняты, измените их в `docker-compose.yml`:

```yaml
ports:
  - "НОВЫЙ_ПОРТ:3000" # для frontend
  - "НОВЫЙ_ПОРТ:8000" # для ml-service
```

### Проблемы с сетью

```bash
# Пересоздать сеть
docker-compose down
docker network prune
docker-compose up -d
```

### Очистка Docker

```bash
# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (осторожно!)
docker system prune -a --volumes
```

## Production Deployment

### Рекомендации для продакшена

1. **Используйте .env файлы** для конфигурации
2. **Настройте reverse proxy** (nginx) перед контейнерами
3. **Включите HTTPS** с помощью Let's Encrypt
4. **Настройте логирование** в внешние системы
5. **Используйте Docker secrets** для чувствительных данных
6. **Настройте мониторинг** (Prometheus, Grafana)
7. **Регулярно обновляйте** базовые образы

### Пример nginx конфигурации

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Обновление приложения

```bash
# 1. Остановить контейнеры
docker-compose down

# 2. Получить последние изменения
git pull

# 3. Пересобрать и запустить
docker-compose up -d --build

# 4. Проверить логи
docker-compose logs -f
```

## Backup

### Backup базы данных

```bash
# Создать backup
docker-compose exec ml-service cp /app/cowcount.db /app/uploads/cowcount_backup_$(date +%Y%m%d).db

# Скопировать на хост
docker cp cowcount-ml-service:/app/uploads/cowcount_backup_*.db ./backups/
```

### Backup uploads

```bash
# Создать архив
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## Мониторинг ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Размер образов
docker images

# Использование дискового пространства
docker system df
```

## Дополнительная информация

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Docker Documentation](https://fastapi.tiangolo.com/deployment/docker/)
