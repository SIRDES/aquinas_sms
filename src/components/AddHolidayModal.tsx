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
  OutlinedInput,
  Checkbox,
  ListItemText,
  Chip,
  Typography,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { showAlert } from "@/components/Alerts";
import { createAttendanceHoliday } from "@/utils/serverActions/attendanceHoliday";
import { searchStudentsByForm } from "@/utils/serverActions/student";
import { yearGroups as availableYearGroups } from "@/utils/common";

interface StudentOption {
  _id: string;
  firstName: string;
  lastName?: string;
  studentId: string;
  classDetails?: {
    name: string;
    form: string;
  };
}

interface AddHolidayModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddHolidayModal: React.FC<AddHolidayModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayDescription, setHolidayDescription] = useState("");
  const [holidayDuration, setHolidayDuration] = useState<
    "full_day" | "morning" | "afternoon"
  >("full_day");
  const [holidayIsFor, setHolidayIsFor] = useState<
    "all_students" | "some_students" | "year_group"
  >("all_students");
  const [yearGroups, setYearGroups] = useState<string[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<StudentOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudentsList, setSelectedStudentsList] = useState<
    StudentOption[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Debounced search for students when form is selected and input >= 3 chars
  useEffect(() => {
    if (!selectedForm || inputValue.trim().length < 3) {
      setOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchStudentsByForm({
          form: selectedForm,
          searchTerm: inputValue.trim(),
        });
        if (res.success && res.data) {
          setOptions(res.data);
        } else {
          setOptions([]);
        }
      } catch (err) {
        console.error("Search students error:", err);
        setOptions([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, selectedForm]);

  const handleClose = () => {
    onClose();
    setHolidayDate("");
    setHolidayDescription("");
    setHolidayDuration("full_day");
    setHolidayIsFor("all_students");
    setYearGroups([]);
    setSelectedForm("");
    setInputValue("");
    setOptions([]);
    setSelectedStudentsList([]);
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

    if (holidayIsFor === "year_group" && yearGroups.length === 0) {
      showAlert({
        title: "error",
        text: "Please select at least one year group",
        severity: "error",
      });
      return;
    }

    if (holidayIsFor === "some_students" && selectedStudentsList.length === 0) {
      showAlert({
        title: "error",
        text: "Please select at least one student",
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
        holidayIsFor: holidayIsFor,
        yearGroups: holidayIsFor === "year_group" ? yearGroups : [],
        students:
          holidayIsFor === "some_students"
            ? selectedStudentsList.map((s) => s._id)
            : [],
      });

      if (!response.success) {
        showAlert({
          title: "error",
          text: response.message || response.error || "Error occurred",
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

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
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
      <DialogTitle sx={{ fontWeight: 700, color: "#00204a" }}>
        Add a Holiday/Permission
      </DialogTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveHoliday();
        }}
      >
        <DialogContent dividers>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}
          >
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
              onChange={(e) =>
                setHolidayDuration(
                  e.target.value as "full_day" | "morning" | "afternoon",
                )
              }
              required
              disabled={loading}
            >
              <MenuItem value="full_day">Full Day</MenuItem>
              <MenuItem value="morning">Morning Only</MenuItem>
              <MenuItem value="afternoon">Afternoon Only</MenuItem>
            </TextField>

            <TextField
              select
              label="Holiday For"
              variant="outlined"
              fullWidth
              value={holidayIsFor}
              onChange={(e) => {
                const val = e.target.value as
                  | "all_students"
                  | "some_students"
                  | "year_group";
                setHolidayIsFor(val);
                if (val !== "year_group") {
                  setYearGroups([]);
                }
                if (val !== "some_students") {
                  setSelectedForm("");
                  setInputValue("");
                  setOptions([]);
                  setSelectedStudentsList([]);
                }
              }}
              required
              disabled={loading}
            >
              <MenuItem value="all_students">All Students</MenuItem>
              <MenuItem value="some_students">Some Students</MenuItem>
              <MenuItem value="year_group">Year Group</MenuItem>
            </TextField>

            {holidayIsFor === "year_group" && (
              <FormControl fullWidth margin="none" required disabled={loading}>
                <InputLabel id="year-group-multiple-label">
                  Year Group
                </InputLabel>
                <Select
                  labelId="year-group-multiple-label"
                  multiple
                  value={yearGroups}
                  onChange={(e) => {
                    const value = e.target.value;
                    setYearGroups(
                      typeof value === "string" ? value.split(",") : value,
                    );
                  }}
                  input={<OutlinedInput label="Year Group" />}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {availableYearGroups.map((year) => {
                    const yearStr = String(year);
                    return (
                      <MenuItem key={yearStr} value={yearStr}>
                        <Checkbox checked={yearGroups.includes(yearStr)} />
                        <ListItemText primary={yearStr} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            {holidayIsFor === "some_students" && (
              <>
                <TextField
                  select
                  label="Select Form"
                  variant="outlined"
                  fullWidth
                  value={selectedForm}
                  onChange={(e) => {
                    setSelectedForm(e.target.value);
                    setInputValue("");
                    setOptions([]);
                  }}
                  required
                  disabled={loading}
                  helperText="Choose a form to search students from"
                >
                  <MenuItem value="1">Form 1</MenuItem>
                  <MenuItem value="2">Form 2</MenuItem>
                  <MenuItem value="3">Form 3</MenuItem>
                </TextField>

                <Autocomplete
                  options={options.filter(
                    (opt) =>
                      !selectedStudentsList.some((s) => s._id === opt._id),
                  )}
                  getOptionLabel={(option) =>
                    typeof option === "string"
                      ? option
                      : `${option.firstName} ${option.lastName || ""} (${option.studentId})`
                  }
                  filterOptions={(x) => x}
                  value={null}
                  inputValue={inputValue}
                  onInputChange={(event, newInputValue, reason) => {
                    if (reason === "input" || reason === "clear") {
                      setInputValue(newInputValue);
                    }
                  }}
                  onChange={(event, newValue) => {
                    if (newValue && typeof newValue !== "string") {
                      if (
                        !selectedStudentsList.some(
                          (s) => s._id === newValue._id,
                        )
                      ) {
                        setSelectedStudentsList((prev) => [...prev, newValue]);
                      }
                      setInputValue("");
                      setOptions([]);
                    }
                  }}
                  loading={searching}
                  disabled={!selectedForm || loading}
                  noOptionsText={
                    !selectedForm
                      ? "Please select a Form first"
                      : inputValue.trim().length < 3
                        ? "Type at least 3 characters to search"
                        : searching
                          ? "Searching..."
                          : "No students found"
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Students"
                      variant="outlined"
                      placeholder={
                        !selectedForm
                          ? "Select a Form first"
                          : "Type name or student ID (min 3 chars)..."
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {searching ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.firstName} {option.lastName || ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {option.studentId} &bull; Class:{" "}
                          {option.classDetails?.name || "N/A"}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />

                {selectedStudentsList.length > 0 && (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Selected Students ({selectedStudentsList.length}):
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        maxHeight: 160,
                        overflowY: "auto",
                        p: 1.5,
                        border: "1px solid #e2e8f0",
                        borderRadius: 1,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      {selectedStudentsList.map((student) => (
                        <Chip
                          key={student._id}
                          label={`${student.firstName} ${student.lastName || ""} (${student.studentId})`}
                          onDelete={() => {
                            setSelectedStudentsList((prev) =>
                              prev.filter((s) => s._id !== student._id),
                            );
                          }}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ fontWeight: 600 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#0f172a",
              "&:hover": { backgroundColor: "#1e293b" },
              fontWeight: 600,
            }}
          >
            {loading ? "Saving..." : "Save Holiday"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddHolidayModal;
