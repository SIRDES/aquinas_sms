"use client";

import { showAlert } from "@/components/Alerts";

export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    showAlert({
      title: "Error",
      severity: "error",
      text: error.message || "An error occurred, please try again"
    })
  );
}
