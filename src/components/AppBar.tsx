"use client";

import * as React from "react";
import { styled, alpha, useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import {
  Button,
  Drawer,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signOut, useSession } from "next-auth/react";
// import { admissionNavLists } from "@/utils/navList";
import PersonIcon from "@mui/icons-material/Person";
import { changeElectionUserPassword } from "@/utils/serverActions/electionUser";
import LoadingAlert from "@/components/LoadingAlert";
import { showAlert } from "./Alerts";

interface Props {
  children: React.ReactElement;
}

function ElevationScroll(props: Props) {
  const { children } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    // elevation: trigger ? 4 : 0,
  });
}

export default function Appbar() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openChangePassword, setOpenChangePassword] = React.useState(false);
  const [openConfirmModal, setOpenConfirmModal] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = React.useState({
    current: "",
    new: "",
    confirm: "",
  });

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleClickShowPassword = (field: string) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field as keyof typeof showPassword],
    });
  };

  const handlePasswordChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswords({
        ...passwords,
        [field]: event.target.value,
      });
    };

  const handleOpenChangePassword = () => {
    setOpenChangePassword(true);
    handleMenuClose();
  };

  const handleCloseChangePassword = () => {
    setOpenChangePassword(false);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleSubmit = () => {
    setOpenConfirmModal(true);
  };

  const handleConfirm = async () => {
    setOpenConfirmModal(false);
    handleCloseChangePassword();

    try {
      setLoading(true);
      const response = await changeElectionUserPassword({
        id: session?.user?._id as string,
        oldPassword: passwords.current,
        newPassword: passwords.new,
      });
      console.log("response", response);
      if (!response.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: response.message || "An error occurred",
        });
        return;
      }
      showAlert({
        title: "Success",
        severity: "success",
        text: response.message || "Password changed successfully",
      });
      setTimeout(() => {
        handleSignOut();
        // window.location.reload();
      }, 1000);
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error?.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleOpenChangePassword}>Change password</MenuItem>
      <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
    </Menu>
  );

  return (
    <>
      {" "}
      <LoadingAlert open={loading} />
      <ElevationScroll>
        <AppBar
          // color="transparent"
          position="sticky"
          sx={{
            pt: "5px",
          }}
        >
          <Toolbar>
            <Link href="/election">
              <Image
                src={"/images/aquinasLogo.png"}
                alt="logo"
                width={45}
                height={45}
                style={{ backgroundColor: "white" }}
              />
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body1" component="p">
              {session?.user?.firstName} {session?.user?.lastName}
            </Typography>
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      {renderMenu}
      {/* Change Password Dialog */}
      <Dialog open={openChangePassword} onClose={handleCloseChangePassword}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPassword.current ? "text" : "password"}
              value={passwords.current}
              onChange={handlePasswordChange("current")}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword("current")}
                      edge="end"
                    >
                      {showPassword.current ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPassword.new ? "text" : "password"}
              value={passwords.new}
              onChange={handlePasswordChange("new")}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword("new")}
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPassword.confirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={handlePasswordChange("confirm")}
              margin="normal"
              error={
                passwords.new !== "" && passwords.new !== passwords.confirm
              }
              helperText={
                passwords.new !== "" && passwords.new !== passwords.confirm
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword("confirm")}
                      edge="end"
                    >
                      {showPassword.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChangePassword}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !passwords.current ||
              !passwords.new ||
              !passwords.confirm ||
              passwords.new !== passwords.confirm
            }
            variant="contained"
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
      >
        <DialogTitle>Confirm Password Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change your password?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
