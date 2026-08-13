"use client";
import Appbar from "@/components/AppBar";
import DashboardSideNav from "@/components/DashboarSideNav";
import LoadingAlert from "@/components/LoadingAlert";
import { teacherNavLists } from "@/utils/mainNavList";
import { Box, Stack } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();
  const [sideNavWidth, setSideNavWidth] = useState("247px");
  if (session?.status === "loading") {
    return <LoadingAlert open={true} />;
  }
  if (session?.status === "unauthenticated") {
    router.push("/login");
    return;
  }

  if (session?.status === "authenticated") {
    if (session?.data?.user?.role === "admin") {
      router.push("/dashboard");
      return;
    }
  }
  return (
    <Stack sx={{ minHeight: "100vh" }}>
      {/* <DashboardSideNav
        sideNavWidth={sideNavWidth}
        setSideNavWidth={setSideNavWidth}
        userType="teacher"
        navLists={teacherNavLists}
      /> */}
      <Appbar />
      <Box
        sx={{
          // marginLeft: { xs: "", md: sideNavWidth },
          transition: "ease-in-out 0.6s",
          pb: { xs: 3, md: 4 },
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}
