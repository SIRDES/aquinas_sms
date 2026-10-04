"use client";

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
  IconButton,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import ReactPaginate from "react-paginate";
import { useDebounce } from "use-debounce";
import { showAlert } from "../Alerts";
import PermissionGuard from "../PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";
import {
  createAttendanceHoliday,
  getAllAttendanceHolidays,
  updateAttendanceHoliday,
  deleteAttendanceHoliday,
} from "@/utils/serverActions/attendanceHoliday";
import { formatDate } from "@/utils/services/utils";
import LoadingAlert from "@/components/LoadingAlert";

interface IHolidayForm {
  description: string;
  date: string;
  duration: string;
}

const AttendanceSettings: React.FC = () => {
  const theme = useTheme();

  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Data states
  const [holidays, setHolidays] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 1000);

  // Modal states
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState<IHolidayForm>({
    description: "",
    date: new Date().toISOString().split("T")[0],
    duration: "full_day",
  });

  const resetForm = () => {
    setFormData({
      description: "",
      date: new Date().toISOString().split("T")[0],
      duration: "full_day",
    });
  };

  const fetchHolidaysData = async ({
    searchStr = "",
    pageIndex = 1,
    limit = 100,
  }: {
    searchStr?: string;
    pageIndex?: number;
    limit?: number;
  }) => {
    setLoading(true);
    try {
      const res = await getAllAttendanceHolidays({
        searchText: searchStr,
        page: pageIndex,
        rowsPerPage: limit,
      });

      if (res.success) {
        setHolidays(res.data || []);
        setPage(pageIndex);
        setRowsPerPage(limit);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 0);
      } else {
        showAlert({
          title: "Error",
          text: res.message || "Failed to fetch attendance holidays",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("error", error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while fetching holidays",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search logic
  useEffect(() => {
    fetchHolidaysData({
      searchStr: debouncedSearchText,
      pageIndex: 1,
      limit: rowsPerPage,
    });
  }, [debouncedSearchText, rowsPerPage]);

  const handleChangePage = async (data: { selected: number }) => {
    await fetchHolidaysData({
      searchStr: debouncedSearchText,
      pageIndex: data.selected + 1,
      limit: rowsPerPage,
    });
  };

  const handleChangeRowsPerPage = async (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    setRowsPerPage(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add modal
  const handleAddClick = () => {
    setIsEditMode(false);
    resetForm();
    setOpenAddEditModal(true);
  };

  // Edit modal
  const handleEditClick = (holiday: any) => {
    setCurrentHoliday(holiday);
    setIsEditMode(true);
    setFormData({
      description: holiday.description,
      date: new Date(holiday.date).toISOString().split("T")[0],
      duration: holiday.duration || "full_day",
    });
    setOpenAddEditModal(true);
  };

  // Delete modal
  const handleDeleteClick = (holiday: any) => {
    setCurrentHoliday(holiday);
    setOpenDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!currentHoliday) return;
    setLoading(true);
    setOpenDeleteDialog(false);
    try {
      const res = await deleteAttendanceHoliday(currentHoliday._id);
      if (res.success) {
        showAlert({
          title: "Success",
          text: res.message || "Holiday deleted successfully",
          severity: "success",
        });
        await fetchHolidaysData({
          searchStr: debouncedSearchText,
          pageIndex: page,
          limit: rowsPerPage,
        });
      } else {
        showAlert({
          title: "Error",
          text: res.message || "Failed to delete holiday",
          severity: "error",
        });
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while deleting holiday",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setCurrentHoliday(null);
    }
  };

  // Form submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOpenAddEditModal(false);
    try {
      let res;
      if (isEditMode && currentHoliday) {
        res = await updateAttendanceHoliday(currentHoliday._id, formData);
      } else {
        res = await createAttendanceHoliday(formData);
      }

      if (res.success) {
        showAlert({
          title: "Success",
          text: res.message || (isEditMode ? "Holiday updated successfully" : "Holiday created successfully"),
          severity: "success",
        });
        setOpenAddEditModal(false);
        resetForm();
        await fetchHolidaysData({
          searchStr: debouncedSearchText,
          pageIndex: isEditMode ? page : 1,
          limit: rowsPerPage,
        });
      } else {
        showAlert({
          title: "Error",
          text: res.message || "An error occurred",
          severity: "error",
        });
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error.message || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <LoadingAlert open={loading} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Attendance Holidays</Typography>
        <PermissionGuard requiredPermission={USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_CREATE}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddClick}
          >
            Add Holiday
          </Button>
        </PermissionGuard>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search holidays..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "action.active" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Holidays Table */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading holidays...
                </TableCell>
              </TableRow>
            ) : holidays && holidays.length > 0 ? (
              holidays.map((holiday: any) => (
                <TableRow key={holiday._id}>
                  <TableCell>{holiday.description.toUpperCase()}</TableCell>
                  <TableCell>{new Date(holiday.date).toDateString()}</TableCell>
                  <TableCell>
                    {holiday.duration === "morning"
                      ? "Morning Only"
                      : holiday.duration === "afternoon"
                        ? "Afternoon Only"
                        : "Full Day"}
                  </TableCell>
                  <TableCell>
                    <PermissionGuard requiredPermission={USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_UPDATE}>
                      <IconButton onClick={() => handleEditClick(holiday)} color="primary" size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </PermissionGuard>

                    <PermissionGuard requiredPermission={USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_DELETE}>
                      <IconButton onClick={() => handleDeleteClick(holiday)} color="error" size="small">
                        <Delete fontSize="small" />
                      </IconButton>
                    </PermissionGuard>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No holidays found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {holidays && holidays.length > 0 && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
          px={2}
        >
          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              size="small"
              sx={{ ml: 1, height: 32 }}
            >
              {[50, 100, 200].map((pageSize) => (
                <MenuItem key={pageSize} value={pageSize}>
                  {pageSize}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="body2" color="textSecondary" ml={2}>
              {`${(page - 1) * rowsPerPage + 1}-${Math.min(
                page * rowsPerPage,
                totalCount,
              )} of ${totalCount}`}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                "& .pagination": {
                  display: "flex",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  alignItems: "center",
                  gap: "4px",
                },
                "& .pagination a": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: theme.palette.text.primary,
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
                "& .pagination__link--active a": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
                "& .pagination__link--disabled a": {
                  color: theme.palette.text.disabled,
                  cursor: "not-allowed",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                },
                "& .pagination__break a": {
                  pointerEvents: "none",
                },
                "& .pagination__previous, & .pagination__next": {
                  margin: "0 8px",
                },
              }}
            >
              <ReactPaginate
                breakLabel="..."
                nextLabel={
                  <IconButton
                    disabled={page >= totalPages}
                    aria-label="next page"
                    size="small"
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                }
                onPageChange={handleChangePage}
                pageRangeDisplayed={5}
                marginPagesDisplayed={1}
                pageCount={totalPages}
                previousLabel={
                  <IconButton
                    disabled={page === 1}
                    aria-label="previous page"
                    size="small"
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                }
                renderOnZeroPageCount={null}
                containerClassName="pagination"
                pageClassName="pagination__item"
                pageLinkClassName="pagination__link"
                previousClassName="pagination__item pagination__previous"
                nextClassName="pagination__item pagination__next"
                breakClassName="pagination__item pagination__break"
                activeClassName="pagination__link--active"
                disabledClassName="pagination__link--disabled"
                forcePage={page - 1}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openAddEditModal} onClose={() => setOpenAddEditModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: "bold" }}>
            {isEditMode ? "Edit Holiday" : "Add New Holiday"}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                select
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange as any}
                required
                fullWidth
              >
                <MenuItem value="full_day">Full Day</MenuItem>
                <MenuItem value="morning">Morning Only</MenuItem>
                <MenuItem value="afternoon">Afternoon Only</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddEditModal(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              {isEditMode ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete the holiday "{currentHoliday?.description?.toUpperCase()}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceSettings;
