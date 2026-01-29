# 🐍 Запуск через PyCharm

## Способ 1: Запуск через run.py (Рекомендуется)

### Шаги:

1. **Откройте проект в PyCharm**
   - File → Open → выберите папку `ml-service`

2. **Настройте интерпретатор**
   - File → Settings → Project → Python Interpreter
   - Нажмите ⚙️ → Add
   - Выберите "Existing environment"
   - Укажите путь: `ml-service/venv/bin/python`
   - Нажмите OK

3. **Создайте конфигурацию запуска**
   - Run → Edit Configurations
   - Нажмите + → Python
   - Настройте:
     - **Name**: `FastAPI Server`
     - **Script path**: выберите `run.py`
     - **Working directory**: `ml-service`
     - **Python interpreter**: выберите venv
   - Нажмите OK

4. **Запустите**
   - Нажмите зеленую кнопку ▶️ или Shift+F10
   - Сервер запустится на http://localhost:9000

## Способ 2: Через Terminal в PyCharm

1. **Откройте Terminal** (Alt+F12 или View → Tool Windows → Terminal)

2. **Активируйте venv**:

   ```bash
   source venv/bin/activate
   ```

3. **Запустите uvicorn**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 9000 --reload
   ```

## Способ 3: Через uvicorn напрямую

### Создайте конфигурацию:

1. Run → Edit Configurations → + → Python

2. Настройте:
   - **Name**: `Uvicorn Server`
   - **Module name**: `uvicorn` (вместо Script path)
   - **Parameters**: `main:app --host 0.0.0.0 --port 9000 --reload`
   - **Working directory**: `ml-service`
   - **Python interpreter**: venv

3. Запустите ▶️

## 🔍 Проверка

После запуска откройте:

- http://localhost:9000 - Root endpoint
- http://localhost:9000/docs - Swagger UI
- http://localhost:9000/health - Health check

## 🐛 Отладка (Debug)

1. Поставьте breakpoint в коде (кликните слева от номера строки)
2. Запустите в режиме Debug (🐞 или Shift+F9)
3. Отправьте запрос через frontend или Swagger UI
4. PyCharm остановится на breakpoint

## ⚙️ Полезные настройки PyCharm

### Auto-reload при изменениях:

- Уже включен через `--reload` в uvicorn

### Форматирование кода:

- Code → Reformat Code (Ctrl+Alt+L)

### Автоимпорты:

- Settings → Editor → General → Auto Import
- Включите "Add unambiguous imports on the fly"

## 📝 Горячие клавиши

- **Shift+F10** - Запуск
- **Shift+F9** - Debug
- **Ctrl+C** - Остановка сервера
- **Ctrl+F5** - Перезапуск

## 🎯 Рекомендуемая конфигурация

Используйте [`run.py`](run.py:1) - это самый простой способ!

Просто откройте `run.py` и нажмите ▶️ в правом верхнем углу.
