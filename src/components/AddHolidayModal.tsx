import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import { showAlert } from "@/components/Alerts";
import { createAttendanceHoliday } from "@/utils/serverActions/attendanceHoliday";

interface AddHolidayModalProps {
  open: boolean;
  onClose: () => void;
  // onSuccess: () => void;
}

const AddHolidayModal: React.FC<AddHolidayModalProps> = ({ open, onClose }) => {
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayDescription, setHolidayDescription] = useState("");
  const [holidayDuration, setHolidayDuration] = useState("full_day");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setHolidayDate("");
    setHolidayDescription("");
    setHolidayDuration("full_day");
  };

  const handleSaveHoliday = async () => {
    if (!holidayDate || !holidayDescription) {
      showAlert({
        title: "error",
        text: "Date and description are required",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await createAttendanceHoliday({
        date: holidayDate,
        description: holidayDescription,
        duration: holidayDuration,
      });

      if (!response.success) {
        showAlert({
          title: "error",
          text: response.message || "Error occurred",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      showAlert({
        title: "success",
        text: response.message || "Holiday created successfully",
        severity: "success",
      });

      // handleClose();
      // onSuccess();
    } catch (error: any) {
      showAlert({
        title: "error",
        text: error.message || "Error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#00204a" }}>Add a Holiday</DialogTitle>
      <form onSubmit={(e) => { e.preventDefault(); handleSaveHoliday(); }}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={holidayDescription}
              onChange={(e) => setHolidayDescription(e.target.value)}
              placeholder="e.g. Independence Day"
              required
              disabled={loading}
            />
            <TextField
              label="Holiday Date"
              type="date"
              variant="outlined"
              fullWidth
              value={holidayDate}
              required
              onChange={(e) => setHolidayDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
            <TextField
              select
              label="Duration"
              variant="outlined"
              fullWidth
              value={holidayDuration}
              onChange={(e) => setHolidayDuration(e.target.value)}
              required
              disabled={loading}
            >
              <MenuItem value="full_day">Full Day</MenuItem>
              <MenuItem value="morning">Morning Only</MenuItem>
              <MenuItem value="afternoon">Afternoon Only</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: "#0f172a", "&:hover": { backgroundColor: "#1e293b" }, fontWeight: 600 }}>
            {loading ? "Saving..." : "Save Holiday"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddHolidayModal;
