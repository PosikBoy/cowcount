"use client";

import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.scss";

export default function Header() {
  const pathname = usePathname();

  return (
    <AppBar position="sticky" className={styles.header}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Link href="/" className={styles.logoLink}>
            <Box className={styles.logo}>
              <span className={styles.logoIcon}>🐄</span>
              <Typography
                variant="h5"
                component="div"
                className={styles.logoText}
              >
                CowCount
              </Typography>
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          <Box className={styles.nav}>
            <Link href="/" passHref legacyBehavior>
              <Button
                color="inherit"
                className={pathname === "/" ? styles.activeLink : ""}
              >
                Распознавание
              </Button>
            </Link>
            <Link href="/history" passHref legacyBehavior>
              <Button
                color="inherit"
                className={pathname === "/history" ? styles.activeLink : ""}
              >
                История
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
