import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { showAlert } from "@/components/Alerts";
import {
  addNewPaymentWithdrawal,
} from "@/utils/serverActions/paymentWithdrawals";


interface AddPaymentWithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPaymentWithdrawalModal: React.FC<AddPaymentWithdrawalModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<string>("Pending");
  const [lastPaymentTransactionId, setLastPaymentTransactionId] =
    useState<string>("");
  const [firstPaymentTransactionId, setFirstPaymentTransactionId] =
    useState<string>("");

  const [submitting, setSubmitting] = useState(false);



  const handleReset = () => {
    setStatus("Pending");
    setFirstPaymentTransactionId("");
    setLastPaymentTransactionId("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {

    if (!firstPaymentTransactionId.trim()) {
      showAlert({
        title: "Validation Error",
        text: "Please enter the first payment transaction ID.",
        severity: "error",
      });
      return;
    }
    if (!lastPaymentTransactionId.trim()) {
      showAlert({
        title: "Validation Error",
        text: "Please enter the last payment transaction ID.",
        severity: "error",
      });
      return;
    }

    if (!status) {
      showAlert({
        title: "Validation Error",
        text: "Please select a status.",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await addNewPaymentWithdrawal({
        status: status.toUpperCase(),
        firstPaymentTransaction: firstPaymentTransactionId.trim(),
        lastPaymentTransaction: lastPaymentTransactionId.trim(),
      });

      if (response.success) {
        showAlert({
          title: "Success",
          text: response.message || "Payment withdrawal added successfully",
          severity: "success",
        });
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        showAlert({
          title: "Error",
          text: response.message || "Failed to add payment withdrawal",
          severity: "error",
        });
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An unexpected error occurred",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#00204a" }}>
        Add New Payment Withdrawal
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Status Selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="withdrawal-status-label">Status</InputLabel>
            <Select
              labelId="withdrawal-status-label"
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Success">Success</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </Select>
          </FormControl>

          {/* First Payment Transaction Autocomplete */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
              First Payment Transaction ID
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Enter the transaction _id..."
              value={firstPaymentTransactionId}
              onChange={(e) => setFirstPaymentTransactionId(e.target.value)}
            />
          </Box>

          {/* Last Payment Transaction Text Input */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
              Last Payment Transaction ID
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter the transaction _id..."
              value={lastPaymentTransactionId}
              onChange={(e) => setLastPaymentTransactionId(e.target.value)}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : "Add Withdrawal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentWithdrawalModal;
