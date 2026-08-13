"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  AutocompleteChangeReason,
  Box,
  Button,
  Divider,
  InputAdornment,
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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

import { CustomizedSelect } from "@/components/CustomizedSelect";
import Link from "next/link";
import { getAllStaff } from "@/utils/serverActions/user";
import { getAllSubjects } from "@/utils/serverActions/subject";
import { useSession } from "next-auth/react";
import { USER_PERMISSIONS } from "@/utils/common";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  // "&:hover": {
  //   cursor: "pointer",
  // },
}));
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

export default function Staff() {
  // const theme = useTheme();
  const currentSession = useSession()
  console.log("currentSession", currentSession)
  const currentUser = currentSession?.data?.user
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // const [selectedStudent, setSelectedStudent] = useState<any>();
  const [loading, setLoading] = useState(false);
  // const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });
  const [fetchedStudents, setFetchedStudents] = useState<any>(null);
  const [students, setStudents] = useState<any>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState("ALL");
  const [fetchedProgrammes, setFetchedProgrammes] = useState<any>(null);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchStaffData = async () => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    setSnackbar({
      open: false,
      message: "Loading data...",
      severity: undefined,
    });
    try {
      const res = await getAllStaff();
      if (!res) {
        setSnackbar({
          open: true,
          message: "No students found",
          severity: "error",
        });
        return;
      }

      setFetchedStudents(res);
      setStudents(res);
    } catch (error: any) {
      console.log("error", error);
      setSnackbar({
        open: true,
        message: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchSubjects = async () => {
    // setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    try {
      const res = await getAllSubjects();
      if (!res) return;

      setFetchedProgrammes(res);
    } catch (error: any) {
      console.log("error", error);
    }
  };

  // console.log(selectedBatch);
  useEffect(() => {
    fetchStaffData();
    fetchSubjects();
  }, []);

  const handleSortByIDAsc = () => {
    const sortedStudents = students.sort((a: any, b: any) => {
      const studentA = a?.staffNumber;
      const studentB = b?.staffNumber;
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
    const filteredStudents = fetchedStudents?.filter(
      (student: any) =>
        `${student?.firstName} ${student?.lastName}`
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.staffNumber?.includes(value)
    );
    setStudents(filteredStudents);
  };

  // const handleSearchByProgramme = (
  //   event: SyntheticEvent<Element, Event>,
  //   value: any,
  //   reason: AutocompleteChangeReason
  // ) => {
  //   // const value = e.target.value;
  //   // console.log(value, reason, details);
  //   if (reason === "clear" || value === null) {
  //     setStudents(fetchedStudents);
  //     return;
  //   }
  //   // console.log(value);
  //   const filteredTeachers = fetchedStudents.filter((student: any) =>
  //     student.programme.toLowerCase().includes(value?.name.toLowerCase())
  //   );
  //   setStudents(filteredTeachers);
  // };

  // const handleClick = (staff: any) => {
  //   router.push(`/staff/${staff._id}`);
  // };

  const filterByPaymentType = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedPaymentType(value);
    if (value === "ALL") {
      setStudents(fetchedStudents);
      return;
    }
    // console.log(value);
    const filteredTeachers = fetchedStudents.filter(
      (student: any) => student?.role === value
    );
    setStudents(filteredTeachers);
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
      // redirect="/students"
      />
      <Box>
        <Typography
          variant="h6"
          gutterBottom
          mb={2}
          px={{ xs: 1, sm: 2, md: 3 }}
          pt={3}
        >
          Staff
        </Typography>
        {/* <Button onClick={fetchedAndUpdateStudents}>Update students</Button>
        <Button onClick={backupStudentsData}>backup students</Button> */}
        <Divider />
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          mb={2}
          mt={2}
          px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Box display={"flex"} gap={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search staff"
              onChange={handleSearchByName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {/* <Autocomplete
              id="filter-by-programme"
              fullWidth
              size="small"
              options={fetchedProgrammes || []}
              getOptionLabel={(option: any) => option?.name?.toUpperCase()}
              // defaultValue={[top100Films[13]]}
              onChange={handleSearchByProgramme}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} placeholder="programme" />
              )}
            />
            <Select
              fullWidth
              displayEmpty
              input={<CustomizedSelect />}
              value={selectedPaymentType}
              onChange={filterByPaymentType}
            >
              <MenuItem value={"ALL"}>ALL</MenuItem>
              <MenuItem value={"FULL PAYMENT"}>FULL PAYMENT</MenuItem>
              <MenuItem value={"PART PAYMENT"}>PART PAYMENT</MenuItem>
            </Select> */}
          </Box>

          <Button
            component={Link}
            href="/staff/add-staff"
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "4px",
              // background: "#5812B3",
              width: "fit-content",
              color: "white",
              fontWeight: 700,
            }}
          >
            New Staff
          </Button>
        </Box>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <TableContainer component={Paper}>
            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="staff table">
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
                  <StyledTableCell>Name</StyledTableCell>

                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Role</StyledTableCell>
                  <StyledTableCell>Subject</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students &&
                  !!students.length &&
                  students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student: any, index: number) => (
                      <StyledTableRow
                        key={student?.staffNumber + index}
                        onClick={() => currentUser?.userPermissions?.includes(USER_PERMISSIONS.USER_VIEW_DETAILS) && router.push(`/staff/${student._id}`)}
                        hover
                        sx={{ cursor: currentUser?.userPermissions?.includes(USER_PERMISSIONS.USER_VIEW_DETAILS) ? "pointer" : "default" }}
                      >
                        <StyledTableCell>
                          {student?.staffNumber}
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${student?.firstName ? student?.firstName.trim() : ""
                            } ${student?.lastName ? student?.lastName.trim() : ""
                            }`.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.email?.toLowerCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.role?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.subjectDetails?.[0]?.name?.toUpperCase()}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
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
