"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Pagination,
  Menu,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  InputAdornment
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Flag as FlagIcon,
  WbSunny as SunIcon,
  WbTwilight as MorningIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  UploadFile as UploadFileIcon,
  Event as EventIcon,
  BeachAccess as HolidayIcon,
  Inbox as InboxIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useBatchesContext } from "@/context/BatchesContext";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import { getAllClasses } from "@/utils/serverActions/classes";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import AddHolidayModal from "@/components/AddHolidayModal";
import ViewHolidaysModal from "@/components/ViewHolidaysModal";
import { getStudentAttendanceLogsByClassId } from "@/utils/serverActions/studentAttendanceLog";
import { TimeLogType } from "@/types/commonTypes";
import PermissionGuard from "@/components/PermissionGuard";
import { getFractionColor, getRateColor, USER_PERMISSIONS } from "@/utils/common";


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "6px 10px",
  [`&.${tableCellClasses.head}`]: {

    color: "text.secondary",
    fontWeight: 600,
    fontSize: "12px",
    letterSpacing: 1
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    // cursor: "pointer",
  },
}));

// day: number;
// morningTime: string;
// afternoonTime: string;
const getStudentsTotalMorningAttendance = (studentAttendanceLogs: TimeLogType[]) => {
  let present = 0
  studentAttendanceLogs.forEach((timeLog) => {
    if (timeLog.morningTime && timeLog.morningTime.trim() !== "") {
      present += 1;
    }
  })
  return present
}

const getStudentsTotalAfternoonAttendance = (studentAttendanceLogs: TimeLogType[]) => {
  let present = 0
  studentAttendanceLogs.forEach((timeLog) => {
    if (timeLog.afternoonTime && timeLog.afternoonTime.trim() !== "") {
      present += 1;
    }
  })
  return present
}

const getStudentsMorningAttendanceRate = (studentAttendanceData: any[] | null, totalDays: number) => {
  if (!studentAttendanceData || studentAttendanceData.length === 0 || totalDays === 0) return 0;
  let totalPresent = 0;
  studentAttendanceData.forEach((student) => {
    totalPresent += getStudentsTotalMorningAttendance(student.attendance);
  });

  return (totalPresent / (studentAttendanceData.length * totalDays)) * 100;
}

const getStudentAfternoonAttendanceRate = (studentAttendanceData: any[] | null, totalDays: number) => {
  if (!studentAttendanceData || studentAttendanceData.length === 0 || totalDays === 0) return 0;
  let totalPresent = 0;
  studentAttendanceData.forEach((student) => {
    totalPresent += getStudentsTotalAfternoonAttendance(student.attendance);
  });

  return (totalPresent / (studentAttendanceData.length * totalDays)) * 100;
}

const getStudentAttendanceRate = (studentTotalAttendance: number, totalDays: number) => {
  if (!totalDays) return 0;
  return (studentTotalAttendance / totalDays) * 100;
}



export default function AttendancePage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  // const { batches, setBatches, fetchedBatches } = useBatchesContext();
  const [fetchedClasses, setFetchedClasses] = useState<any>(null);

  const [filterBy, setFilterBy] = useState<"week" | "month" | "dateRange">(
    (searchParams.get("filterBy") as "week" | "month" | "dateRange") || "week"
  );
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");
  const [yearGroup, setYearGroup] = useState(searchParams.get("yearGroup") || " ");
  const [classFilter, setClassFilter] = useState(searchParams.get("classFilter") || " ");
  const [searchQuery, setSearchQuery] = useState("");
  // const [rowsPerPage, setRowsPerPage] = useState(25);

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const openExport = Boolean(exportAnchorEl);

  const [holidayModalOpen, setHolidayModalOpen] = useState(false);

  const [fetchedAttendanceData, setFetchedAttendanceData] = useState<any>(null);
  const [totalExpectedDays, setTotalExpectedDays] = useState<number>(0);
  const [totalExpectedMorningDays, setTotalExpectedMorningDays] = useState<number>(0);
  const [totalExpectedAfternoonDays, setTotalExpectedAfternoonDays] = useState<number>(0);

  const [viewHolidaysModalOpen, setViewHolidaysModalOpen] = useState(false);
  const [fetchedHolidays, setFetchedHolidays] = useState<any[]>([]);

  // const fetchHolidays = async () => {
  //   try {
  //     const response = await getAllAttendanceHolidays();
  //     if (response.success) {
  //       setFetchedHolidays(response.data);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   fetchHolidays();
  // }, []);

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };
  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleUploadLogFile = () => {
    handleExportClose();
    router.push("/attendance/upload-log-flie");
  };

  const handleOpenHolidayModal = () => {
    handleExportClose();
    setHolidayModalOpen(true);
  };

  const handleCloseHolidayModal = () => {
    setHolidayModalOpen(false);
  };



  const FractionBadge = ({ present, total }: { present: number; total: number }) => {
    const colors = getFractionColor(present, total);
    return (
      <Box
        sx={{
          backgroundColor: colors.bg,
          color: colors.text,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          display: "inline-block",
          fontWeight: 600,
          fontSize: "0.875rem",
        }}
      >
        {present < 10 ? `0${present}` : present}/{total}
      </Box>
    );
  };



  const fetchAttendaceLog = async () => {
    if (!classFilter || classFilter === " ") {
      showAlert({
        title: "error",
        text: "Class is required",
        severity: "error",
      });
      return;
    };
    if (filterBy === "dateRange" && (!fromDate || !toDate)) {
      showAlert({
        title: "error",
        text: "Date range is required",
        severity: "error",
      });
      return;
    };

    setLoading(true);
    setFetchedAttendanceData(null)
    try {
      const response = await getStudentAttendanceLogsByClassId({ classId: classFilter, filterBy: filterBy, startDate: fromDate, endDate: toDate });
      console.log('attendance', response);

      if (!response.success) {
        showAlert({
          title: "error",
          text: response.message || "Error occurred",
          severity: "error",
        });
        return;
      }
      console.log('attendance', response.data);

      setFetchedAttendanceData(response.data);
      setFetchedHolidays(response.attendanceholidays);
      setTotalExpectedDays(response.totalExpectedDays || 0);
      setTotalExpectedMorningDays(response.totalExpectedMorningDays || 0);
      setTotalExpectedAfternoonDays(response.totalExpectedAfternoonDays || 0);
    } catch (error: any) {
      showAlert({
        title: "error",
        text: error.message || "Error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchClasses = async () => {
    if (!yearGroup || yearGroup === " ") return;
    setLoading(true);
    setFetchedClasses([]);
    try {
      const response = await getAllClasses(yearGroup);
      if (!response.data) return;
      // console.log('classes', response.data);

      setFetchedClasses(response.data);
    } catch (error: any) {
      showAlert({
        title: "error",
        text: error.message || "Error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (yearGroup !== " ") fetchClasses();
  }, [yearGroup]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterBy) params.set("filterBy", filterBy);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (yearGroup && yearGroup !== " ") params.set("yearGroup", yearGroup);
    if (classFilter && classFilter !== " ") params.set("classFilter", classFilter);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl);
  }, [filterBy, fromDate, toDate, yearGroup, classFilter, pathname, router]);

  useEffect(() => {
    const initClass = searchParams.get("classFilter");
    if (initClass && initClass !== " ") {
      const initFilterBy = (searchParams.get("filterBy") as "week" | "month" | "dateRange") || "week";
      const initFromDate = searchParams.get("fromDate") || "";
      const initToDate = searchParams.get("toDate") || "";

      const autoFetch = async () => {
        setLoading(true);
        setFetchedAttendanceData(null);
        try {
          const response = await getStudentAttendanceLogsByClassId({
            classId: initClass,
            filterBy: initFilterBy,
            startDate: initFromDate,
            endDate: initToDate,
          });
          if (response.success) {
            setFetchedAttendanceData(response.data);
            setFetchedHolidays(response.attendanceholidays);
            setTotalExpectedDays(response.totalExpectedDays || 0);
            setTotalExpectedMorningDays(response.totalExpectedMorningDays || 0);
            setTotalExpectedAfternoonDays(response.totalExpectedAfternoonDays || 0);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      autoFetch();
    }
  }, []);



  const filteredAttendanceData = fetchedAttendanceData?.filter((row: any) => {
    const student = row?.student;
    if (!student) return false;
    const name = `${student.firstName} ${student.lastName} ${student.middleName || ""}`.toLowerCase();
    const id = (student.studentId || "").toLowerCase();
    const term = searchQuery.toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  return (
    <>
      <LoadingAlert open={loading} />
      <AddHolidayModal
        open={holidayModalOpen}
        onClose={handleCloseHolidayModal}
      // onSuccess={fetchAttendaceLog}
      />
      <ViewHolidaysModal
        open={viewHolidaysModalOpen}
        onClose={() => setViewHolidaysModalOpen(false)}
        fetchedHolidays={fetchedHolidays}
      />


      <Box sx={{ p: 2, }}>
        {/* Header */}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#00204a" }}>
              Attendance Summary
            </Typography>

          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleExportClick}
              sx={{ backgroundColor: "#003b5c", fontWeight: 600, textTransform: "none", "&:hover": { backgroundColor: "#00273d" } }}
            >
              Actions
            </Button>
            <Menu
              anchorEl={exportAnchorEl}
              open={openExport}
              onClose={handleExportClose}
              MenuListProps={{
                'aria-labelledby': 'export-button',
              }}
            >
              {/* <MenuItem onClick={handleExportClose}>
                  <ListItemIcon>
                    <PdfIcon fontSize="small" />
                  </ListItemIcon>
                  Export to PDF
                </MenuItem>
                <MenuItem onClick={handleExportClose}>
                  <ListItemIcon>
                    <ExcelIcon fontSize="small" />
                  </ListItemIcon>
                  Export to Excel
                </MenuItem> */}
              <PermissionGuard requiredPermission={USER_PERMISSIONS.ATTENDANCE_UPLOAD_LOG_FILE}>
                <MenuItem onClick={handleUploadLogFile}>
                  <ListItemIcon>
                    <UploadFileIcon fontSize="small" />
                  </ListItemIcon>
                  Upload log file
                </MenuItem>
              </PermissionGuard>

              <PermissionGuard requiredPermission={USER_PERMISSIONS.ATTENDANCE_ADD_HOLIDAYS}>
                <MenuItem onClick={handleOpenHolidayModal}>
                  <ListItemIcon>
                    <EventIcon fontSize="small" />
                  </ListItemIcon>
                  Add a holiday
                </MenuItem>
              </PermissionGuard>


            </Menu>
          </Box>
        </Box>


        {/* Filters */}
        <Card sx={{ p: 2, mb: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.04)", borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={2}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5 }}>
                DATE RANGE
              </Typography>
              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as "week" | "month" | "dateRange")}
                size="small"
                fullWidth
                sx={{ borderRadius: 1.5, fontWeight: 600, color: "text.primary", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" } }}
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="dateRange">Date Range</MenuItem>
              </Select>
            </Grid>
            {filterBy === "dateRange" && (
              <>
                <Grid item xs={12} md={2}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5 }}>
                    FROM
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    inputProps={{ max: toDate || undefined }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: "#fff" } }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5 }}>
                    TO
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={!fromDate}
                    inputProps={{ min: fromDate || undefined }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, backgroundColor: "#fff" } }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={2}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5 }}>
                FORM
              </Typography>
              <Select
                value={yearGroup}
                onChange={(e) => setYearGroup(e.target.value)}
                size="small"
                fullWidth
                sx={{ borderRadius: 1.5, fontWeight: 600, color: "text.primary", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" } }}
              >
                <MenuItem value=" " disabled>Select form</MenuItem>
                <MenuItem value="1">Form 1</MenuItem>
                <MenuItem value="2">Form 2</MenuItem>
                <MenuItem value="3">Form 3</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5 }}>
                CLASS
              </Typography>
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                size="small"
                fullWidth
                sx={{ borderRadius: 1.5, fontWeight: 600, color: "text.primary", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" } }}
              >
                <MenuItem value=" " disabled>Select Class</MenuItem>
                {fetchedClasses?.map((cls: any) => (
                  <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5, visibility: "hidden" }}>
                Apply Filters
              </Typography>
              <Button variant="contained" onClick={fetchAttendaceLog} sx={{ backgroundColor: "#0f172a", "&:hover": { backgroundColor: "#1e293b" }, borderRadius: 1.5, px: 3, py: 1, textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.04)", borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ backgroundColor: "#e3f2fd", p: 0.5, borderRadius: 1.5 }}>
                  <PeopleIcon sx={{ color: "#1976d2" }} />
                </Box>
                {/* <Typography variant="body2" sx={{ color: "#4caf50", fontWeight: 700, display: "flex", alignItems: "center" }}>
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> +2.4%
                </Typography> */}
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}>
                TOTAL ATTENDANCE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#00204a", mt: 0.5 }}>
                {totalExpectedDays}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.04)", borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ backgroundColor: "#e8f5e9", p: 0.5, borderRadius: 1.5 }}>
                  <MorningIcon sx={{ color: "#4caf50" }} />
                </Box>
                {/* <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  Stable
                </Typography> */}
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}>
                AVG MORNING ATTENDANCE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#00204a", mt: 0.5 }}>
                {getStudentsMorningAttendanceRate(fetchedAttendanceData, totalExpectedMorningDays).toFixed(1)}%
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.04)", borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ backgroundColor: "#fff3e0", p: 0.5, borderRadius: 1.5 }}>
                  <SunIcon sx={{ color: "#ff9800" }} />
                </Box>
                {/* <Typography variant="body2" sx={{ color: "#f44336", fontWeight: 700, display: "flex", alignItems: "center" }}>
                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> -1.2%
                </Typography> */}
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}>
                AVG AFTERNOON ATTENDANCE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#00204a", mt: 0.5 }}>
                {getStudentAfternoonAttendanceRate(fetchedAttendanceData, totalExpectedAfternoonDays).toFixed(1)}%
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, boxShadow: "0px 2px 8px rgba(0,0,0,0.04)", borderRadius: 2, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ backgroundColor: "#ede7f6", p: 0.5, borderRadius: 1.5 }}>
                  <HolidayIcon sx={{ color: "#673ab7" }} />
                </Box>
                {fetchedHolidays.length > 0 && (
                  <Typography variant="body2" sx={{ color: "#4caf50", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => setViewHolidaysModalOpen(true)}>
                    VIEW
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}>
                NUMBER HOLIDAYS
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#00204a", mt: 0.5 }}>
                {fetchedHolidays.length}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Table Section */}
        <Card sx={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.04)", borderRadius: 2, overflow: "hidden", border: "1px solid #f0f0f0" }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#00204a" }}>
              Detailed Attendance Matrix
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {fetchedAttendanceData && fetchedAttendanceData.length > 0 && (
                <TextField
                  size="small"
                  placeholder="Search by student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    width: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fff",
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "text.secondary", fontSize: "1.1rem" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                No. of Students: {filteredAttendanceData ? filteredAttendanceData.length : 0}
              </Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#fcfcfc" }}>
                  <StyledTableCell>STUDENT PROFILE</StyledTableCell>
                  <StyledTableCell align="center">MORNING<br />SESSION</StyledTableCell>
                  <StyledTableCell align="center">AFTERNOON<br />SESSION</StyledTableCell>
                  <StyledTableCell sx={{ width: "25%" }}>ATTENDANCE<br />RATE</StyledTableCell>
                  <PermissionGuard requiredPermission={USER_PERMISSIONS.ATTENDANCE_VIEW_STUDENT_ATTENDANCE_RECORDS}>
                    <StyledTableCell align="center">ACTIONS</StyledTableCell>
                  </PermissionGuard>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton animation="wave" height={40} /></TableCell>
                      <TableCell><Skeleton animation="wave" height={40} /></TableCell>
                      <TableCell><Skeleton animation="wave" height={40} /></TableCell>
                      <TableCell><Skeleton animation="wave" height={40} /></TableCell>
                      <TableCell><Skeleton animation="wave" height={40} /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAttendanceData && filteredAttendanceData.length > 0 ? (
                  filteredAttendanceData.map((row: any) => (
                    <TableRow key={row.student._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <StyledTableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{`${row?.student?.firstName?.toUpperCase()} ${row?.student?.lastName?.toUpperCase()}`}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>ID: {row?.student?.studentId?.toUpperCase()}</Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <FractionBadge present={getStudentsTotalMorningAttendance(row.attendance)} total={totalExpectedMorningDays} />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <FractionBadge present={getStudentsTotalAfternoonAttendance(row.attendance)} total={totalExpectedAfternoonDays} />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
                          {(getStudentAttendanceRate(row.attendance?.length, totalExpectedDays) < 50) ? (
                            <Box sx={{ display: "flex", alignItems: "center", color: "#f44336" }}>
                              <WarningIcon fontSize="small" sx={{ mr: 0.5, fontSize: "1rem" }} />
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>{getStudentAttendanceRate(row?.attendance?.length, totalExpectedDays).toFixed(1)}%</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 800, color: getRateColor(getStudentAttendanceRate(row?.attendance?.length, totalExpectedDays)), ml: "auto" }}>
                              {getStudentAttendanceRate(row?.attendance?.length, totalExpectedDays).toFixed(1)}%
                            </Typography>
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getStudentAttendanceRate(row?.attendance?.length, totalExpectedDays)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#f1f5f9",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: getRateColor(getStudentAttendanceRate(row?.attendance?.length, totalExpectedDays)),
                              borderRadius: 4,
                            }
                          }}
                        />
                      </StyledTableCell>
                      <PermissionGuard requiredPermission={USER_PERMISSIONS.ATTENDANCE_VIEW_STUDENT_ATTENDANCE_RECORDS}>
                        <StyledTableCell align="center">
                          <IconButton size="small" sx={{ color: "text.secondary" }} component={Link} href={`/attendance/${row?.student?._id}?filterBy=${filterBy}&fromDate=${fromDate}&toDate=${toDate}&yearGroup=${yearGroup}&classFilter=${classFilter}`}>
                            {<VisibilityIcon />}
                          </IconButton>
                        </StyledTableCell>
                      </PermissionGuard>
                    </TableRow>
                  ))
                ) : fetchedAttendanceData && fetchedAttendanceData.length > 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <SearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                        No Students Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No students match the search term "{searchQuery}".
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <InboxIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                        No Attendance Data Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Adjust your filters or select a different class.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>


    </>
  );
}
