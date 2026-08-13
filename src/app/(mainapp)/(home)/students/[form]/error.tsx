"use client";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";
import { useState } from "react";

export default function ErrorBoundary({ error }: { error: Error }) {
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: true,
    message: "",
    severity: undefined,
  });
  return (
    <ProgressAlert
      open={snackbar.open}
      message={error.message}
      severity={"error"}
      setOpen={setSnackbar}
    />
  );
}
