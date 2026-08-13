"use client";
import LoadingAlert from "@/components/LoadingAlert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
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
import {
  useEffect,
  useState,
} from "react";

import { useBatchesContext } from "@/context/BatchesContext";
import * as XLSX from "xlsx";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

import { getAllPaymentTransactionsByBatchId } from "@/utils/serverActions/paymentTransaction";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import { showAlert } from "@/components/Alerts";
import PermissionGuard from "@/components/PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "4px 8px",
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
  },
  "&:hover": {
    // cursor: "pointer",
  },
}));
export default function Payments() {
  const { fetchedBatches } = useBatchesContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [selectedBatchExams, setSelectedExams] = useState<any>(null);
  const [fetchedStudents, setFetchedStudents] = useState<any>(null);
  const [students, setStudents] = useState<Array<any>>([]);
  const [excelData, setExcelData] = useState<Array<any>>([]);

  const [selectedPaymentType, setSelectedPaymentType] = useState("All");

  useEffect(() => {
    if (fetchedBatches?.length > 0 && !selectedBatchExams) {
      setSelectedExams(fetchedBatches[0]);
    }
  }, [fetchedBatches, selectedBatchExams]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchStudentsData = async () => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    // console.log(selectedBatch)
    try {
      const responseData = await getAllPaymentTransactionsByBatchId(selectedBatchExams?._id);
      // console.log("payment responseData", responseData);

      if (!responseData.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: responseData.message || "Failed to fetch payment data",
        })
        return;
      }
      if (responseData?.data?.length === 0) {
        showAlert({
          title: "No Payments Found",
          severity: "warning",
          text: "There are no payments for this batch yet.",
        })
        return;
      }
      setFetchedStudents(responseData?.data || []);
      setStudents(responseData?.data || []);
    } catch (error: any) {
      // console.log("error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred",
      })
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchExams === null || !selectedBatchExams?._id) return;
    fetchStudentsData();
    setSelectedPaymentType("All");
  }, [selectedBatchExams]);


  useEffect(() => {
    // setReportData(students);
    console.log("students", students);
    setExcelData(
      students.map((student: any) => ({
        // _id: student?._id,
        // SSID: student?.ssId,

        ID: student?.student?.studentId?.split("/")[1],
        Name: `${student?.student?.firstName ? student?.student?.firstName?.toUpperCase() : ""} ${student?.student?.lastName ? student?.student?.lastName?.toUpperCase() : ""}`,
        Class: `${student?.student?.class?.form
          } ${student?.student?.class?.name?.toUpperCase()}`,
        phone: formatPhoneNumberIntl(student?.msisdn),
        Date: student?.createdAt,
        // Programme: student?.programme?.toUpperCase(),
        // "Parent name": `${student?.parentFirstName} ${student?.parentMiddleName ? student?.parentMiddleName : ""
        //   } ${student?.parentLastName}`.toUpperCase(),
        // "Parent Email": student?.parentEmail,
        // "Parent Contact": student?.parentPhoneNumber,
      }))
    );
  }, [students]);
  const handleExcelClick = () => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${selectedBatchExams?.academicYearDetails?.name}_${selectedBatchExams?.name}_payment_data.xlsx`);
  };

  const handleSearchByName = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        student?.student?.firstName
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.student?.lastName
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.student?.studentId.split("/")[1].includes(value)
    );
    setStudents(filteredStudents);
  };

  const filterByDeliveryStatus = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedPaymentType(value);
    if (value === "All") {
      setStudents(fetchedStudents);
      return;
    }
    // console.log(value);
    const filteredStudents = fetchedStudents.filter(
      (student: any) => student?.status?.toLowerCase() === value.toLowerCase()
    );
    setStudents(filteredStudents);
  };


  return (
    <>
      <LoadingAlert open={loading} />
      <Box>
        <Typography
          variant="h5"
          gutterBottom
          mb={2}
          px={{ xs: 1, sm: 2, md: 3 }}
          pt={3}
        >
          Payments
        </Typography>

        <Divider />
        <Box px={{ xs: 1, sm: 2, md: 3 }} my={2}>
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            {/* Left side: Select Exams */}
            <Grid item xs={12} sm={6} md={4} lg={5}>
              <PermissionGuard requiredPermission={USER_PERMISSIONS.EXAMS_PAYMENTS_VIEW_ALL}>
                <FormControl size="small" sx={{ width: "100%" }}>
                  <Select
                    displayEmpty
                    value={selectedBatchExams?._id || ""}
                    onChange={(e) => {
                      const batchId = e.target.value;
                      const batch = fetchedBatches.find((b: any) => b._id === batchId);
                      setSelectedExams(batch || null);
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select exams</em>
                    </MenuItem>
                    {fetchedBatches
                      ?.map((batch: any) => (
                        <MenuItem key={batch._id} value={batch._id}>
                          {`${batch.academicYearDetails?.name} - ${batch.name}`?.toUpperCase()}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </PermissionGuard>
            </Grid>

            {/* Right side: Search, Filter, Export */}
            <Grid item xs={12} sm={12} md={8} lg={7}>
              <Grid container spacing={2} justifyContent={{ xs: "flex-start", md: "flex-end" }} alignItems="center">
                <Grid item xs={12} sm={5} md={5} lg={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name or number"
                    onChange={handleSearchByName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      // style: {
                      //   border: "1px solid #ABB3BF",
                      //   padding: "1px",
                      //   paddingLeft: "2px",
                      //   borderRadius: "5px",
                      // },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={3}>

                  <FormControl size="small" sx={{ width: "100%" }}>
                    <Select
                      displayEmpty
                      value={selectedPaymentType}
                      onChange={filterByDeliveryStatus}
                    >
                      <MenuItem value={"All"}>All</MenuItem>
                      <MenuItem value={"Success"}>Success</MenuItem>
                      <MenuItem value={"Failed"}>Failed</MenuItem>
                      <MenuItem value={"Pending"}>Pending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} md={3} lg={2}>
                  {students?.length > 0 && (
                    <Button fullWidth variant="contained" disableElevation onClick={handleExcelClick}>Export</Button>
                  )}
                </Grid>

              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="results sms table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Student</StyledTableCell>
                  <StyledTableCell>Class</StyledTableCell>
                  <StyledTableCell>msisdn</StyledTableCell>
                  <StyledTableCell>For</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Message</StyledTableCell>
                  <StyledTableCell>Date/Time</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students &&
                  !!students.length &&
                  students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student: any, index: number) => (
                      <StyledTableRow key={index}>
                        <StyledTableCell>
                          <Typography variant="body1" sx={{ fontSize: 14, }}>{`${student?.student?.firstName?.toUpperCase()} ${student?.student?.lastName?.toUpperCase()}`}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>ID: {student?.student?.studentId?.toUpperCase()}</Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${student?.student?.class?.form
                            } ${student?.student?.class?.name?.toUpperCase()}`}
                        </StyledTableCell>

                        <StyledTableCell>
                          {formatPhoneNumberIntl(student?.msisdn || "")}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.batch?.name?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.status?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.responseMessage}
                        </StyledTableCell>
                        <StyledTableCell>{student?.createdAt}</StyledTableCell>
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
