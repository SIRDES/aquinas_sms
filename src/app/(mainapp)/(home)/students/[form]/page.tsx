"use client";

import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType, StudentType } from "@/types/commonTypes";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, {
  ForwardedRef,
  LegacyRef,
  SyntheticEvent,
  forwardRef,
  use,
  useEffect,
  useRef,
  useState,
} from "react";

import { useBatchesContext } from "@/context/BatchesContext";
import Tooltip from "@mui/material/Tooltip";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

// import ReactToPrint, { useReactToPrint } from "react-to-print";
import Link from "next/link";
import * as XLSX from "xlsx";
import { CustomizedSelect } from "@/components/CustomizedSelect";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import Image from "next/image";
import dynamic from "next/dynamic";
import axios from "axios";
import { getAllProgrammes } from "@/utils/serverActions/programme";
import { getAllClasses, promoteAForm } from "@/utils/serverActions/classes";
import { getAYearGroupStudentsTestScoreForABatch } from "@/utils/serverActions/fridayTestScore";
import MultipleStudentsReportCard from "@/components/MultipleStudentsReportCard";
import ActionStatusAlert from "@/components/ActionStatusAlert";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { showAlert } from "@/components/Alerts";
import PermissionGuard, { useHasPermission } from "@/components/PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "9px 8px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 14,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  }
}));


export default function Students({
  params,
}: {
  params: Promise<{ form: string }>;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { form } = use(params);
  const { selectedBatch, fetchedBatches } = useBatchesContext();

  const canViewDetails = useHasPermission(USER_PERMISSIONS.STUDENT_VIEW_DETAILS);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(1000);

  // const [selectedStudent, setSelectedStudent] = useState<any>();
  // const [generatReport, setGenerateReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    message: "",
    title: "",
  });
  const [actionStatus, setActionStatus] = useState({
    open: false,
    message: "",
  });
  const [sortAsc, setSortAsc] = useState(false);
  const [fetchedStudents, setFetchedStudents] = useState<any>(null);
  const [students, setStudents] = useState<Array<StudentType>>([]);
  const [excelData, setExcelData] = useState<Array<any>>([]);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const [programmes, setProgrammes] = useState<Array<any>>([]);
  const [classes, setClasses] = useState<Array<any>>([]);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchStudentsData = async () => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);

    try {
      const res = await axios.get(`/api/students?form=${form}`);
      // console.log("res", res.data);
      if (!res?.data?.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.data?.message || "An error occurred",
        });
        return;
      }

      const lists = res?.data?.data;
      if (lists?.length === 0) {
        showAlert({
          title: "Error",
          severity: "error",
          text: "No students found",
        });
        return;
      }
      setFetchedStudents(lists);
      setStudents(lists);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, [form]);

  const fetchProgrammes = async () => {
    setProgrammes([]);
    try {
      const response = await getAllProgrammes();
      if (response.status === "error") return;
      setProgrammes(response?.data || []);
    } catch (error: any) {
      // console.log("error", error);
    }
  };

  const fetchClasses = async () => {
    setClasses([]);
    try {
      const response = await getAllClasses(form);
      if (!response.data) return;
      setClasses(response.data);
    } catch (error: any) { }
  };
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchProgrammes();
  }, []);
  const handleSortByIDAsc = () => {
    const sortedStudents = students.sort((a: StudentType, b: StudentType) => {
      const studentA = a.studentId.split("/")[1];
      const studentB = b.studentId.split("/")[1];
      if (sortAsc) {
        if (studentA > studentB) return -1;
        else if (studentA < studentB) return 1;
        return 0;
      } else {
        if (studentA < studentB) return -1;
        else if (studentA > studentB) return 1;
        return 0;
      }
    });
    setStudents(sortedStudents);
    setSortAsc((prev) => !prev);
  };

  const handleSearchByName = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        `${student?.firstName?.toUpperCase()} ${student?.lastName?.toUpperCase()}`
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.studentId.split("/")[1].includes(value) ||
        student?.cassRefID?.includes(value),
    );
    setStudents(filteredStudents);
  };

  const handleSearchByProgramme = (
    event: SyntheticEvent<Element, Event>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined,
  ) => {
    // const value = e.target.value;
    // console.log(value, reason, details);
    if (reason === "clear" || value === null) {
      setStudents(fetchedStudents);
      return;
    }
    // console.log(value);
    const filteredTeachers = fetchedStudents.filter((student: any) =>
      student?.classInfo?.programmeInfo?.name
        .toLowerCase()
        .includes(value?.name.toLowerCase()),
    );
    setStudents(filteredTeachers);
  };

  const handleSearchByClass = (
    event: SyntheticEvent<Element, Event>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined,
  ) => {
    // const value = e.target.value;
    // console.log(value, reason, details);
    if (reason === "clear" || value === null) {
      setStudents(fetchedStudents);
      return;
    }
    // console.log(value);
    const filteredTeachers = fetchedStudents.filter((student: any) =>
      student?.classInfo?.name
        .toLowerCase()
        .includes(value?.name.toLowerCase()),
    );
    setStudents(filteredTeachers);
  };
  // const handleClick = (student: any) => {
  //   router.push(`/students/${student._id}`);
  // };

  const handleDownloadBtnClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };
  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
  };

  useEffect(() => {
    // setReportData(students);
    setExcelData(
      students.map((student: any) => ({
        _id: student?._id,
        CassRefID: student?.cassRefID,
        // ID: student?.studentId?.split("/")[1],
        "StudentID": student?.studentId?.toUpperCase(),
        Name: `${student?.firstName} ${student?.middleName ? student?.middleName : ""
          } ${student?.lastName}`.toUpperCase(),
        // Gender: student?.gender,
        Class:
          `${student?.classInfo?.form} ${student?.classInfo?.name}`.toUpperCase(),
        // Programme: student?.programme?.toUpperCase(),
        // "Parent name": `${student?.parentFirstName} ${student?.parentMiddleName ? student?.parentMiddleName : ""
        //   } ${student?.parentLastName}`.toUpperCase(),
        // "Parent Email": student?.parentEmail,
        "ParentContact": student?.parentPhoneNumber
          ? `0${student?.parentPhoneNumber?.trim()?.slice(-9)}`
          : "",
      })),
    );
  }, [students]);
  const handleExcelClick = () => {
    // setSelectedBatch(batch);

    handleDownloadClose();
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `form_${form}_data.xlsx`);
  };

  const handleSaveAsWithPrint = async (students: Array<any>) => {
    const blob = await pdf(
      <MultipleStudentsReportCard students={students} />,
    ).toBlob();
    saveAs(blob, `${fetchedBatches.filter((f: any) => f?.form === form)?.[0]?.name?.toUpperCase()}_report.pdf`);
  };

  const handleOpenConfirmationDialog: ({
    message,
    title,
  }: {
    message: string;
    title: string;
  }) => void = ({ message, title }) => {
    setOpenConfirmationDialog(true);
    setConfirmationDialog({ message, title });
  };

  const getTestScores = async () => {
    setOpenConfirmationDialog(false);
    setActionStatus({ open: true, message: "Fetching students data..." });
    try {
      const res = await getAYearGroupStudentsTestScoreForABatch({
        batchId: fetchedBatches.filter((f: any) => f?.form === form)?.[0]?._id,
        // studentId: id,
      });
      if (!res?.data) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.message || "An error occurred, please try again",
        });
        return;
      }
      setActionStatus({ open: true, message: "Generating reports..." });
      await handleSaveAsWithPrint(res?.data);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });

    } finally {
      setActionStatus({ open: false, message: "" });
    }
  };

  // if (loading) return <LoadingAlert open={true} />;

  return (
    <>
      <LoadingAlert open={loading} />

      <ActionStatusAlert
        open={actionStatus.open}
        message={actionStatus.message}
      />
      <ConfirmationDialog
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        message={confirmationDialog.message}
        title={confirmationDialog.title}
        handleConfirmation={getTestScores}
      />
      <Box>
        <Typography
          variant="h6"
          gutterBottom
          // mb={2}
          px={{ xs: 1, sm: 2, md: 3 }}
        // pt={3}
        >
          Students
        </Typography>
        <Divider />
        <Grid
          container
          spacing={2}
          alignItems="center"
          mb={2}
          mt={2}
          px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Grid item container xs={12} sm={12} md={10.5} spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search student"
                onChange={handleSearchByName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3.5}>
              <Autocomplete
                id="filter-by-programme"
                fullWidth
                size="small"
                options={programmes}
                getOptionLabel={(option: any) => option?.name?.toUpperCase()}
                onChange={handleSearchByProgramme}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField {...params} placeholder="programme" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                id="filter-by-class"
                fullWidth
                size="small"
                options={classes}
                getOptionLabel={(option: any) => option?.name?.toUpperCase()}
                onChange={handleSearchByClass}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField {...params} placeholder="class" />
                )}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={1.5} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
            <Button
              variant="contained"
              onClick={handleDownloadBtnClick}
              sx={{
                borderRadius: "4px",
                width: { xs: "100%", md: "fit-content" },
                color: "white",
                fontWeight: 700,
              }}
            >
              Action
            </Button>
            <Menu
              id="menu-batch"
              anchorEl={downloadAnchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(downloadAnchorEl)}
              onClose={handleDownloadClose}
            >
              <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_CREATE}>
                <MenuItem component={Link} href={`/students/${form}/add-student`}>
                  Add Single
                </MenuItem>
              </PermissionGuard>
              <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_CREATE}>
                <MenuItem
                  component={Link}
                  href={`/students/${form}/add-multiple-students`}
                >
                  Add Multiple
                </MenuItem>
              </PermissionGuard>
              <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_DETAILS_DOWNLOAD}>
                <MenuItem
                  onClick={handleExcelClick}
                >
                  Data (EXCEL)
                </MenuItem>
              </PermissionGuard>
              <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_EXAMS_REPORT_DOWNLOAD}>
                <MenuItem
                  onClick={() => {
                    handleDownloadClose();
                    handleOpenConfirmationDialog({
                      message: `Are you sure you want to download  ${fetchedBatches.filter((f: any) => f?.form === form)?.[0]?.name?.toUpperCase()} report for all students?`,
                      title: "Students Report",
                    });
                  }}
                >
                  Reports (PDF)
                </MenuItem>
              </PermissionGuard>
            </Menu>
          </Grid>
        </Grid>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "calc(100vh - 200px)", // Adjust this value based on your layout
              overflow: "auto",
              // "& .MuiTable-stickyHeader": {
              //   "& th": {
              //     zIndex: 1,
              //   },
              // },
            }}
          >
            <Table
              stickyHeader

              sx={{ minWidth: 650 }}
              aria-label="students table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>
                    S/N{" "}
                    <Tooltip
                      title={`Sort in ${sortAsc ? "descending" : "ascending"}`}
                    >
                      <ArrowUpwardIcon
                        sx={{
                          cursor: "pointer",
                          fontSize: "12px",
                          marginLeft: "5px",
                          transition: "all 0.3s ease",
                          transform: sortAsc
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                        onClick={handleSortByIDAsc}
                      />
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell>CassRefID</StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Parent contact</StyledTableCell>

                  <StyledTableCell>Class</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students &&
                  !!students.length &&
                  students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student: any, index: number) => {
                      const rowContent = (
                        <StyledTableRow
                          hover
                          style={{
                            cursor: canViewDetails ? "pointer" : "default",
                          }}
                        >
                          <StyledTableCell>
                            {student?.studentId?.toUpperCase()}
                          </StyledTableCell>
                          <StyledTableCell>{student?.cassRefID}</StyledTableCell>
                          <StyledTableCell>
                            {`${student?.firstName ? student?.firstName : ""} ${student?.lastName ? student?.lastName : ""
                              }`
                              .trim()
                              .toUpperCase()}
                          </StyledTableCell>
                          <StyledTableCell>
                            {student?.parentPhoneNumber}
                          </StyledTableCell>
                          <StyledTableCell>
                            {`${student?.classInfo?.form} ${student?.classInfo?.name}`.toUpperCase()}
                          </StyledTableCell>
                        </StyledTableRow>
                      );

                      return canViewDetails ? (
                        <Link
                          href={`/students/${form}/${student?._id}`}
                          passHref
                          legacyBehavior
                          key={index}
                        >
                          {rowContent}
                        </Link>
                      ) : (
                        <React.Fragment key={index}>
                          {rowContent}
                        </React.Fragment>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 1000]}
            component="div"
            count={students.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </>
  );
}
