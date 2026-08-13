"use client";
import {
  AppBar,
  Box,
  Tab,
  TableCell,
  TableRow,
  Tabs,
  useTheme,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

import CategoriesTap from "@/components/award/CategoriesTab";
import NomineeList from "@/components/award/NomineeListTab";
import ElectionUsers from "@/components/award/ElectionUsersTab";
import React from "react";
import AwardPayments from "@/components/award/AwardPayments";
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "9px 8px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 14,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    // cursor: "pointer",
  },
}));

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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}
export default function Election() {
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
      <Box>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            // indicatorColor="secondary"
            textColor="inherit"
            // variant="fullWidth"
          >
            <Tab label="Categories" {...a11yProps(0)} />
            <Tab label="Users" {...a11yProps(1)} />
            <Tab label="Nominee List" {...a11yProps(2)} />
            <Tab label="Payments" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }} sx={{ height: "100%" }}>
          <TabPanel value={value} index={0} dir={theme.direction}>
            <CategoriesTap />
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <ElectionUsers />
          </TabPanel>
          <TabPanel value={value} index={2} dir={theme.direction}>
            <NomineeList />
          </TabPanel>
          <TabPanel value={value} index={3} dir={theme.direction}>
            <AwardPayments />
          </TabPanel>
        </Box>
      </Box>
    </>
  );
}
