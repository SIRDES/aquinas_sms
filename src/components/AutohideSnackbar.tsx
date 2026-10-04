"use client";

import * as React from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface AutohideSnackbarProps {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  autoHideDuration?: number;
  onClose: () => void;
}

const AutohideSnackbar: React.FC<AutohideSnackbarProps> = ({
  open,
  message,
  severity = "success",
  autoHideDuration = 5000,
  onClose,
}) => {
  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}

      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={handleClose} variant="filled" severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AutohideSnackbar;
