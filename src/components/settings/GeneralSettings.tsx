"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  Skeleton,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { showAlert } from "../Alerts";
import PermissionGuard from "../PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";
import LoadingAlert from "@/components/LoadingAlert";
import AutohideSnackbar from "@/components/AutohideSnackbar";
import { getAdminSettingAtSettingsPage, updateAdminSetting } from "@/utils/serverActions/adminSettings";

const smsProviders = ["ARKESEL", "NALO", "MNOTIFY"]


const GeneralSettings: React.FC = () => {
  const theme = useTheme();
  const [adminSettings, setAdminSettings] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [savingSMSProvider, setSavingSMSProvider] = useState(false);
  const [smsProvider, setSmsProvider] = useState("");
  const [initialSmsProvider, setInitialSmsProvider] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });


  const fetchAdminSettingsData = async () => {
    setLoading(true);
    try {
      const res = await getAdminSettingAtSettingsPage();

      console.log("getAdminSetting res", res);

      if (res.success) {
        setAdminSettings(res.data || []);
        if (res.data?.smsProvider) {
          setSmsProvider(res.data.smsProvider);
          setInitialSmsProvider(res.data.smsProvider);
        }
      } else {
        showAlert({
          title: "Error",
          text: res.message || "Failed to fetch audit logs",
          severity: "error",
        });
      }
    } catch (error: any) {
      // console.error("error", error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while fetching audit logs",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };



  // initial render to fetch all audit logs 
  useEffect(() => {
    fetchAdminSettingsData();
  }, []);

  const handleSaveSMSProvider = async () => {
    // console.log("handle save sms provider", smsProvider);
    try {
      setSavingSMSProvider(true);
      const res = await updateAdminSetting({ smsProvider });
      if (res.success) {
        setInitialSmsProvider(smsProvider);
        setSnackbar({ open: true, message: "SMS provider updated successfully", severity: "success" });
      } else {
        showAlert({
          title: "Error",
          text: res.message || "Failed to update SMS provider",
          severity: "error",
        });
      }
    } catch (error: any) {
      // console.error("error", error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while updating SMS provider",
        severity: "error",
      });
    } finally {
      setSavingSMSProvider(false);
    }
  }


  return (
    <Box>
      <LoadingAlert open={loading} />
      <AutohideSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
      <Box
        sx={{
          mb: 3,
        }}
      >
        {loading ? (
          <Box>
            <Skeleton variant="text" width={120} height={28} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" width={200} height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Box>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>SMS Provider</Typography>
            <Box sx={{}}>
              <Select
                value={smsProvider}
                onChange={(e: SelectChangeEvent) => setSmsProvider(e.target.value)}
                size="small"
                displayEmpty
                sx={{ minWidth: 200, mb: 2 }}
              >
                <MenuItem value="" disabled>
                  Select SMS Provider
                </MenuItem>
                {smsProviders.map((provider) => (
                  <MenuItem key={provider} value={provider}>
                    {provider}
                  </MenuItem>
                ))}
              </Select>
              <br />
              <PermissionGuard requiredPermission={USER_PERMISSIONS.SETTINGS_SMS_PROVIDER_UPDATE}>
                <Button
                  variant="contained"
                  onClick={handleSaveSMSProvider}
                  sx={{ textTransform: "none" }}
                  disabled={!smsProvider || smsProvider === initialSmsProvider || savingSMSProvider}
                >
                  {savingSMSProvider ? <CircularProgress size={24} /> : "Save"}
                </Button>
              </PermissionGuard>
            </Box>
          </>
        )}
      </Box>

    </Box>
  );
};

export default GeneralSettings;
