"use client";
import LoadingAlert from "@/components/LoadingAlert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
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
  Tooltip,
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

import { formatPhoneNumberIntl } from "react-phone-number-input";
import { showAlert } from "@/components/Alerts";
import PermissionGuard from "@/components/PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getAllPaymentWithdrawals } from "@/utils/serverActions/paymentWithdrawals";
import AddPaymentWithdrawalModal from "@/components/AddPaymentWithdrawalModal";
import { useRouter } from "next/navigation";

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
export default function PaymentsWithdrawals() {
  const router = useRouter();
  const { fetchedBatches } = useBatchesContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [selectedBatchExams, setSelectedExams] = useState<any>(null);
  const [fetchedStudents, setFetchedStudents] = useState<any>(null);
  const [students, setStudents] = useState<Array<any>>([]);

  const [selectedPaymentType, setSelectedPaymentType] = useState("All");
  const [openAddModal, setOpenAddModal] = useState(false);

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

  const fetchPaymentWithdrawalsData = async () => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    // console.log(selectedBatch)
    try {
      const responseData = await getAllPaymentWithdrawals();
      console.log("payment responseData", responseData);

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
    fetchPaymentWithdrawalsData();
    setSelectedPaymentType("All");
  }, []);



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
      <AddPaymentWithdrawalModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={() => {
          fetchPaymentWithdrawalsData();
        }}
      />
      <Box>
        <Typography
          variant="h5"
          gutterBottom
          mb={2}
          px={{ xs: 1, sm: 2, md: 3 }}
          pt={3}
        >
          Payment Withdrawals
        </Typography>

        <Divider />
        <Box px={{ xs: 1, sm: 2, md: 3 }} my={2}>
          <Grid container spacing={2} justifyContent="flex-end" alignItems="center">

            <Grid item xs={12} sm={12} md={8} lg={7}>
              <Grid container spacing={2} justifyContent={{ xs: "flex-start", md: "flex-end" }} alignItems="center">
                <Grid item xs={6} sm={4} md={4} lg={3}>

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
              </Grid>
            </Grid>
            <PermissionGuard requiredPermission={USER_PERMISSIONS.PAYMENTS_WITHDRAWALS_MAKE_WITHDRAWAL}  >

              <Grid item xs={6} sm={4} md={3} lg={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => setOpenAddModal(true)}
                >
                  Make Withdrawal
                </Button>
              </Grid>
            </PermissionGuard>
          </Grid>
        </Box>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="payment withdrawals table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>First Payment Transaction</StyledTableCell>
                  <StyledTableCell>Last Payment Transaction</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Date/Time</StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students &&
                  !!students.length &&
                  students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item: any, index: number) => {
                      const firstTx = item?.firstPaymentTransaction;
                      const lastTx = item?.lastPaymentTransaction;
                      const firstStudent = firstTx?.student;
                      const lastStudent = lastTx?.student;

                      const statusLower = item?.status?.toLowerCase();
                      const chipColor =
                        statusLower === "success"
                          ? "success"
                          : statusLower === "pending"
                            ? "warning"
                            : statusLower === "failed"
                              ? "error"
                              : "default";

                      return (
                        <StyledTableRow key={item?._id || index}>
                          {/* First Payment Transaction */}
                          <StyledTableCell sx={{ verticalAlign: "top" }}>
                            {firstTx ? (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                  {firstTx?.batch?.name ? firstTx.batch.name.toUpperCase() : "N/A"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {`${firstStudent?.firstName || ""} ${firstStudent?.lastName || ""}`.trim() || "N/A"}
                                  {firstStudent?.class ? (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{ color: "text.secondary", ml: 0.8, fontWeight: 500 }}
                                    >
                                      ({firstStudent.class.form} {firstStudent.class.name?.toUpperCase()})
                                    </Typography>
                                  ) : null}
                                </Typography>
                                {firstStudent?.studentId && (
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    ID: {firstStudent.studentId.toUpperCase()}
                                  </Typography>
                                )}
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  MSISDN: {formatPhoneNumberIntl(firstTx?.msisdn || "") || firstTx?.msisdn || "N/A"}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  Created: {firstTx?.createdAt || "N/A"}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </StyledTableCell>

                          {/* Last Payment Transaction */}
                          <StyledTableCell sx={{ verticalAlign: "top" }}>
                            {lastTx ? (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                  {lastTx?.batch?.name ? lastTx.batch.name.toUpperCase() : "N/A"}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {`${lastStudent?.firstName || ""} ${lastStudent?.lastName || ""}`.trim() || "N/A"}
                                  {lastStudent?.class ? (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{ color: "text.secondary", ml: 0.8, fontWeight: 500 }}
                                    >
                                      ({lastStudent.class.form} {lastStudent.class.name?.toUpperCase()})
                                    </Typography>
                                  ) : null}
                                </Typography>
                                {lastStudent?.studentId && (
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    ID: {lastStudent.studentId.toUpperCase()}
                                  </Typography>
                                )}
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  MSISDN: {formatPhoneNumberIntl(lastTx?.msisdn || "") || lastTx?.msisdn || "N/A"}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  Created: {lastTx?.createdAt || "N/A"}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </StyledTableCell>

                          {/* Status */}
                          <StyledTableCell sx={{ verticalAlign: "top" }}>
                            <Chip
                              label={item?.status?.toUpperCase() || "PENDING"}
                              size="small"
                              color={chipColor as any}
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                            />
                          </StyledTableCell>

                          {/* Date/Time */}
                          <StyledTableCell sx={{ verticalAlign: "top" }}>
                            <Typography variant="body2">{item?.createdAt || "N/A"}</Typography>
                          </StyledTableCell>
                          {/* view icon */}
                          <StyledTableCell sx={{ verticalAlign: "top" }}>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => router.push(`/payment-withdrawals/${item._id}`)}
                                aria-label="view"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </StyledTableCell>
                        </StyledTableRow>
                      );
                    })}
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
      </Box >


    </>
  );
}
