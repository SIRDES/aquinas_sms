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
  Tabs,
  Tab,
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
import { promoteAForm } from "@/utils/serverActions/classes";
import LoadingAlert from "../LoadingAlert";
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

const PromotionSettings = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);

  // State for promotion form
  const [promotionData, setPromotionData] = useState({
    promotionType: "promotion",
    fromYearGroup: "",
    toYearGroup: "",
  });
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

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
    isSemester: false,
    isNewCurriculum: false,
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
      isSemester: false,
      isNewCurriculum: false,
      yearGroup: "",
      subjects: [],
    });
  };
  // Available options
  const examTypes = ["Semester 1", "Semester 2", "Friday Test"];
  const statuses = ["Active", "Inactive"];
  const formGroups = ["Form 1", "Form 2", "Form 3"];

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

  // Handle promotion form input changes
  const handlePromotionChange = (field: string, value: string) => {
    setPromotionData((prev) => {
      const newData = { ...prev, [field]: value };

      // Automatically set toYearGroup based on fromYearGroup and promotion type
      if (field === "fromYearGroup" || field === "promotionType") {
        if (newData.fromYearGroup) {
          const currentIndex = formGroups.indexOf(newData.fromYearGroup);
          if (currentIndex !== -1) {
            const offset = newData.promotionType === "promotion" ? 1 : -1;
            const targetIndex = currentIndex + offset;

            // If target index is within bounds, use it, otherwise use "Completed" only for promotion beyond last form
            if (targetIndex >= 0 && targetIndex < formGroups.length) {
              newData.toYearGroup = formGroups[targetIndex];
            } else if (
              newData.promotionType === "promotion" &&
              targetIndex >= formGroups.length
            ) {
              newData.toYearGroup = "Completed";
            } else {
              newData.toYearGroup = "";
            }
          }
        } else {
          newData.toYearGroup = "";
        }
      }

      return newData;
    });
  };

  // Handle promotion form submission
  const handlePromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenConfirmModal(true);
  };

  // Handle confirmation of promotion
  const handleConfirmPromotion = async () => {
    // Extract just the numeric part from the form values (e.g., 'Form 1' -> '1')
    const fromForm = promotionData.fromYearGroup.replace(/\D/g, "");
    // Keep 'Completed' as is, otherwise extract the number
    const toForm =
      promotionData.toYearGroup === "Completed"
        ? "completed"
        : promotionData.toYearGroup.replace(/\D/g, "");

    // console.log("Promotion Data:", {
    //   type: promotionData.promotionType,
    //   from: fromForm,
    //   to: toForm,
    // });

    setOpenConfirmModal(false);
    setIsLoading(true);
    try {
      const response = await promoteAForm({ fromForm, toForm });

      if (response.success) {
        showAlert({
          title: "Success",
          text: response.message || "Promotion successful",
          severity: "success",
        });
        setPromotionData({
          promotionType: "promotion",
          fromYearGroup: "",
          toYearGroup: "",
        });
      } else {
        showAlert({
          title: "Error",
          text: response.message || "Promotion failed",
          severity: "error",
        });
      }
    } catch (error) {
      console.log("error");
      showAlert({
        title: "Error",
        text: "Promotion failed",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
    // Reset form
  };

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
  // const handleSubjectsChange = (event: SelectChangeEvent<string[]>) => {
  //   const { value } = event.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     subjects: typeof value === "string" ? value.split(",") : value,
  //   }));
  // };

  // Open view modal
  // const handleView = (exam: IExam) => {
  //   setCurrentExam(exam);
  //   setOpenViewModal(true);
  // };

  // Open edit modal
  // const handleEdit = (exam: IExam) => {
  //   setCurrentExam(exam);
  //   console.log("exam", exam);
  //   setFormData({
  //     name: exam.name,
  //     academicYear: exam.academicYearDetails?._id || "",
  //     date: new Date(exam.date).toISOString().split("T")[0],
  //     form: exam.form,
  //     examType: exam.examType || "",
  //     status: exam.isSuspended ? "Inactive" : "Active",
  //     isSemester: exam.isSemester || false,
  //     isNewCurriculum: exam.isNewCurriculum || false,
  //     yearGroup: exam.yearGroup,
  //     subjects: exam.subjectIds?.map((subject) => subject.toString()) || [],
  //   });
  //   setIsEditMode(true);
  //   setOpenAddEditModal(true);
  // };

  // Open delete confirmation
  // const handleDeleteClick = (exam: IExam) => {
  //   setCurrentExam(exam);
  //   setOpenDeleteDialog(true);
  // };

  // Confirm delete
  // const confirmDelete = () => {
  //   if (currentExam) {
  //     // delete exam from API
  //     // setExams((prev) => prev.filter((exam) => exam.id !== currentExam.id));
  //     setOpenDeleteDialog(false);
  //     setCurrentExam(null);
  //   }
  // };

  // Handle form submission
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Reset form and close modal
  //   setIsLoading(true);
  //   try {
  //     let response;
  //     if (isEditMode && currentExam) {
  //       // Update existing exam
  //       console.log("currentExam", formData);
  //       response = await updateFridayTestBatch(currentExam._id, {
  //         academicYear: formData.academicYear,
  //         name: formData.name,
  //         date: new Date(formData.date),
  //         subjectIds: formData.subjects,
  //         examType: formData.examType,
  //         yearGroup: formData.yearGroup,
  //         form: formData.form,
  //         isNewCurriculum: formData.isNewCurriculum,
  //         isSemester: formData.isSemester,
  //         isSuspended:
  //           formData.status?.toLowerCase() === "inactive" ? true : false,
  //       });
  //     } else {
  //       // Add new exam
  //       const data = {
  //         academicYear: formData.academicYear,
  //         name: formData.name,
  //         date: formData.date,
  //         subjectIds: formData.subjects,
  //         examType: formData.examType,
  //         yearGroup: formData.yearGroup,
  //         form: formData.form,
  //         isNewCurriculum: formData.isNewCurriculum,
  //         isSemester: formData.isSemester,
  //       };
  //       console.log("new form data", formData);
  //       response = await addFridayTestBatch(data);
  //     }

  //     setOpenAddEditModal(false);
  //     setIsEditMode(false);
  //     if (response?.success) {
  //       showAlert({
  //         title: "Success",
  //         severity: "success",
  //         text: response?.message || "Success",
  //       });
  //       resetForm();
  //       // refetchExams();
  //       window.location.reload();
  //     } else {
  //       showAlert({
  //         title: "Error",
  //         severity: "error",
  //         text: response?.message || "An error occurred",
  //       });
  //     }
  //   } catch (err: any) {
  //     console.log(err);
  //     showAlert({
  //       title: "Error",
  //       severity: "error",
  //       text: err?.message || "An error occurred",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <>
      <LoadingAlert open={isLoading} />
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Promotion Management</Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="promotion settings tabs"
          >
            <Tab label="Year Group" />
            <Tab label="Class" />
            <Tab label="Student" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Year Group Promotion
              </Typography>
              <Box
                component="form"
                onSubmit={handlePromotionSubmit}
                sx={{ maxWidth: 500, mt: 3 }}
              >
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="promotion-type-label">
                    Promotion Type
                  </InputLabel>
                  <Select
                    labelId="promotion-type-label"
                    id="promotion-type"
                    value={promotionData.promotionType}
                    label="Promotion Type"
                    onChange={(e) =>
                      handlePromotionChange(
                        "promotionType",
                        e.target.value as string
                      )
                    }
                    required
                  >
                    <MenuItem value="promotion">Promotion</MenuItem>
                    <MenuItem value="demotion">Demotion</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="from-year-group-label">
                    From Year Group
                  </InputLabel>
                  <Select
                    labelId="from-year-group-label"
                    id="from-year-group"
                    value={promotionData.fromYearGroup}
                    label="From Year Group"
                    onChange={(e) =>
                      handlePromotionChange(
                        "fromYearGroup",
                        e.target.value as string
                      )
                    }
                    required
                  >
                    {formGroups
                      .filter((form) => {
                        // Don't show Form 1 when demoting
                        if (
                          promotionData.promotionType === "demotion" &&
                          form === "Form 1"
                        ) {
                          return false;
                        }
                        return true;
                      })
                      .map((form) => (
                        <MenuItem key={form} value={form}>
                          {form}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  {/* <InputLabel id="to-year-group-label">To Year Group</InputLabel> */}
                  <TextField
                    id="to-year-group"
                    value={promotionData.toYearGroup}
                    label="To Year Group"
                    disabled
                    fullWidth
                  />
                </FormControl>

                <PermissionGuard requiredPermission={USER_PERMISSIONS.SETTINGS_MAKE_PROMOTION}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      !promotionData.fromYearGroup || !promotionData.toYearGroup
                    }
                  >
                    {promotionData.promotionType === "promotion"
                      ? "Promote"
                      : "Demote"}{" "}
                    Students
                  </Button>
                </PermissionGuard>
              </Box>

              {/* Confirmation Dialog */}
              <Dialog
                open={openConfirmModal}
                onClose={() => setOpenConfirmModal(false)}
              >
                <DialogTitle>Confirm {promotionData.promotionType}</DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure you want to {promotionData.promotionType}{" "}
                    students from {promotionData.fromYearGroup} to{" "}
                    {promotionData.toYearGroup}?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenConfirmModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmPromotion}
                    color="primary"
                    variant="contained"
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Class Promotion
              </Typography>
              {/* Class content will go here */}
            </Box>
          )}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Student Promotion
              </Typography>
              {/* Student content will go here */}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PromotionSettings;
