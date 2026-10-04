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
import { useSubjects } from "@/hooks/useSubjects";
import { ISubject } from "@/models/Subject";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { IAcademicYear } from "@/models/AcademicYear";
import { IExam, useExams } from "@/hooks/useExams";
import { CustomizedSelect } from "../CustomizedSelect";
import {
  addFridayTestBatch,
  updateFridayTestBatch,
} from "@/utils/serverActions/fridayTestBatch";
import { showAlert } from "../Alerts";
import PermissionGuard from "../PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";

interface IExamForm {
  _id: string;
  name: string;
  academicYear: string;
  date: string;
  form: string;
  examType: string;
  status: "Active" | "Inactive";
  isSemester: boolean;
  isNewCurriculum: boolean;
  yearGroup: string;
  subjects: string[];
}

const ExamSettings: React.FC = () => {
  // State for exams data
  const { subjects } = useSubjects();
  const {
    exams,
    isLoading: isExamsLoading,
    refetch: refetchExams,
  } = useExams({ getIsSuspended: true });
  const { academicYears } = useAcademicYears();
  // const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<IExam[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // console.log("exams", exams);
  // Modal states
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentExam, setCurrentExam] = useState<IExam | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<IExamForm, "_id">>({
    name: "",
    academicYear: "",
    date: new Date().toISOString().split("T")[0],
    form: "",
    examType: "",
    status: "Active",
    isSemester: true,
    isNewCurriculum: true,
    yearGroup: "",
    subjects: [],
  });
  const resetForm = () => {
    setFormData({
      name: "",
      academicYear: academicYears[0]?._id || "",
      date: new Date().toISOString().split("T")[0],
      form: "",
      examType: "",
      status: "Active",
      isSemester: true,
      isNewCurriculum: true,
      yearGroup: "",
      subjects: [],
    });
  };
  // Available options
  const examTypes = ["Semester 1", "Semester 2", "Friday Test"];
  const statuses = ["Active", "Inactive"];
  // const yearGroups = ["2023", "2024", "2025","2026","2027"];
  const yearGroups = [
    new Date().getFullYear(),
    new Date().getFullYear() + 1,
    new Date().getFullYear() + 2,
    new Date().getFullYear() + 3,
  ];

  // Fetch exams from API (mocked for now)
  useEffect(() => {
    setFilteredExams(exams);
  }, [exams]);

  useEffect(() => {
    if (academicYears.length > 0) {
      resetForm();
    }
  }, [academicYears]);

  // Filter exams based on search term
  useEffect(() => {
    const filtered = exams.filter(
      (exam) =>
        exam?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam?.form?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExams(filtered);
  }, [searchTerm, exams]);

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

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle subjects selection
  const handleSubjectsChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      subjects: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // Open view modal
  const handleView = (exam: IExam) => {
    setCurrentExam(exam);
    setOpenViewModal(true);
  };

  // Open edit modal
  const handleEdit = (exam: IExam) => {
    setCurrentExam(exam);
    console.log("exam", exam);
    setFormData({
      name: exam.name,
      academicYear: exam.academicYearDetails?._id || "",
      date: new Date(exam.date).toISOString().split("T")[0],
      form: exam.form,
      examType: exam.examType || "",
      status: exam.isSuspended ? "Inactive" : "Active",
      isSemester: exam.isSemester || false,
      isNewCurriculum: exam.isNewCurriculum || false,
      yearGroup: exam.yearGroup,
      subjects: exam.subjectIds?.map((subject) => subject.toString()) || [],
    });
    setIsEditMode(true);
    setOpenAddEditModal(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (exam: IExam) => {
    setCurrentExam(exam);
    setOpenDeleteDialog(true);
  };

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
        console.log("currentExam", formData);
        response = await updateFridayTestBatch(currentExam._id, {
          academicYear: formData.academicYear,
          name: formData.name,
          date: new Date(formData.date),
          subjectIds: formData.subjects,
          examType: formData.examType,
          yearGroup: formData.yearGroup,
          form: formData.form,
          isNewCurriculum: formData.isNewCurriculum,
          isSemester: formData.isSemester,
          isSuspended:
            formData.status?.toLowerCase() === "inactive" ? true : false,
        });
      } else {
        // Add new exam
        const data = {
          academicYear: formData.academicYear,
          name: formData.name,
          date: formData.date,
          subjectIds: formData.subjects,
          examType: formData.examType,
          yearGroup: formData.yearGroup,
          form: formData.form,
          isNewCurriculum: formData.isNewCurriculum,
          isSemester: formData.isSemester,
        };
        console.log("new form data", formData);
        response = await addFridayTestBatch(data);
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
        // refetchExams();
        window.location.reload();
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
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Exam Management</Typography>
        <PermissionGuard requiredPermission={USER_PERMISSIONS.SETTINGS_EXAMS_CREATE}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => {
              setIsEditMode(false);
              setOpenAddEditModal(true);
            }}
          >
            Add Exam
          </Button>
        </PermissionGuard>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search exams..."
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
              <TableCell>Academic Year</TableCell>
              <TableCell>Year Group</TableCell>
              <TableCell>Date</TableCell>
              {/* <TableCell>Type</TableCell> */}
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isExamsLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading exams...
                </TableCell>
              </TableRow>
            ) : filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell>{exam.name.toUpperCase()}</TableCell>
                  <TableCell>
                    {exam.academicYearDetails.name?.toUpperCase()}
                  </TableCell>
                  <TableCell>{exam.yearGroup}</TableCell>
                  <TableCell>{formatDate(exam.date.toString())}</TableCell>
                  {/* <TableCell>{exam.examType}</TableCell> */}
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

                    <PermissionGuard requiredPermission={USER_PERMISSIONS.SETTINGS_EXAMS_UPDATE}>
                      <IconButton
                        onClick={() => handleEdit(exam)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </PermissionGuard>
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
                  No exams found
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
        <DialogTitle>Exam Details</DialogTitle>
        <DialogContent>
          {currentExam && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Exam Name
              </Typography>
              <Typography variant="h6" gutterBottom>
                {currentExam.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Academic Year
                </Typography>
                <Typography>
                  {currentExam?.academicYearDetails?.name}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Date
                </Typography>
                <Typography>
                  {formatDate(currentExam.date.toString())}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Form
                </Typography>
                <Typography>{currentExam.form}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Exam Type
                </Typography>
                <Typography>{currentExam.examType}</Typography>
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
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Is Semester
                </Typography>
                <Typography>{currentExam.isSemester ? "Yes" : "No"}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  New Curriculum
                </Typography>
                <Typography>
                  {currentExam.isNewCurriculum ? "Yes" : "No"}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Year Group
                </Typography>
                <Typography>{currentExam.yearGroup}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Subjects
                </Typography>
                {currentExam?.subjectIds?.length === 0 ? (
                  <Typography>No subjects assigned</Typography>
                ) : (
                  <>
                    {currentExam?.subjectIds?.map((id: any) => {
                      const subject = subjects.find((s) => s._id === id);
                      return (
                        <Chip
                          key={id}
                          sx={{ mr: 1 }}
                          label={subject?.name?.toUpperCase() || ""}
                        />
                      );
                    })}
                  </>
                )}
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

      {/* Add/Edit Exam Modal */}
      <Dialog
        open={openAddEditModal}
        onClose={() => setOpenAddEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>{isEditMode ? "Edit Exam" : "Add New Exam"}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Exam Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  label="Academic Year"
                  renderValue={(selected) =>
                    academicYears.find((year) => year._id === selected)?.name ||
                    ""
                  }
                  required
                >
                  {academicYears.map((academicYear: IAcademicYear) => (
                    <MenuItem key={academicYear._id} value={academicYear._id}>
                      {academicYear.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Form</InputLabel>
                <Select
                  name="form"
                  value={formData.form}
                  onChange={handleInputChange}
                  label="Form"
                >
                  {["1", "2", "3"].map((form) => (
                    <MenuItem key={form} value={form}>
                      {form}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  name="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  label="Exam Type"
                >
                  {examTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

              <FormControlLabel
                control={
                  <Checkbox
                    name="isSemester"
                    checked={formData.isSemester}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Is Semester Exam"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="isNewCurriculum"
                    checked={formData.isNewCurriculum}
                    onChange={handleCheckboxChange}
                  />
                }
                label="New Curriculum"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Year Group</InputLabel>
                <Select
                  name="yearGroup"
                  value={formData.yearGroup}
                  onChange={handleInputChange}
                  label="Year Group"
                  required
                >
                  {yearGroups.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Subjects</InputLabel>
                <Select
                  name="subjects"
                  multiple
                  value={formData.subjects}
                  onChange={handleSubjectsChange}
                  label="Subjects"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id: string) => {
                        const subject = subjects.find((s) => s._id === id);
                        return <Chip key={id} label={subject?.name} />;
                      })}
                    </Box>
                  )}
                >
                  {subjects?.map((subject: ISubject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      <Checkbox
                        checked={formData.subjects.includes(subject._id)}
                      />
                      {subject.name.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            Are you sure you want to delete the exam "{currentExam?.name}"? This
            action cannot be undone.
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

export default ExamSettings;
