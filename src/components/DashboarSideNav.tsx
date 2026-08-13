"use client";

import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { USER_PERMISSIONS } from "@/utils/common";
import { SnackbarType } from "@/types/commonTypes";
import LoadingAlert from "./LoadingAlert";
import ProgressAlert from "./ProgressAlert";
import MobileNavMenu from "./MobileNavMenu";
import { useBatchesContext } from "@/context/BatchesContext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { getAllFridayTestBatch } from "@/utils/serverActions/fridayTestBatch";
import { getAdminSetting } from "@/utils/serverActions/adminSettings";
import { showAlert } from "./Alerts";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME;
const StyledNavItem = styled(
  (props: {
    href: string;
    component: React.ElementType;
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }) => <Box {...props} />
)(({ theme }) => ({
  display: "flex",
  // flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  color: "#fff",
  // height:"290px",
  transition: "ease-in-out 0.6s",
  textDecoration: "none",
  "&:hover": {
    color: theme.palette.primary.main,
    borderRadius: "10px",
    // cursor: "pointer",
    // borderLeft: "5px solid #4698CA",
    backgroundColor: theme.palette.common.white,
  },
  "&.active": {
    color: theme.palette.primary.main,
    borderRadius: "10px",
    // cursor: "pointer",
    // borderLeft: "5px solid #4698CA",
    backgroundColor: theme.palette.common.white,
  },
  "&.child": {
    padding: "2px 10px",
    borderRadius: "0px",
  },
  "&.child-active": {
    color: theme.palette.common.white,
    // borderRadius: "10px",
    // cursor: "pointer",
    // borderLeft: "5px solid #4698CA",
    borderLeft: `2px solid ${theme.palette.common.white}`,
    "&:hover": {
      color: theme.palette.primary.main,
    }
  },
}));

export default function DashboardSideNav({
  sideNavWidth,
  setSideNavWidth,
  navLists,
  userType,
}: {
  sideNavWidth: string;
  setSideNavWidth: React.Dispatch<React.SetStateAction<string>>;
  userType: string;
  navLists: {
    id: number;
    name: string;
    href?: string;
    permission?: string;
    children?: { id: number; name: string; href: string, permission?: string }[];
  }[];
}) {
  const { data: session } = useSession();
  const userPermissions = (session?.user as any)?.userPermissions || [];

  const allowedNavItems = React.useMemo(() => {
    return navLists.filter((item) => {
      if (userType === "admin") {
        if (item.permission === "admin") return true;
        if (userPermissions.includes(item.permission)) return true;
        // if (item.name === "Order of merits") return userPermissions.includes(USER_PERMISSIONS.ORDER_OF_MERIT_VIEW);
        // if (item.name === "Attendance") return userPermissions.includes(USER_PERMISSIONS.ATTENDANCE_VIEW_DASHBOARD);
        // if (item.name === "Staff") return userPermissions.includes(USER_PERMISSIONS.USER_VIEW_ALL);
        // if (item.name === "Exams") return userPermissions.includes(USER_PERMISSIONS.EXAMS_VIEW_ALL);
        // if (item.name === "Payments") return userPermissions.includes(USER_PERMISSIONS.EXAMS_PAYMENTS_VIEW_ALL);
        // if (item.name === "SMS Results") return userPermissions.includes(USER_PERMISSIONS.SMS_RESULTS_VIEW);
        // if (item.name === "Settings") return userPermissions.includes(USER_PERMISSIONS.SETTINGS_VIEW_ALL);
        return false;
      }
      return false;
    });
  }, [navLists, userType, userPermissions]);

  const theme = useTheme();
  const pathname = usePathname();
  const {
    selectedBatch,
    setSelectedBatch,
    batches,
    fetchedBatches,
    setBatches,
    setFetchedBatches,
    setAdminSettings,
  } = useBatchesContext();
  const [openNavChildren, setOpenNavChildren] = useState<boolean>(false);
  const [selectedNavItem, setSelectedNavItem] = useState<number | null>(null);
  const [isMobileNav, setISMobileNav] = useState(false);
  const [batchAnchorEl, setBatchAnchorEl] = useState<null | HTMLElement>(null);
  // const sideNavWidth = "247px";

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });
  const handleClick = () => {
    setSideNavWidth(isMobileNav ? "247px" : "80px");
    setISMobileNav((prev: boolean) => !prev);
  };
  const handleNavClick = (index: number) => {
    setSelectedNavItem(index);
    setOpenNavChildren((prev: boolean) => !prev);
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await getAllFridayTestBatch();
      if (!response?.data) return;

      setFetchedBatches(response?.data || []);
      setBatches(response?.data || []);
    } catch (error: any) {
      showAlert({ title: "Error", text: error.message || error.data || "An error occurred", severity: "error" })
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBatches();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
  const fetchAdminSettings = async () => {
    try {
      const response = await getAdminSetting();
      if (!response?.data) return;
      setAdminSettings(response?.data || null);
    } catch (error: any) {

    }
  };
  useEffect(() => {
    fetchAdminSettings();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const handleBatchMenu = (event: React.MouseEvent<HTMLElement>) => {
    setBatchAnchorEl(event.currentTarget);
  };

  const handleBatchClose = () => {
    setBatchAnchorEl(null);
  };
  const handleBatchClick = (batch: any) => {
    setSelectedBatch(batch);
    handleBatchClose();
  };

  const handleLogout = () => {
    try {
      setLoading(true);
      //   handleClose();
      signOut();
    } catch {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <MobileNavMenu navLists={navLists} userType={userType} />
      <Box
        sx={{
          //  position:"relative",
          backgroundColor: theme.palette.primary.main,
          width: sideNavWidth,
          minHeight: "100vh",
          position: "fixed",
          padding: "30px",
          paddingX: "25px",
          transition: "ease-in-out 0.6s",
          display: { xs: "none", md: "block" },
        }}
      >
        {isMobileNav ? (
          ""
        ) : (
          <Box
            display={"flex"}
            flexDirection={"column"}
            gap={"10px"}
            sx={{ transition: "ease-in-out 0.6s" }}
          >
            {/* <Image
            width={100}
            height={27}
            src={"/assets/images/venekaWhite.png"}
            alt="Logo image"
          /> */}
            <Typography
              variant="h6"
              color={theme.palette.common.white}
              gutterBottom
            >
              {COMPANY_NAME}
            </Typography>

            {/* {userType === "admin" ? (
              <Box>
                <Box
                  display={"flex"}
                  gap={"5px"}
                  alignItems={"center"}
                  mb={2}
                  sx={{
                    color: theme.palette.common.white,
                    cursor: "pointer",
                    width: "fit-content",
                    padding: "1px 1px",
                    transition: "ease-in-out 0.6s",
                    "&:hover": {
                      backgroundColor: "#4698CA",
                      color: theme.palette.primary.main,
                      borderRadius: "3px",
                    },
                  }}
                  onClick={handleBatchMenu}
                >
                  <Typography variant="caption">
                    {`${selectedBatch?.academicYearDetails?.name} - ${selectedBatch?.name
                      }`?.toUpperCase()}
                  </Typography>
                  <ArrowDropDownIcon sx={{ marginBottom: "3px" }} />
                </Box>
                <Menu
                  id="menu-batch"
                  anchorEl={batchAnchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(batchAnchorEl)}
                  onClose={handleBatchClose}
                >
                  {batches.map((batch: any, index: number) => (
                    <MenuItem
                      key={index}
                      sx={{ fontSize: "12px" }}
                      onClick={() => handleBatchClick(batch)}
                    >
                      {`${batch?.academicYearDetails?.name} - ${batch?.name
                        }`?.toUpperCase()}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) :
              null
            } */}

            <Box display={"flex"} flexDirection={"column"} gap={"5px"}>
              {allowedNavItems.map((nav: any, index: number) => (
                <React.Fragment key={nav.id + nav.name + index}>
                  <StyledNavItem
                    key={nav.id + nav.name}
                    component={Link}
                    onClick={() => handleNavClick(index)}
                    href={nav.href || ""}
                    className={`${pathname.includes(nav?.name?.toLowerCase()) ||
                      pathname === nav.href
                      ? "active"
                      : ""
                      }`}
                  >
                    <Typography fontSize={"14px"}>{nav.name}</Typography>
                    {nav.children && (
                      <ArrowDropDownIcon
                        sx={{
                          marginBottom: "3px",
                          rotate:
                            openNavChildren &&
                              selectedNavItem === index &&
                              nav.children
                              ? "180deg"
                              : "0deg",
                        }}
                      />
                    )}
                  </StyledNavItem>

                  {openNavChildren &&
                    selectedNavItem === index &&
                    nav.children && (
                      <Box
                        ml={3}
                        mt={1}
                        display={"flex"}
                        flexDirection={"column"}
                        gap={"10px"}
                      >
                        {nav.children.map((child: any) => (
                          <StyledNavItem
                            key={child.id + child.href}
                            component={Link}
                            href={child.href}
                            className={`child ${pathname.includes(child.href) ||
                              pathname === child.href
                              ? "child-active"
                              : ""
                              }`}
                          >
                            <Typography fontSize={"14px"}>
                              {child.name}
                            </Typography>
                          </StyledNavItem>
                        ))}
                      </Box>
                    )}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}

        <IconButton
          style={{
            backgroundColor: theme.palette.background.paper,
            position: "absolute",
            top: "17%",
            right: "-15px",
            fontSize: "16px",
            border: "1px solid #E7E9EE",
          }}
          onClick={handleClick}
        >
          {isMobileNav ? (
            <ArrowForwardIosIcon sx={{ fontSize: "inherit" }} />
          ) : (
            <ArrowBackIosNewIcon sx={{ fontSize: "inherit" }} />
          )}
        </IconButton>
        <Box
          sx={{
            position: "absolute",
            bottom: "30px",
            left: isMobileNav ? "10px" : "40px",
            display: "flex",
            gap: "10px",
            color: theme.palette.common.white,
            cursor: "pointer",
          }}
        >
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              padding: "1px 5px",
              transition: "ease-in-out 0.6s",
              "&:hover": {
                backgroundColor: "#4698CA",
                color: theme.palette.primary.main,
                borderRadius: "3px",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </>
  );
}
