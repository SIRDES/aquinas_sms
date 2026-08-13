import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert,
  Snackbar,
  Typography,
  SelectChangeEvent,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material";
import { showAlert } from "../Alerts";
import { addAward, updateAward } from "@/utils/serverActions/election";
import { useAwards } from "@/hooks/useAwards";
import { IElection } from "@/models/Election";

interface IAwardForm {
  _id: string;
  name: string;
  endDate: string;
  status: "Active" | "Inactive";
}

const AwardsSettings: React.FC = () => {
  const {
    allAwards,
    isLoading: isLoadingAwards,
    refetch: refetchExams,
  } = useAwards();

  const [filteredExams, setFilteredExams] = useState<IElection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentExam, setCurrentExam] = useState<IElection | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<IAwardForm, "_id">>({
    name: "",
    endDate: new Date().toISOString().split("T")[0],
    status: "Active",
  });
  const resetForm = () => {
    setFormData({
      name: "",
      endDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });
  };
  // Available options
  const statuses = ["Active", "Inactive"];

  // Fetch exams from API (mocked for now)
  useEffect(() => {
    setFilteredExams(allAwards);
  }, [allAwards]);

  // Filter exams based on search term
  useEffect(() => {
    const filtered = allAwards.filter(
      (exam: any) =>
        exam?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam?.form?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExams(filtered);
  }, [searchTerm, allAwards]);

  // Handle form input changes
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | string[]>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open view modal
  const handleView = (exam: IElection) => {
    setCurrentExam(exam);
    setOpenViewModal(true);
  };

  // Open edit modal
  const handleEdit = (exam: IElection) => {
    setCurrentExam(exam);
    setFormData({
      name: exam.name,
      endDate: new Date(exam.endDate).toISOString().split("T")[0],
      status: exam.isSuspended ? "Inactive" : "Active",
    });
    setIsEditMode(true);
    setOpenAddEditModal(true);
  };

  // Open delete confirmation
  // const handleDeleteClick = (exam: IElection) => {
  //   setCurrentExam(exam);
  //   setOpenDeleteDialog(true);
  // };

  // Confirm delete
  const confirmDelete = () => {
    if (currentExam) {
      // delete exam from API
      // setExams((prev) => prev.filter((exam) => exam.id !== currentExam.id));
      setOpenDeleteDialog(false);
      setCurrentExam(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset form and close modal
    setIsLoading(true);
    try {
      let response;
      if (isEditMode && currentExam) {
        // Update existing exam
        // console.log("currentExam", currentExam);
        response = await updateAward({
          id: currentExam._id,
          name: formData.name,
          endDate: new Date(formData.endDate),
          isSuspended:
            formData.status?.toLowerCase() === "inactive" ? true : false,
        });
      } else {
        // Add new exam
        const data = {
          name: formData.name,
          endDate: new Date(formData.endDate),
          // isSuspended: formData.status?.toLowerCase() === "inactive" ? true : false,
        };
        // console.log("new form data", formData);
        response = await addAward(data);
      }

      setOpenAddEditModal(false);
      setIsEditMode(false);
      if (response?.success) {
        showAlert({
          title: "Success",
          severity: "success",
          text: response?.message || "Success",
        });
        resetForm();
        refetchExams();
        // window.location.reload();
      } else {
        showAlert({
          title: "Error",
          severity: "error",
          text: response?.message || "An error occurred",
        });
      }
    } catch (err: any) {
      console.log(err);
      showAlert({
        title: "Error",
        severity: "error",
        text: err?.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Awards Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            setIsEditMode(false);
            setOpenAddEditModal(true);
          }}
        >
          Add Award
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search awards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
        }}
      />

      {/* Exams Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>End Date</TableCell>

              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingAwards ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading awards...
                </TableCell>
              </TableRow>
            ) : filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell>{exam.name.toUpperCase()}</TableCell>

                  <TableCell>{formatDate(exam.endDate.toString())}</TableCell>

                  <TableCell>
                    <Chip
                      label={exam.isSuspended === true ? "Inactive" : "Active"}
                      color={exam.isSuspended === true ? "error" : "success"}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleView(exam)}
                      color="primary"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEdit(exam)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    {/* <IconButton
                      onClick={() => handleDeleteClick(exam)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton> */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No awards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Exam Modal */}
      <Dialog
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Award Details</DialogTitle>
        <DialogContent>
          {currentExam && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Award Name
              </Typography>
              <Typography variant="h6" gutterBottom>
                {currentExam.name}
              </Typography>
              {/* <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Academic Year
                </Typography>
                <Typography>
                  {currentExam?.academicYearDetails?.name}
                </Typography>
              </Box> */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  End Date
                </Typography>
                <Typography>
                  {formatDate(currentExam.endDate.toString())}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={
                    currentExam.isSuspended === true ? "Inactive" : "Active"
                  }
                  color={currentExam.isSuspended === true ? "error" : "success"}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewModal(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Award Modal */}
      <Dialog
        open={openAddEditModal}
        onClose={() => setOpenAddEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {isEditMode ? "Edit Award" : "Add New Award"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Award Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
              />

              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {isEditMode && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddEditModal(false)} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              color="primary"
              variant="contained"
            >
              {isLoading ? "Loading..." : isEditMode ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the award "{currentExam?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AwardsSettings;
