"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import styles from "./page.module.scss";

export default function AboutPage() {
  const technologies = [
    { name: "Next.js 14", category: "Frontend" },
    { name: "Material UI", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "SCSS Modules", category: "Frontend" },
    { name: "FastAPI", category: "Backend" },
    { name: "Python", category: "Backend" },
    { name: "SQLAlchemy", category: "Backend" },
    { name: "YOLOv8", category: "ML" },
    { name: "PyTorch", category: "ML" },
    { name: "Ultralytics", category: "ML" },
  ];

  const features = [
    {
      title: "🎯 Распознавание коров",
      description:
        "Автоматическое обнаружение коров на изображениях с использованием нейросети YOLOv8",
    },
    {
      title: "📊 Подсчет количества",
      description: "Точный подсчет количества коров на загруженном изображении",
    },
    {
      title: "🎨 Визуализация",
      description:
        "Отображение bounding boxes с координатами обнаруженных объектов",
    },
    {
      title: "📜 История распознаваний",
      description:
        "Сохранение и просмотр всех выполненных распознаваний с возможностью удаления",
    },
    {
      title: "🔍 Интерактивный выбор",
      description: "Выделение отдельных коров при клике на их маркеры или чипы",
    },
    {
      title: "📱 Адаптивный дизайн",
      description: "Современный интерфейс, работающий на всех устройствах",
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h3" component="h1" className={styles.title}>
            <span className={styles.icon}>🐄</span>О проекте CowCount
          </Typography>
          <Typography variant="h6" className={styles.subtitle}>
            Веб-система мониторинга коров с использованием нейросети YOLO
          </Typography>
        </Box>

        <Card className={styles.card}>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              className={styles.sectionTitle}
            >
              📖 Описание проекта
            </Typography>
            <Typography variant="body1" paragraph>
              CowCount — это современная веб-система для автоматического
              распознавания и подсчета коров на изображениях. Проект использует
              передовые технологии машинного обучения, в частности нейронную
              сеть YOLOv8 (You Only Look Once), для быстрого и точного
              обнаружения объектов.
            </Typography>
            <Typography variant="body1" paragraph>
              Система предназначена для фермеров, зоотехников и специалистов
              сельского хозяйства, которым необходимо эффективно отслеживать
              поголовье скота. Вместо ручного подсчета, пользователи могут
              просто загрузить фотографию и получить мгновенный результат с
              точным количеством животных и их расположением на изображении.
            </Typography>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              className={styles.sectionTitle}
            >
              ✨ Основные возможности
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Box className={styles.feature}>
                    <Typography variant="h6" className={styles.featureTitle}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              className={styles.sectionTitle}
            >
              🛠️ Технологический стек
            </Typography>
            <Box className={styles.techStack}>
              {technologies.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech.name}
                  color={
                    tech.category === "Frontend"
                      ? "primary"
                      : tech.category === "Backend"
                        ? "secondary"
                        : "success"
                  }
                  className={styles.techChip}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              className={styles.sectionTitle}
            >
              🏗️ Архитектура
            </Typography>
            <Typography variant="body1" paragraph>
              Проект построен на современной микросервисной архитектуре:
            </Typography>
            <Box component="ul" className={styles.list}>
              <li>
                <Typography variant="body1">
                  <strong>Frontend (Next.js):</strong> Интерактивный
                  пользовательский интерфейс с Material UI компонентами и SCSS
                  стилизацией
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Backend (FastAPI):</strong> RESTful API с чистой
                  слоистой архитектурой (Repository → Service → Router)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>ML Service:</strong> Интегрированный сервис машинного
                  обучения на базе YOLOv8 для распознавания объектов
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Database (SQLite):</strong> Хранение истории
                  распознаваний и метаданных изображений
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              className={styles.sectionTitle}
            >
              🎓 О технологии YOLO
            </Typography>
            <Typography variant="body1" paragraph>
              YOLO (You Only Look Once) — это семейство нейронных сетей для
              обнаружения объектов в реальном времени. YOLOv8, используемая в
              этом проекте, является одной из самых современных и эффективных
              версий, обеспечивающая отличный баланс между скоростью и точностью
              распознавания.
            </Typography>
            <Typography variant="body1">
              Модель обучена на большом датасете изображений и способна
              распознавать различные объекты, включая животных, с высокой
              точностью и минимальной задержкой.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
