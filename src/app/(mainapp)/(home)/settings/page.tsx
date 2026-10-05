"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ExamSettings from "@/components/settings/ExamSettings";
import PromotionSettings from "@/components/settings/PromotionSettings";
import AwardsSettings from "@/components/settings/AwardsSettings";
import AttendanceSettings from "@/components/settings/AttendanceSettings";
import AuditLogsSettings from "@/components/settings/AuditLogsSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";
import { Typography } from "@mui/material";
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      // hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export default function FullWidthTabs() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(0);
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setValue(Number(tab));
    } else {
      setValue(0);
    }
  }, [searchParams]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    router.push(`?tab=${newValue}`);
  };

  return (
    <>
      <Box mb={1} sx={{ height: "100%", p: 3 }}>
        <Typography variant="body2" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Manage system settings and preferences
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {["Exams", "Promotions", "Attendance", "Audit Logs", "General"].map(
            (label, index) => (
              <Box
                key={label}
                role="tab"
                {...a11yProps(index)}
                onClick={(e: React.MouseEvent) => handleChange(e, index)}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  userSelect: "none",
                  ...(value === index
                    ? {
                        bgcolor: "primary.main",
                        color: "#fff",
                        border: "1px solid primary.main",
                      }
                    : {
                        bgcolor: "transparent",
                        color: "text.primary",
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }),
                }}
              >
                {label}
              </Box>
            )
          )}
        </Box>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <ExamSettings />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <PromotionSettings />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <AttendanceSettings />
        </TabPanel>
        <TabPanel value={value} index={3} dir={theme.direction}>
          <AuditLogsSettings />
        </TabPanel>
        <TabPanel value={value} index={4} dir={theme.direction}>
          <GeneralSettings />
        </TabPanel>
        {/* <TabPanel value={value} index={3} dir={theme.direction}>
          <AwardsSettings />
        </TabPanel> */}
      </Box>
    </>
  );
}
