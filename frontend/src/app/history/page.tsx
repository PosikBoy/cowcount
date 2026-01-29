import History from "@/components/History/History";
import { Box, Container, Typography } from "@mui/material";

export default function HistoryPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          История распознаваний
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Просмотр всех выполненных распознаваний коров
        </Typography>
      </Box>
      <History />
    </Container>
  );
}
