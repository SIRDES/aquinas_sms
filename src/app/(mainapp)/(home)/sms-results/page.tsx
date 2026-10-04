"use client";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingAlert from "@/components/LoadingAlert";
import PermissionGuard from "@/components/PermissionGuard";

import { StudentType } from "@/types/commonTypes";

import SearchIcon from "@mui/icons-material/Search";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {

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
import {
  ForwardedRef,
  LegacyRef,
  SyntheticEvent,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactPaginate from "react-paginate";
import { useBatchesContext } from "@/context/BatchesContext";
import Tooltip from "@mui/material/Tooltip";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import {
  currencyFormatter,
  formatDate,
  isGreaterThan24HourAgo,
} from "@/utils/services/utils";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import Link from "next/link";
import * as XLSX from "xlsx";
import RefreshIcon from "@mui/icons-material/Refresh";

import { CustomizedSelect } from "@/components/CustomizedSelect";
import ActionStatusAlert from "@/components/ActionStatusAlert";
import dayjs from "dayjs";
import { useDebounce } from "use-debounce";
import {
  checkAndUpdateSmsStatus,
  getSMSResults,
} from "@/utils/serverActions/smsResult";
import { showAlert } from "@/components/Alerts";
import { sendSms } from "@/utils/services/sms";
import { useSession } from "next-auth/react";
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
  },
  "&:hover": {
    // cursor: "pointer",
  },
}));
export default function SMSResults() {
  const theme = useTheme();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [smsToResend, setSmsToResend] = useState<any>(null);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedStudents, setFetchedStudents] = useState<any>(null);
  const [students, setStudents] = useState<Array<any>>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState("ALL");
  const [actionStatus, setActionStatus] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 1000);

  const handleChangePage = async (data: { selected: number }) => {
    // console.log(data.selected);
    // setPage(data.selected + 1);
    await fetchStudentsData({
      searchText: "",
      page: data.selected + 1,
      rowsPerPage: rowsPerPage,
    });
  };

  const handleChangeRowsPerPage = async (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    setRowsPerPage(value);
  };

  const fetchStudentsData = async ({
    searchText = "",
    page = 1,
    rowsPerPage = 100,
  }: {
    searchText?: string;
    page?: number;
    rowsPerPage?: number;
  }) => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);

    // console.log(selectedBatch)
    try {
      const res = await getSMSResults({
        searchText: searchText,
        page: page,
        rowsPerPage: rowsPerPage,
      });

      let lists: any = res.data;
      console.log(lists);

      if (lists.length === 0) {
        showAlert({
          title: "Error",
          text: "No results SMS found",
          severity: "error",
        });
        return;
      }
      setFetchedStudents(lists);
      setStudents(lists);
      setPage(page);
      setRowsPerPage(rowsPerPage);
      setTotalCount(res?.totalCount || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   // if (selectedBatch === undefined) return;
  //   // console.log(selectedBatch);
  //   fetchStudentsData({ searchText: "", page: page, rowsPerPage: rowsPerPage });
  // }, []);

  const handleSearchByName = (e: any) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    const search = async () => {
      console.log("debouncedSearchText", debouncedSearchText);
      if (debouncedSearchText || debouncedSearchText === "") {
        console.log("debouncedSearchText fetchStudentsData");
        await fetchStudentsData({
          searchText: debouncedSearchText,
          page: 1, // Reset to first page on new search
          rowsPerPage: rowsPerPage,
        });
      }
    };

    search();

    // Cleanup function
    return () => {
      // This will cancel any pending API calls if the component unmounts
      // or if the dependencies change before the debounce time is up
    };
  }, [debouncedSearchText, rowsPerPage]);

  const filterByDeliveryStatus = async (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedPaymentType(value);

    if (value === "ALL") {
      await fetchStudentsData({
        searchText: "",
        page: 1,
        rowsPerPage: rowsPerPage,
      });
      return;
    }
    await fetchStudentsData({
      searchText: value.toUpperCase(),
      page: 1,
      rowsPerPage: rowsPerPage,
    });
  };

  const handleResendSMS = (student: any) => {
    setOpenConfirmationDialog(true);
    setSmsToResend(student);
  };

  const handleConfirmResend = async () => {
    if (!smsToResend) return;

    try {
      setOpenConfirmationDialog(false);
      setActionStatus({ open: true, message: "Sending message..." });
      const response = await sendSms({
        message: smsToResend.message,
        recipients: [smsToResend.phoneNumber],
      });
      setActionStatus({ open: false, message: "" });
      showAlert({
        title: "Success",
        text: "Message resent successfully",
        severity: "success",
      });
      await fetchStudentsData({
        searchText: "",
        page: page,
        rowsPerPage: rowsPerPage,
      });
    } catch (error: any) {
      console.error("Error resending SMS:", error);
      showAlert({
        title: "Error",
        text: error?.message || "Failed to resend message",
        severity: "error",
      });
    } finally {
      setActionStatus({ open: false, message: "" });
      setSmsToResend(null);
    }
  };

  const handleRefreshStatus = async () => {
    setActionStatus({ open: true, message: "Refresing statuses..." });
    try {
      const lists: any[] = [];
      const response = await checkAndUpdateSmsStatus();
      showAlert({
        title: response.success ? "Success" : "Error",
        text: response.message,
        severity: response.success ? "success" : "error",
      });
      await fetchStudentsData({
        searchText: "",
        page: 1,
        rowsPerPage: rowsPerPage,
      });
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setActionStatus({ open: false, message: "" });
    }
  };
  return (
    <>
      <LoadingAlert open={loading} />
      <ActionStatusAlert
        open={actionStatus.open}
        message={actionStatus.message}
      />

      <Box>
        <Typography
          variant="h5"
          gutterBottom
          mb={2}
          px={{ xs: 1, sm: 2, md: 3 }}
          pt={3}
        >
          Results SMS sent
        </Typography>
        <Divider />
        <Grid container spacing={1} px={{ xs: 1, sm: 2, md: 3 }} my={2}>
          <Grid item xs={12} sm={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
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
              <MenuItem value={"ALL"}>ALL</MenuItem>
              <MenuItem value={"DELIVERED"}>DELIVERED</MenuItem>
              <MenuItem value={"NOT_DELIVERED"}>NOT DELIVERED</MenuItem>
            </Select>
          </Grid>
          {students?.length > 0 && (
            <Grid item xs={12} sm={12} md={3}>
              <Tooltip title="Refresh status">
                <IconButton onClick={handleRefreshStatus}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
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
                  <StyledTableCell>Phone number</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Date/Time</StyledTableCell>
                  <StyledTableCell>Message</StyledTableCell>
                  <PermissionGuard requiredPermission={USER_PERMISSIONS.SMS_RESULTS_RESEND}>
                    <StyledTableCell>Action</StyledTableCell>
                  </PermissionGuard>
                </TableRow>
              </TableHead>
              <TableBody>
                {students &&
                  students?.length > 0 &&
                  students
                    // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student: any, index: number) => (
                      <StyledTableRow key={index}>
                        <StyledTableCell>
                          {student?.phoneNumber}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.status?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {formatDate(student?.createdAt || new Date())}
                        </StyledTableCell>
                        <StyledTableCell>{student?.message}</StyledTableCell>
                        <PermissionGuard requiredPermission={USER_PERMISSIONS.SMS_RESULTS_RESEND}>
                          <StyledTableCell>
                            {["DELIVERED", "PENDING", "SUBMITTED"].includes(
                              student?.status?.toUpperCase(),
                            ) ? (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleResendSMS(student)}
                              >
                                Resend
                              </Button>
                            ) : null}
                          </StyledTableCell>
                        </PermissionGuard>

                      </StyledTableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
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
                {[100, 200].map((pageSize) => (
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
                      // onClick={() =>
                      //   setPage((prev) => Math.min(prev + 1, totalPages))
                      // }
                      disabled={page >= totalPages}
                      aria-label="next page"
                      size="small"
                    >
                      <KeyboardArrowRight />
                    </IconButton>
                  }
                  onPageChange={handleChangePage}
                  // onPageChange={(data) => setPage(data.selected + 1)}
                  pageRangeDisplayed={5}
                  marginPagesDisplayed={1}
                  pageCount={totalPages}
                  previousLabel={
                    <IconButton
                      // onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                  forcePage={page - 1} // ReactPaginate is 0-indexed, so we subtract 1
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <ConfirmationDialog
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        handleConfirmation={handleConfirmResend}
        title="Confirm Resend"
        message={`Are you sure you want to resend this message to ${smsToResend?.phoneNumber || "this number"}?`}
      />
    </>
  );
}
