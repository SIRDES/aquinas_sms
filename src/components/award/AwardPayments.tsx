"use client";
import ConfirmationDialog from "@/components/ConfirmationDialog";
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
import { useEffect, useState } from "react";

import { useBatchesContext } from "@/context/BatchesContext";
import Tooltip from "@mui/material/Tooltip";
import * as XLSX from "xlsx";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

import { CustomizedSelect } from "@/components/CustomizedSelect";
import ActionStatusAlert from "@/components/ActionStatusAlert";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import { useAwards } from "@/hooks/useAwards";
import { getAllAwardPaymentTransactionsByElectionId } from "@/utils/serverActions/awardPaymentTransactions";
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
  },
  "&:hover": {
    // cursor: "pointer",
  },
}));
export default function AwardPayments() {
  const { award } = useAwards();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });
  const [fetchedStudents, setFetchedStudents] = useState<any>(null);
  const [students, setStudents] = useState<Array<any>>([]);
  const [excelData, setExcelData] = useState<Array<any>>([]);

  const [selectedPaymentType, setSelectedPaymentType] = useState("All");
  const [actionStatus, setActionStatus] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });
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
      const responseData = await getAllAwardPaymentTransactionsByElectionId(
        award._id
      );
      // console.log("payment responseData", responseData);

      if (!responseData.success) {
        setSnackbar({
          open: true,
          message: responseData.message,
          severity: "error",
        });
        return;
      }
      if (responseData?.data?.length === 0) {
        setSnackbar({
          open: true,
          message: "No payments found",
          severity: "error",
        });
        return;
      }
      setFetchedStudents(responseData?.data || []);
      setStudents(responseData?.data || []);
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

  useEffect(() => {
    if (award === undefined || !award?._id) return;
    // console.log(selectedBatch);
    fetchStudentsData();
    setSelectedPaymentType("All");
  }, [award]);

  useEffect(() => {
    // setReportData(students);
    console.log("students", students);
    setExcelData(
      students.map((student: any) => ({
        ID: student?.nomineeCode,
        Name: `${
          student?.nominee?.firstName
            ? student?.nominee?.firstName?.toUpperCase()
            : ""
        } ${
          student?.nominee?.lastName
            ? student?.nominee?.lastName?.toUpperCase()
            : ""
        }`,
        Category: `${student?.category?.name?.toUpperCase()}`,
        Amount: student?.amount,
        Status: student?.status,
        Phone: student?.msisdn,
        Date: student?.createdAt,
      }))
    );
  }, [students]);
  const handleExcelClick = () => {
    // setSelectedBatch(batch);

    // handleDownloadClose();
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${award?.name}_payment_data.xlsx`);
    // XLSX.writeFile(wb, `${selectedBatch?.name}_payment_data.xlsx`); {`${selectedBatch?.academicYearDetails?.name} - ${selectedBatch?.name}`?.toUpperCase()}
  };

  const handleSearchByName = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        student?.nominee?.firstName
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.nominee?.lastName
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.nomineeCode.toLowerCase().includes(value.toLowerCase())
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
      <ActionStatusAlert
        open={actionStatus.open}
        message={actionStatus.message}
      />
      <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
        // redirect="/students"
      />
      <Box>
        <Grid container spacing={1} my={2}>
          <Grid item xs={12} sm={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or code"
              onChange={handleSearchByName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                style: {
                  border: "1px solid #ABB3BF",
                  padding: "1px",
                  paddingLeft: "2px",
                  borderRadius: "5px",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <Select
              fullWidth
              displayEmpty
              input={<CustomizedSelect />}
              value={selectedPaymentType}
              onChange={filterByDeliveryStatus}
            >
              <MenuItem value={"All"}>All</MenuItem>
              <MenuItem value={"Success"}>Success</MenuItem>
              <MenuItem value={"Failed"}>Failed</MenuItem>
              <MenuItem value={"Pending"}>Pending</MenuItem>
            </Select>
          </Grid>
          {students?.length > 0 && (
            <Grid item xs={12} sm={12} md={3}>
              <Button onClick={handleExcelClick}>Export</Button>
            </Grid>
          )}
        </Grid>
        <Divider />
        <Box mt={2} mb={4}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="award payments table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Code</StyledTableCell>
                  <StyledTableCell>Nominee Name</StyledTableCell>
                  <StyledTableCell>Category</StyledTableCell>
                  <StyledTableCell>No. of Votes</StyledTableCell>
                  <StyledTableCell>msisdn</StyledTableCell>
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
                          {student?.nomineeCode}
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${
                            student?.nominee?.firstName
                              ? student?.nominee?.firstName?.toUpperCase()
                              : ""
                          } ${
                            student?.nominee?.lastName
                              ? student?.nominee?.lastName?.toUpperCase()
                              : ""
                          }`}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.category?.name}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.numberOfVotes}
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatPhoneNumberIntl(student?.msisdn || "")}
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
