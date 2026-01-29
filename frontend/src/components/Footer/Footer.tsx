"use client";

import { Box, Container, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";
import styles from "./Footer.module.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className={styles.footer}>
      <Container maxWidth="lg">
        <Box className={styles.content}>
          <Typography variant="body2" className={styles.copyright}>
            © {currentYear} CowCount. Все права защищены.
          </Typography>

          <Box className={styles.links}>
            <Link href="/about" passHref legacyBehavior>
              <MuiLink className={styles.link}>О проекте</MuiLink>
            </Link>
            <Typography variant="body2" className={styles.separator}>
              •
            </Typography>
            <MuiLink
              href="https://github.com/ultralytics/ultralytics"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              YOLOv8
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
