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
import AddHolidayModal from "../AddHolidayModal";
import EditHolidayModal from "../EditHolidayModal";

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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<any | null>(null);
  const [addHolidayModalOpen, setAddHolidayModalOpen] = useState(false);
  const [editHolidayModalOpen, setEditHolidayModalOpen] = useState(false);

  const handleCloseAddHolidayModal = () => {
    setAddHolidayModalOpen(false);
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

  // Add modal
  const handleAddClick = () => {
    setAddHolidayModalOpen(true);
  };

  // Edit modal
  const handleEditClick = (holiday: any) => {
    setCurrentHoliday(holiday);
    setEditHolidayModalOpen(true);
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

  return (
    <Box>
      <LoadingAlert open={loading} />
      <AddHolidayModal
        open={addHolidayModalOpen}
        onClose={handleCloseAddHolidayModal}
        onSuccess={() =>
          fetchHolidaysData({
            searchStr: debouncedSearchText,
            pageIndex: page,
            limit: rowsPerPage,
          })
        }
      />
      <EditHolidayModal
        open={editHolidayModalOpen}
        onClose={() => setEditHolidayModalOpen(false)}
        holiday={currentHoliday}
        onSuccess={() =>
          fetchHolidaysData({
            searchStr: debouncedSearchText,
            pageIndex: page,
            limit: rowsPerPage,
          })
        }
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Attendance Holidays</Typography>
        <PermissionGuard
          requiredPermission={
            USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_CREATE
          }
        >
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
                    <PermissionGuard
                      requiredPermission={
                        USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_UPDATE
                      }
                    >
                      <IconButton
                        onClick={() => handleEditClick(holiday)}
                        color="primary"
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </PermissionGuard>

                    <PermissionGuard
                      requiredPermission={
                        USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_DELETE
                      }
                    >
                      <IconButton
                        onClick={() => handleDeleteClick(holiday)}
                        color="error"
                        size="small"
                      >
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

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete the holiday "
            {currentHoliday?.description?.toUpperCase()}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceSettings;
