# ML Service - YOLO Cow Detection

Python FastAPI service for detecting cows in images using YOLOv8.

## Setup

1. Create virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the service:

```bash
uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

## API Endpoints

- `POST /detect` - Detect cows in uploaded image
- `GET /health` - Health check
- `GET /` - Service info

## Usage

```bash
curl -X POST "http://localhost:9000/detect" \
  -F "file=@/path/to/image.jpg"
```
