# 🏗️ Архитектура Backend

## Слоистая архитектура (Layered Architecture)

Проект организован по принципу разделения ответственности на слои:

```
┌─────────────────────────────────────────┐
│           HTTP Requests                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         ROUTERS (Controllers)           │  ← HTTP handlers
│         app/routers.py                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         SERVICES (Business Logic)       │  ← Business rules
│         app/services.py                 │
│  - RecognitionService                   │
│  - YOLOService                          │
│  - FileService                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      REPOSITORIES (Data Access)         │  ← Database operations
│         app/repositories.py             │
│  - RecognitionRepository                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         MODELS (ORM Entities)           │  ← Database tables
│         app/models.py                   │
│  - Recognition                          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│            DATABASE                     │
│         SQLite / MySQL / PostgreSQL     │
└─────────────────────────────────────────┘
```

## 📁 Структура проекта

```
ml-service/
├── app/
│   ├── __init__.py          # Package marker
│   ├── database.py          # Database configuration & session
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic schemas (DTOs)
│   ├── repositories.py      # Data access layer
│   ├── services.py          # Business logic layer
│   └── routers.py           # API routes (controllers)
├── main.py                  # Application entry point
├── requirements.txt         # Python dependencies
└── cowcount.db             # SQLite database (auto-created)
```

## 🔍 Описание слоев

### 1. **Routers (Controllers)** - `app/routers.py`

**Ответственность:**

- Обработка HTTP запросов
- Валидация входных данных (через Pydantic)
- Вызов сервисов
- Форматирование ответов

**Пример:**

```python
@router.post("", response_model=RecognitionResponse)
async def detect_cows(
    file: UploadFile = File(...),
    service: RecognitionService = Depends(get_recognition_service)
):
    recognition = await service.detect_and_save(file)
    return recognition.to_dict()
```

**Аналог в NestJS:** `@Controller()` классы

---

### 2. **Services (Business Logic)** - `app/services.py`

**Ответственность:**

- Бизнес-логика приложения
- Оркестрация между разными компонентами
- Обработка ошибок
- Транзакционная логика

**Классы:**

- `RecognitionService` - главный сервис для распознавания
- `YOLOService` - работа с YOLO моделью
- `FileService` - работа с файлами

**Пример:**

```python
class RecognitionService:
    async def detect_and_save(self, file: UploadFile):
        # 1. Validate file
        self.file_service.validate_file(file)
        # 2. Save file
        filename, contents = await self.file_service.save_file(file)
        # 3. Detect cows
        detections, count = self.yolo_service.detect_cows(image)
        # 4. Save to database
        return self.repository.create(...)
```

**Аналог в NestJS:** `@Injectable()` сервисы

---

### 3. **Repositories (Data Access)** - `app/repositories.py`

**Ответственность:**

- Работа с базой данных
- CRUD операции
- Запросы к БД
- Изоляция SQL логики

**Пример:**

```python
class RecognitionRepository:
    def create(self, image_path, result, cows_count):
        recognition = Recognition(...)
        self.db.add(recognition)
        self.db.commit()
        return recognition

    def get_all(self):
        return self.db.query(Recognition).order_by(...).all()
```

**Аналог в NestJS:** Repository pattern или TypeORM repositories

---

### 4. **Models (ORM)** - `app/models.py`

**Ответственность:**

- Определение структуры таблиц
- Маппинг Python объектов на таблицы БД
- Методы для сериализации

**Пример:**

```python
class Recognition(Base):
    __tablename__ = "recognitions"

    id = Column(Integer, primary_key=True)
    image_path = Column(String)
    result = Column(JSON)
    cows_count = Column(Integer)
    created_at = Column(DateTime)
```

**Аналог в NestJS:** `@Entity()` классы в TypeORM

---

### 5. **Schemas (DTOs)** - `app/schemas.py`

**Ответственность:**

- Валидация входных данных
- Сериализация выходных данных
- Документация API (автоматически в Swagger)

**Пример:**

```python
class RecognitionResponse(BaseModel):
    id: int
    imagePath: str
    cowsCount: int
    result: List[dict]
    createdAt: str
```

**Аналог в NestJS:** DTO классы с декораторами `class-validator`

---

### 6. **Database** - `app/database.py`

**Ответственность:**

- Конфигурация подключения к БД
- Создание сессий
- Инициализация таблиц

**Пример:**

```python
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Аналог в NestJS:** TypeORM configuration

---

## 🔄 Поток данных

### Пример: Загрузка и распознавание изображения

```
1. HTTP POST /detect
   ↓
2. Router (routers.py)
   - Получает файл
   - Вызывает RecognitionService
   ↓
3. RecognitionService (services.py)
   - Валидирует через FileService
   - Сохраняет через FileService
   - Распознает через YOLOService
   - Сохраняет через Repository
   ↓
4. RecognitionRepository (repositories.py)
   - Создает объект Recognition
   - Сохраняет в БД
   ↓
5. Database
   - INSERT в таблицу recognitions
   ↓
6. Response
   - Возвращается через все слои обратно
   - Сериализуется в JSON
```

## 🎯 Преимущества архитектуры

### ✅ Разделение ответственности (Separation of Concerns)

- Каждый слой отвечает за свою задачу
- Легко понять, где что находится

### ✅ Тестируемость

- Каждый слой можно тестировать отдельно
- Легко мокировать зависимости

### ✅ Масштабируемость

- Легко добавлять новые функции
- Можно заменить слой без изменения других

### ✅ Поддерживаемость

- Код организован логически
- Легко найти и исправить баги

### ✅ Повторное использование

- Сервисы можно использовать в разных роутерах
- Репозитории можно использовать в разных сервисах

## 📚 Паттерны проектирования

### 1. **Repository Pattern**

- Абстракция над доступом к данным
- `RecognitionRepository` инкапсулирует SQL запросы

### 2. **Service Layer Pattern**

- Бизнес-логика вынесена в отдельный слой
- `RecognitionService`, `YOLOService`, `FileService`

### 3. **Dependency Injection**

- Зависимости передаются через конструктор
- FastAPI `Depends()` для автоматической инъекции

### 4. **DTO Pattern (Data Transfer Object)**

- Pydantic схемы для валидации и сериализации
- `RecognitionResponse`, `RecognitionListItem`

### 5. **Single Responsibility Principle**

- Каждый класс отвечает за одну вещь
- `YOLOService` - только YOLO, `FileService` - только файлы

## 🔧 Dependency Injection

FastAPI использует встроенный DI механизм:

```python
# Определение зависимости
def get_recognition_service(db: Session = Depends(get_db)):
    return RecognitionService(db, yolo_service, file_service)

# Использование в роутере
@router.post("")
async def detect_cows(
    file: UploadFile = File(...),
    service: RecognitionService = Depends(get_recognition_service)
):
    return await service.detect_and_save(file)
```

## 🆚 Сравнение с NestJS

| Концепция  | NestJS                    | FastAPI (этот проект)          |
| ---------- | ------------------------- | ------------------------------ |
| Controller | `@Controller()`           | Router в `routers.py`          |
| Service    | `@Injectable()`           | Классы в `services.py`         |
| Repository | TypeORM Repository        | Классы в `repositories.py`     |
| Entity     | `@Entity()`               | SQLAlchemy Model               |
| DTO        | Class с `class-validator` | Pydantic Schema                |
| Module     | `@Module()`               | Не требуется (Python packages) |
| DI         | Декораторы + providers    | `Depends()`                    |

## 📖 Дополнительные ресурсы

- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
