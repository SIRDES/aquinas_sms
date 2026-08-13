"use client";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingAlert from "@/components/LoadingAlert";
// import { redirect } from "next/navigation";
import "react-phone-number-input/style.css";
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();

  if (session?.status === "loading") {
    return <LoadingAlert open={true} />;
  }
  if (session?.status === "unauthenticated") {
    router.push("/login");
    return;
  }
  return (
    <Box sx={{ backgroundColor: "#FAFAFA" }}>{children}</Box>
  );
}
