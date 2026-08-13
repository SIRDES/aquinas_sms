import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  IconButton,
  DialogActions,
  Divider,
  CircularProgress,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ProgressAlert from "../../ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";
import {
  addElectionCategory,
  updateElectionCategory,
} from "@/utils/serverActions/electionCategory";
import { showAlert } from "@/components/Alerts";

interface AddOrEditCategoryModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchFunction?: () => void;
  electionId: string;
  isEdit?: boolean;
  category?: { name: string; shortCode: string; _id: string };
}

const AddOrEditCategoryModal: React.FC<AddOrEditCategoryModalProps> = ({
  open,
  setOpen,
  refetchFunction,
  electionId,
  isEdit,
  category,
}) => {
  const [value, setValue] = useState<string>("");
  const [shortCode, setShortCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });
  const handleChange = (e: any, key: string) => {
    if (key === "name") setValue(e.target.value);
    if (key === "shortCode") setShortCode(e.target.value);
  };

  useEffect(() => {
    if (isEdit) {
      setValue(category?.name as string);
      setShortCode(category?.shortCode as string);
    }
  }, [isEdit, category]);

  const onClose = () => {
    setOpen(false);
    setValue("");
    setShortCode("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // console.log(value);
    // onClose();
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await updateElectionCategory({
          id: category?._id as string,
          name: value.trim()?.toUpperCase(),
          shortCode: shortCode.trim()?.toUpperCase(),
        });
        console.log("res", res);
      } else {
        res = await addElectionCategory({
          name: value.trim()?.toUpperCase(),
          electionId,
          shortCode: shortCode.trim()?.toUpperCase(),
        });
        console.log("res", res);
      }
      if (res.success === false) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.message || "An error occurred",
        });
        return;
      }

      if (refetchFunction) {
        refetchFunction();
      }
      // onClose();
      showAlert({
        title: "Success",
        severity: "success",
        text: isEdit
          ? "Category updated successfully"
          : "Category added successfully",
      });
      // setSnackbar({
      //   open: true,
      //   message: isEdit
      //     ? "Category updated successfully"
      //     : "Category added successfully",
      //   severity: "success",
      // });
    } catch (error: any) {
      console.log(error);
      // onClose();
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <>
      {/* <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
      /> */}
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="add-category-modal"
        aria-describedby="delete-modal-description"
        maxWidth="sm"
        fullWidth
        component={"form"}
        onSubmit={handleSubmit}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 2,
            //   paddingX: 1,
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {isEdit === true ? "Edit category" : "Add new category"}
          </Typography>
          <IconButton onClick={onClose} sx={{ padding: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" id="delete-modal-title">
              Name
            </Typography>

            <TextField
              fullWidth
              size="small"
              value={value}
              variant="outlined"
              placeholder="enter category name"
              sx={{ mt: 2 }}
              onChange={(e) => handleChange(e, "name")}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1" id="delete-modal-title">
              Short code
            </Typography>

            <TextField
              fullWidth
              size="small"
              value={shortCode}
              variant="outlined"
              placeholder="enter category short code"
              sx={{ mt: 2 }}
              onChange={(e) => handleChange(e, "shortCode")}
              required
            />
          </Grid>
        </Grid>

        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={onClose}
            color="primary"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            disabled={loading || value === "" || shortCode === ""}
          >
            {loading ? <CircularProgress size={25} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddOrEditCategoryModal;
