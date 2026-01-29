# 🗄️ Управление базой данных

## Очистка базы данных

### Вариант 1: Использование скрипта (Рекомендуется)

#### Локальная разработка

```bash
cd ml-service
source venv/bin/activate  # Windows: venv\Scripts\activate

# Очистить только базу данных (сохранить файлы)
python clear_database.py

# Очистить базу данных И удалить все загруженные файлы
python clear_database.py --delete-files
```

#### Docker

```bash
# Очистить только базу данных
docker-compose exec ml-service python clear_database.py

# Очистить базу данных И удалить файлы
docker-compose exec ml-service python clear_database.py --delete-files
```

### Вариант 2: Удаление файла базы данных

#### Локальная разработка

```bash
# Остановить backend
# Затем удалить файл базы данных
rm ml-service/cowcount.db

# При следующем запуске база данных будет создана заново
cd ml-service
python run.py
```

#### Docker

```bash
# Остановить контейнеры
docker-compose down

# Удалить файл базы данных
rm ml-service/cowcount.db

# Запустить заново
docker-compose up -d
```

### Вариант 3: Полная очистка (база + файлы)

```bash
# Остановить сервисы
docker-compose down

# Удалить базу данных
rm ml-service/cowcount.db

# Удалить все загруженные файлы (кроме .gitkeep)
find uploads -type f ! -name '.gitkeep' -delete

# Запустить заново
docker-compose up -d
```

## Backup базы данных

### Создание backup

#### Локальная разработка

```bash
# Создать backup с датой
cp ml-service/cowcount.db ml-service/cowcount_backup_$(date +%Y%m%d_%H%M%S).db

# Или в отдельную папку
mkdir -p backups
cp ml-service/cowcount.db backups/cowcount_$(date +%Y%m%d_%H%M%S).db
```

#### Docker

```bash
# Создать backup внутри контейнера
docker-compose exec ml-service cp /app/cowcount.db /app/cowcount_backup_$(date +%Y%m%d_%H%M%S).db

# Скопировать backup на хост
docker cp cowcount-ml-service:/app/cowcount_backup_*.db ./backups/
```

### Восстановление из backup

#### Локальная разработка

```bash
# Остановить backend
# Восстановить из backup
cp backups/cowcount_YYYYMMDD_HHMMSS.db ml-service/cowcount.db

# Запустить backend
cd ml-service
python run.py
```

#### Docker

```bash
# Остановить контейнеры
docker-compose down

# Восстановить из backup
cp backups/cowcount_YYYYMMDD_HHMMSS.db ml-service/cowcount.db

# Запустить заново
docker-compose up -d
```

## Просмотр базы данных

### SQLite CLI

```bash
# Открыть базу данных
sqlite3 ml-service/cowcount.db

# Полезные команды:
.tables                          # Показать все таблицы
.schema recognitions             # Показать структуру таблицы
SELECT * FROM recognitions;      # Показать все записи
SELECT COUNT(*) FROM recognitions; # Подсчитать записи
.exit                            # Выход
```

### Docker

```bash
# Войти в контейнер
docker-compose exec ml-service sh

# Установить sqlite3 (если нужно)
apk add sqlite

# Открыть базу данных
sqlite3 /app/cowcount.db
```

### GUI инструменты

Рекомендуемые инструменты для просмотра SQLite:

- **DB Browser for SQLite** - https://sqlitebrowser.org/
- **DBeaver** - https://dbeaver.io/
- **TablePlus** - https://tableplus.com/

## Экспорт данных

### Экспорт в SQL

```bash
# Экспорт всей базы данных
sqlite3 ml-service/cowcount.db .dump > backup.sql

# Экспорт только данных (без схемы)
sqlite3 ml-service/cowcount.db "SELECT * FROM recognitions;" > recognitions.csv
```

### Экспорт в CSV

```bash
sqlite3 ml-service/cowcount.db <<EOF
.headers on
.mode csv
.output recognitions.csv
SELECT * FROM recognitions;
.quit
EOF
```

## Импорт данных

### Импорт из SQL

```bash
# Создать новую базу данных из SQL файла
sqlite3 ml-service/cowcount_new.db < backup.sql

# Заменить текущую базу данных
mv ml-service/cowcount.db ml-service/cowcount_old.db
mv ml-service/cowcount_new.db ml-service/cowcount.db
```

## Миграция на другую СУБД

### PostgreSQL

1. Установите драйвер:

```bash
pip install psycopg2-binary
```

2. Создайте базу данных:

```sql
CREATE DATABASE cowcount;
```

3. Установите переменную окружения:

```bash
export DATABASE_URL="postgresql://user:password@localhost/cowcount"
```

4. Запустите backend - таблицы создадутся автоматически

### MySQL

1. Установите драйвер:

```bash
pip install pymysql
```

2. Создайте базу данных:

```sql
CREATE DATABASE cowcount CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Установите переменную окружения:

```bash
export DATABASE_URL="mysql+pymysql://user:password@localhost/cowcount"
```

4. Запустите backend - таблицы создадутся автоматически

## Автоматический backup

### Cron job (Linux/Mac)

```bash
# Редактировать crontab
crontab -e

# Добавить задачу (backup каждый день в 2:00 AM)
0 2 * * * cp /path/to/cowcount/ml-service/cowcount.db /path/to/backups/cowcount_$(date +\%Y\%m\%d).db
```

### Скрипт backup

Создайте файл `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DB_FILE="./ml-service/cowcount.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/cowcount_$TIMESTAMP.db

# Удалить backup старше 30 дней
find $BACKUP_DIR -name "cowcount_*.db" -mtime +30 -delete

echo "Backup created: cowcount_$TIMESTAMP.db"
```

Сделайте исполняемым:

```bash
chmod +x backup.sh
```

## Troubleshooting

### База данных заблокирована

```bash
# Проверить процессы, использующие базу данных
lsof ml-service/cowcount.db

# Остановить все сервисы
docker-compose down

# Или убить процесс
kill -9 <PID>
```

### Поврежденная база данных

```bash
# Проверить целостность
sqlite3 ml-service/cowcount.db "PRAGMA integrity_check;"

# Восстановить из backup
cp backups/cowcount_LATEST.db ml-service/cowcount.db
```

### Большой размер базы данных

```bash
# Проверить размер
du -h ml-service/cowcount.db

# Оптимизировать (VACUUM)
sqlite3 ml-service/cowcount.db "VACUUM;"

# Удалить старые записи
sqlite3 ml-service/cowcount.db "DELETE FROM recognitions WHERE created_at < datetime('now', '-30 days');"
```

## Мониторинг

### Статистика базы данных

```bash
# Количество записей
sqlite3 ml-service/cowcount.db "SELECT COUNT(*) FROM recognitions;"

# Размер базы данных
du -h ml-service/cowcount.db

# Последние записи
sqlite3 ml-service/cowcount.db "SELECT id, cows_count, created_at FROM recognitions ORDER BY created_at DESC LIMIT 10;"
```

### API эндпоинт

```bash
# Получить статистику через API
curl http://localhost:5007/detect/stats/summary
```
