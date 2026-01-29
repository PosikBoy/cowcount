"use client";

import { LiveCamera } from "@/entities/video/ui/LiveCamera/LiveCamera";
import { RecognitionForm } from "@/widgets/RecognitionForm/ui/RecognitionForm";
import { VideoProcessingForm } from "@/widgets/VideoProcessingForm/ui/VideoProcessingForm";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import VideocamIcon from "@mui/icons-material/Videocam";
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Распознавание коров
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Загрузите изображение, видео или используйте камеру для
          автоматического распознавания и подсчета коров
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              minHeight: { xs: 48, sm: 64 },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              padding: { xs: "6px 8px", sm: "12px 16px" },
              minWidth: { xs: 80, sm: 120 },
            },
            "& .MuiSvgIcon-root": {
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
            },
          }}
        >
          <Tab icon={<ImageIcon />} label="Изображение" iconPosition="start" />
          <Tab icon={<VideoLibraryIcon />} label="Видео" iconPosition="start" />
          <Tab icon={<VideocamIcon />} label="Камера" iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && <RecognitionForm />}
      {activeTab === 1 && <VideoProcessingForm />}
      {activeTab === 2 && <LiveCamera />}
    </Container>
  );
}
