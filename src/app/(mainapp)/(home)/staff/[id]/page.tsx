"use client";

import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
} from "@mui/material";
import React, { use, useEffect, useState } from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import Link from "next/link";
import { activateDeactivateStaffAccount, getStaffById, updateStaff } from "@/utils/serverActions/user";
import dayjs from "dayjs";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useSession } from "next-auth/react";
import { USER_PERMISSIONS, userPermissions } from "@/utils/common";

export default function UserDetails({ params }: { params: Promise<{ id: string }> }) {
  // const theme = useTheme();
  const { data: session } = useSession();
  const currentUser = session?.user;
  const { id } = use(params);
  const [orderData, setOrderData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [openConfirmActivation, setOpenConfirmActivation] = useState(false);
  const [checked, setChecked] = useState(false);


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setChecked(event.target.checked);
    setOpenConfirmActivation(true);
  };
  const handleChangeUserStatus = async () => {
    if (!currentUser?.userPermissions?.includes(USER_PERMISSIONS.USER_ENABLE_DISABLE)) {
      showAlert({
        title: "Error",
        text: "You don't have permission to perform this action",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    setOpenConfirmActivation(false);
    try {

      const res = await activateDeactivateStaffAccount(id, { isSuspended: !orderData?.isSuspended });
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while updating user status",
          severity: "error",
        });
        return;
      }
      fetchUserData();
      showAlert({
        title: "Success",
        text: `User status changed to ${checked ? "active" : "inactive"} successfully`,
        severity: "success"
      });
      // setSnackbar({
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while updating user status",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fetchUserData = async () => {
    setLoading(true);
    setOrderData({});

    try {
      const res = await getStaffById(id as string);
      console.log("userDetails", res?.data);
      if (!res.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while fetching user details",
          severity: "error",
        });
        return;
      }

      const userDetails = res?.data;
      setChecked(userDetails.isSuspended ? false : true);
      // console.log(userDetails);
      setOrderData(userDetails);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while fetching user details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      <LoadingAlert open={loading} />
      <ConfirmationDialog
        open={openConfirmActivation}
        setOpen={setOpenConfirmActivation}
        handleConfirmation={() => handleChangeUserStatus()}
        message="Are you sure you want to change user status?"
        title="Change user status"
      />

      <Box mb={10}>

        <>
          <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }}>
            <Link
              href={`/staff`}
              style={{
                textDecoration: "none",
                color: "black",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <ArrowUpwardIcon />
                Users
              </Box>
            </Link>
          </Box>
          <Divider />
        </>

        <Box
          sx={{
            px: { xs: 1, sm: 2, md: 4 },
            mb: 2,
            mt: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            mb={2}
          // mt={1}
          // px={{ xs: 1, sm: 2, md: 3 }}
          >
            <Typography variant="body1" fontWeight={700} gutterBottom>
              User Details
            </Typography>
            <Box display="flex" gap={4}>
              {orderData?._id && (
                <>
                  {currentUser?.userPermissions?.includes(USER_PERMISSIONS.USER_ENABLE_DISABLE) && (
                    <FormGroup>
                      <FormControlLabel
                        label={
                          <Typography
                            variant="body1"
                            style={{ fontWeight: "bold" }}
                          >
                            {checked
                              ? "Deactivate user account"
                              : "Activate user account"}
                          </Typography>
                        }
                        labelPlacement="start"
                        control={
                          <Switch
                            checked={checked}
                            onChange={handleStatusChange}
                          />
                        }
                      />
                    </FormGroup>
                  )}


                  <Box>

                    <Button
                      variant="contained"
                      disableElevation
                      onClick={(event) =>
                        handleMenuClick(event)
                      }

                      size="small"
                    // startIcon={<EditIcon />}
                    >
                      Action
                    </Button>

                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={open}
                      transformOrigin={{
                        horizontal: "right",
                        vertical: "top",
                      }}
                      anchorOrigin={{
                        horizontal: "right",
                        vertical: "bottom",
                      }}
                      onClose={handleClose}
                      MenuListProps={{
                        "aria-labelledby": "basic-button",
                      }}
                    >
                      {currentUser?.userPermissions?.includes(USER_PERMISSIONS.USER_UPDATE) && (
                        <MenuItem component={Link}
                          href={`/staff/${id}/edit`}>
                          Edit
                        </MenuItem>
                      )}
                      {currentUser?.userPermissions?.includes(USER_PERMISSIONS.USER_RESET_PASSWORD) && (
                        <MenuItem
                          component={Link}
                          href={`/staff/${id}/reset-password`}
                        >
                          Reset password
                        </MenuItem>
                      )}
                    </Menu>
                  </Box>
                </>
              )}

            </Box>
          </Box>
          {Object.keys(orderData).length !== 0 && (

            <Card >
              <Grid container spacing={2} sx={{ p: 2 }}>

                {/*  name */}
                <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.firstName?.toUpperCase() + " " + orderData?.lastName?.toUpperCase()}
                  </Typography>
                </Grid>
                {/* username */}
                {/* <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Username:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.username}
                  </Typography>
                </Grid> */}
                {/* gender */}
                {/* <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Gender:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.gender}
                  </Typography>
                </Grid> */}
                {/* phone number */}
                {/* <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Phone number:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.phoneNumber}
                  </Typography>
                </Grid> */}
                {/* role */}
                <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Role:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.role?.toUpperCase()}
                  </Typography>
                </Grid>

                {/* subject */}
                <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Subject:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.subjectDetails?.map((s: any) => s.name).join(", ") || "N/A"}
                  </Typography>
                </Grid>

                {/* status */}
                <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Status:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.isSuspended
                      ? <Typography variant="body1" sx={{ color: "red" }}>Inactive</Typography>
                      : <Typography variant="body1" sx={{ color: "green" }}>Active</Typography>}
                  </Typography>
                </Grid>
                {/* Created at */}
                <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Created at:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.createdAt
                      ? dayjs(orderData.createdAt).format("ddd DD MMM YYYY HH:mm:ss A")
                      : ""}
                  </Typography>
                </Grid>
                {/* Updated at */}
                <Grid
                  item xs={12} sm={12} md={6}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Updated at:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {orderData?.updatedAt ? dayjs(orderData.updatedAt).format("ddd DD MMM YYYY HH:mm:ss A") : ""}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

          )}

          {Object.keys(orderData).length !== 0 && (
            <Card sx={{ mt: 3 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                  Staff Permissions
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(
                    userPermissions.reduce((acc, permission) => {
                      const [group] = permission.split(":");
                      if (!acc[group]) acc[group] = [];
                      acc[group].push(permission);
                      return acc;
                    }, {} as Record<string, string[]>)
                  ).map(([group, permissions]) => {
                    const selectedPermissions = orderData.userPermissions || [];
                    const isAllSelected = permissions.every((p) => selectedPermissions.includes(p));
                    const isIndeterminate = permissions.some((p) => selectedPermissions.includes(p)) && !isAllSelected;

                    return (
                      <Grid item xs={12} md={6} key={group}>
                        <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:before': { display: 'none' }, overflow: 'hidden' }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <FormControlLabel
                              onClick={(event) => event.stopPropagation()}
                              onFocus={(event) => event.stopPropagation()}
                              control={
                                <Checkbox
                                  checked={isAllSelected}
                                  indeterminate={isIndeterminate}
                                  disabled
                                />
                              }
                              label={<Typography fontWeight="bold">{group.replace(/_/g, ' ')}</Typography>}
                            />
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {permissions.map((permission) => {
                              const isSelected = selectedPermissions.includes(permission);

                              return (
                                <FormControlLabel
                                  key={permission}
                                  control={
                                    <Checkbox
                                      checked={isSelected}
                                      disabled
                                      size="small"
                                    />
                                  }
                                  label={permission.split(":")[1].replace(/_/g, ' ')}
                                  sx={{ ml: 4 }}
                                />
                              );
                            })}
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Card>
          )}
        </Box>
      </Box>
    </>
  );
}
