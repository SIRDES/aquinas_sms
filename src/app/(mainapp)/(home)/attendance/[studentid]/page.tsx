"use client";
import React, { use, useEffect, useState } from "react";
import {
  Box,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  ButtonGroup,
  Skeleton,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InsertInvitationIcon from "@mui/icons-material/InsertInvitation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { getStudentById } from "@/utils/serverActions/student";
import { getStudentAttendanceLogsByStudentId } from "@/utils/serverActions/studentAttendanceLog";
import dayjs from "dayjs";
import { showAlert } from "@/components/Alerts";
import { getRateColor } from "@/utils/common";
import ViewHolidaysModal from "@/components/ViewHolidaysModal";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import StudentAttendancePDF from "@/components/StudentAttendancePDF";
import { useRouter } from "next/navigation";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "4px 16px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    borderBottom: "1px solid #E5E7EB",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: "1px solid #E5E7EB",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatusIcon = ({ status }: { status: "Present" | "Absent" }) => {
  if (status === "Present") return <CheckCircleIcon sx={{ color: "#10B981", fontSize: 14 }} />;
  return <CancelIcon sx={{ color: "#EF4444", fontSize: 14 }} />;
};

export default function StudentAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ studentid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const router = useRouter();
  const { studentid } = use(params);
  const search = use(searchParams);
  const filterByQuery = (search?.filterBy as "week" | "month" | "dateRange") || "dateRange";
  const fromDateQuery = search?.fromDate as string | undefined;
  const toDateQuery = search?.toDate as string | undefined;
  // const yearGroupQuery = search?.yearGroup as string | undefined;
  // const classFilterQuery = search?.classFilter as string | undefined;

  const [filterBy, setFilterBy] = useState<"week" | "month" | "dateRange">(filterByQuery || "dateRange");
  const [fromDate, setFromDate] = useState(fromDateQuery || "");
  const [toDate, setToDate] = useState(toDateQuery || "");

  const [student, setStudent] = useState<any>(null);
  const [studentAttendanceLogs, setStudentAttendanceLogs] = useState<any[]>([]);
  const [totalExpectedDays, setTotalExpectedDays] = useState(0);
  const [totalExpectedMorningDays, setTotalExpectedMorningDays] = useState(0);
  const [totalExpectedAfternoonDays, setTotalExpectedAfternoonDays] = useState(0);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [fetchedHolidays, setFetchedHolidays] = useState<any[]>([]);
  const [daysInMonth, setDaysInMonth] = useState<dayjs.Dayjs[]>([]);
  const [viewHolidaysModalOpen, setViewHolidaysModalOpen] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      const res = await getStudentById(studentid);
      if (res.status === "success") {
        setStudent(res.data);
      } else {
        showAlert({
          title: "Error",
          text: res.message,
          severity: "error",

        });
      }
    };
    fetchStudent();
  }, [studentid]);

  useEffect(() => {
    if (fromDateQuery) {
      setFromDate(fromDateQuery);
      setCurrentDate(dayjs(fromDateQuery || ""));
    }
    if (toDateQuery) {
      setToDate(toDateQuery);
    }
    if (filterByQuery) {
      setFilterBy(filterByQuery);
    }
  }, [fromDateQuery, toDateQuery, filterByQuery]);


  const fetchAttendaceLog = async () => {
    if (!studentid) return;

    if (filterBy === "dateRange" && (!fromDate || !toDate)) {
      showAlert({
        title: "error",
        text: "Date range is required",
        severity: "error",
      });
      return;
    };

    setLoading(true);
    try {
      const response = await getStudentAttendanceLogsByStudentId({ studentId: studentid, filterBy: filterBy, startDate: fromDate, endDate: toDate });
      console.log('attendance', response);

      if (!response.success) {
        showAlert({
          title: "error",
          text: response.message || "Error occurred",
          severity: "error",
        });
        return;
      }
      // console.log('attendance response.data', response.data);

      setCurrentDate(dayjs(fromDate || ""));

      setStudentAttendanceLogs(response.data || []);
      setTotalExpectedDays(response.totalExpectedDays || 0);
      setTotalExpectedMorningDays(response.totalExpectedMorningDays || 0);
      setTotalExpectedAfternoonDays(response.totalExpectedAfternoonDays || 0);
      setFetchedHolidays(response.attendanceholidays || []);

      const newDaysInMonth: dayjs.Dayjs[] = [];
      const baseDate = fromDate ? dayjs(fromDate) : dayjs();
      const startOfRange = (filterBy === "dateRange" && fromDate) ? dayjs(fromDate) : baseDate.startOf("month");
      const endOfRange = (filterBy === "dateRange" && toDate) ? dayjs(toDate) : baseDate.endOf("month");
      const today = dayjs();

      let currentDay = startOfRange;
      while (currentDay.isBefore(endOfRange) || currentDay.isSame(endOfRange, "day")) {
        if (currentDay.day() !== 0 && currentDay.day() !== 6 && currentDay.isBefore(today.add(1, "day"))) {
          newDaysInMonth.push(currentDay);
        }
        currentDay = currentDay.add(1, "day");
      }

      newDaysInMonth.sort((a, b) => b.valueOf() - a.valueOf());
      setDaysInMonth(newDaysInMonth);
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
    if (!studentid) return;
    if (!filterBy) return;
    if (!fromDate) return;
    if (!toDate) return;

    fetchAttendaceLog();

  }, []);

  const getDayStatus = (log: any, period: "morningTime" | "afternoonTime") => {
    if (!log) return "Absent";
    const time = log[period];
    if (!time || time.trim() === "") return "Absent";
    return "Present";
  };

  const isDayMorningPresent = (log: any) => {
    return getDayStatus(log, "morningTime") === "Present"
  };

  const isDayAfternoonPresent = (log: any) => {
    return getDayStatus(log, "afternoonTime") === "Present"
  };

  const totalMorningPresent = studentAttendanceLogs.filter(isDayMorningPresent).length;
  const totalAfternoonPresent = studentAttendanceLogs.filter(isDayAfternoonPresent).length;

  const attendanceRate = totalExpectedDays > 0 ? (studentAttendanceLogs.length / totalExpectedDays * 100).toFixed(1) : 0;

  const handleExportPDF = async () => {
    const blob = await pdf(
      <StudentAttendancePDF
        student={student}
        logs={studentAttendanceLogs}
        fetchedHolidays={fetchedHolidays}
        daysInMonth={daysInMonth}
        attendanceRate={attendanceRate}
        totalMorningPresent={totalMorningPresent}
        totalAfternoonPresent={totalAfternoonPresent}
        totalExpectedDays={totalExpectedDays}
        totalExpectedMorningDays={totalExpectedMorningDays}
        totalExpectedAfternoonDays={totalExpectedAfternoonDays}
        filterBy={filterBy}
        fromDate={fromDate}
        toDate={toDate}
      />
    ).toBlob();
    saveAs(
      blob,
      `${student?.firstName?.toUpperCase()}_${student?.lastName?.toUpperCase()}_attendance.pdf`
    );
  };

  return (
    <>
      <ViewHolidaysModal
        open={viewHolidaysModalOpen}
        onClose={() => setViewHolidaysModalOpen(false)}
        fetchedHolidays={fetchedHolidays}
      />
      <Box sx={{ p: 3, minHeight: "100vh" }}>
        {/* Header */}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => router.back()}
              sx={{ color: "#00204a", mr: 1 }}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#00204a" }}>
              Student Attendance Record
            </Typography>
          </Box>
          {daysInMonth && daysInMonth.length > 0 && (
            <Button variant="contained" size="small" color="primary" disableElevation onClick={handleExportPDF} sx={{ textTransform: "none", fontWeight: 600, marginLeft: 2 }}>
              Export as PDF
            </Button>)}
        </Box>
        <Card sx={{ p: 3, mb: 3, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>

            <Box>
              {loading && !student ? (
                <Skeleton width={200} height={40} />
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {student?.firstName} {student?.lastName}
                  </Typography>

                </Box>
              )}
              {loading && !student ? (
                <Skeleton width={300} />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {student?.studentId?.toUpperCase()}
                </Typography>
              )}
              {loading && !student ? (
                <Skeleton width={200} />
              ) : (
                <Box display="flex" alignItems="center" gap={2} mt={1}>

                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                    <LocationOnIcon fontSize="inherit" />{student?.classDetails?.form} {student?.classDetails?.name?.toUpperCase() || "N/A"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={2}>
            {/* <Box>
              <ButtonGroup size="small" variant="outlined">
                <Button variant={filterBy === "week" ? "contained" : "outlined"} disableElevation onClick={() => { setFilterBy("week"); fetchAttendaceLog(); }}>This Week</Button>
                <Button variant={filterBy === "month" ? "contained" : "outlined"} disableElevation onClick={() => { setFilterBy("month"); fetchAttendaceLog(); }}>This Month</Button>
                <Button variant={filterBy === "dateRange" ? "contained" : "outlined"} disableElevation onClick={() => { setFilterBy("dateRange"); }}>Custom Range</Button>
              </ButtonGroup>

            </Box> */}
            <Box display="flex" alignItems="center" gap={1}>
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
              <Grid item xs={12} md={2}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5, visibility: "hidden" }}>
                  Apply Filters
                </Typography>
                <Button variant="contained" onClick={fetchAttendaceLog} sx={{ backgroundColor: "#0f172a", "&:hover": { backgroundColor: "#1e293b" }, borderRadius: 1.5, px: 3, py: 1, textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                  Apply Filters
                </Button>
              </Grid>

              {/* {filterBy === "dateRange" && (
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
                  <Grid item xs={12} md={2}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, mb: 1, display: "block", letterSpacing: 0.5, visibility: "hidden" }}>
                      Apply Filters
                    </Typography>
                    <Button variant="contained" onClick={fetchAttendaceLog} sx={{ backgroundColor: "#0f172a", "&:hover": { backgroundColor: "#1e293b" }, borderRadius: 1.5, px: 3, py: 1, textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                      Apply Filters
                    </Button>
                  </Grid>
                </>
              )} */}
            </Box>
          </Box>
        </Card>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, borderRadius: 2, height: "100%", borderLeft: `4px solid ${getRateColor(Number(attendanceRate))}` }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>ATTENDANCE</Typography>

              <Box>
                {/* <Typography variant="h6" fontWeight="bold">{studentAttendanceLogs.length} / {totalExpectedDays} days</Typography> */}
                <Box display="flex" alignItems="flex-end" gap={1}>
                  <Typography variant="h6" fontWeight="bold">{studentAttendanceLogs.length}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>/ {totalExpectedDays} Days</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="text.secondary">{attendanceRate}%</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>MORNING PRESENT</Typography>
              <Box display="flex" alignItems="flex-end" gap={1}>
                <Typography variant="h6" fontWeight="bold">{totalMorningPresent}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>/ {totalExpectedMorningDays} Days</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>AFTERNOON PRESENT</Typography>
              <Box display="flex" alignItems="flex-end" gap={1}>
                <Typography variant="h6" fontWeight="bold">{totalAfternoonPresent}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>/ {totalExpectedAfternoonDays} Days</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, borderRadius: 2, height: "100%", }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", }}>

                <Typography variant="overline" color="text.secondary" fontWeight={600}>HOLIDAYS</Typography>
                {fetchedHolidays.length > 0 && (
                  <Typography variant="body2" sx={{ color: "#4caf50", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }} onClick={() => setViewHolidaysModalOpen(true)}>
                    VIEW
                  </Typography>
                )}
              </Box>
              <Box display="flex" alignItems="flex-end" gap={1}>
                <Typography variant="h6" fontWeight="bold">{fetchedHolidays?.length || 0}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 2 }}>
          <Box p={3} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #E5E7EB">
            <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
              <InsertInvitationIcon /> Daily Attendance Log
            </Typography>
            <Box display="flex" gap={2}>
              <Typography variant="caption" display="flex" alignItems="center" gap={0.5}><CheckCircleIcon sx={{ fontSize: 14, color: "#10B981" }} /> Present</Typography>
              <Typography variant="caption" display="flex" alignItems="center" gap={0.5}><CancelIcon sx={{ fontSize: 14, color: "#EF4444" }} /> Absent</Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>DATE</StyledTableCell>
                  <StyledTableCell align="center">MORNING</StyledTableCell>
                  <StyledTableCell align="center">AFTERNOON</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}><Typography>Loading...</Typography></TableCell>
                  </TableRow>
                ) : daysInMonth.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}><Typography>No expected days in this period.</Typography></TableCell>
                  </TableRow>
                ) : (
                  daysInMonth.map((day) => {
                    const logForDay = studentAttendanceLogs.find(l => dayjs(l.date).isSame(day, "day"));
                    const holidayForDay = fetchedHolidays.find((h: any) => dayjs(h.date).isSame(day, "day"));
                    const mStatus = getDayStatus(logForDay, "morningTime");
                    const aStatus = getDayStatus(logForDay, "afternoonTime");
                    // const cStatus = aStatus;

                    return (
                      <StyledTableRow key={day.format("YYYY-MM-DD")}>
                        <StyledTableCell>
                          <Typography variant="body2" fontWeight="bold">{day.format("MMM DD, YYYY")}</Typography>
                          <Typography variant="caption" color="text.secondary">{day.format("dddd").toUpperCase()}</Typography>
                        </StyledTableCell>
                        {holidayForDay && (!holidayForDay.duration || holidayForDay.duration === 'full_day') ? (
                          <StyledTableCell align="center" colSpan={2}>
                            <Box display="flex" justifyContent="center">
                              <Box sx={{ bgcolor: '#FEF3C7', color: '#D97706', px: 2, py: 1, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" fontWeight="bold">HOLIDAY: {holidayForDay.description.toUpperCase()}</Typography>
                              </Box>
                            </Box>
                          </StyledTableCell>
                        ) : (
                          <>
                            <StyledTableCell align="center">
                              <Box display="flex" justifyContent="center">
                                {holidayForDay && holidayForDay.duration === 'morning' ? (
                                  <Box sx={{ bgcolor: '#FEF3C7', color: '#D97706', px: 1, py: 0.5, borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '120px' }}>
                                    <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '9px', lineHeight: 1.1 }}>HOLIDAY</Typography>
                                    <Typography variant="caption" align="center" sx={{ fontSize: '8px', opacity: 0.8, mt: 0.2 }}>{holidayForDay.description.toUpperCase()}</Typography>
                                  </Box>
                                ) : (
                                  <Box sx={{ bgcolor: mStatus === 'Present' ? '#D1FAE5' : '#FEE2E2', p: 0.5, borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <StatusIcon status={mStatus} />
                                    {mStatus === 'Present' && (
                                      <Typography variant="caption" sx={{ mt: 0.5, lineHeight: 1 }}>{logForDay?.morningTime}</Typography>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Box display="flex" justifyContent="center">
                                {holidayForDay && holidayForDay.duration === 'afternoon' ? (
                                  <Box sx={{ bgcolor: '#FEF3C7', color: '#D97706', px: 1, py: 0.5, borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '120px' }}>
                                    <Typography variant="caption" fontWeight="bold" align="center" sx={{ fontSize: '9px', lineHeight: 1.1 }}>HOLIDAY</Typography>
                                    <Typography variant="caption" align="center" sx={{ fontSize: '8px', opacity: 0.8, mt: 0.2 }}>{holidayForDay.description.toUpperCase()}</Typography>
                                  </Box>
                                ) : (
                                  <Box sx={{ bgcolor: aStatus === 'Present' ? '#D1FAE5' : '#FEE2E2', p: 0.5, borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <StatusIcon status={aStatus} />
                                    {aStatus === 'Present' && (
                                      <Typography variant="caption" sx={{ mt: 0.5, lineHeight: 1 }}>{logForDay?.afternoonTime}</Typography>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </StyledTableCell>
                          </>
                        )}
                      </StyledTableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center" borderTop="1px solid #E5E7EB">
            <Typography variant="body2" color="text.secondary">
              Showing 1-{daysInMonth.length} of {daysInMonth.length}
            </Typography>
            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small" disabled>Previous</Button>
              <Button variant="outlined" size="small" disabled>Next</Button>
            </Box>
          </Box>
        </Card>
      </Box >
    </>
  );
}
