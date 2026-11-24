"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { use, useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

import { formatPhoneNumberIntl } from "react-phone-number-input";
import { showAlert } from "@/components/Alerts";
import PermissionGuard from "@/components/PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";
import { getPaymentWithdrawalsById } from "@/utils/serverActions/paymentWithdrawals";

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
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function statusChipColor(
  status: string
): "warning" | "success" | "error" | "info" | "default" {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "warning";
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "error";
    case "PROCESSING":
      return "info";
    default:
      return "default";
  }
}

function TransactionInfoCard({
  label,
  tx,
}: {
  label: string;
  tx: any;
}) {
  if (!tx) return null;
  const studentName = `${tx.student?.firstName || ""} ${tx.student?.lastName || ""}`.trim().toUpperCase();
  const className = `${tx.student?.class?.form || ""} ${tx.student?.class?.name || ""}`.trim().toUpperCase();
  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography variant="body2">
          <strong>Batch:</strong> {tx.batch?.name?.toUpperCase() || "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Exam Date:</strong>{" "}
          {tx.batch?.date ? new Date(tx.batch.date).toLocaleDateString() : "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Student:</strong> {studentName || "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Student ID:</strong> {tx.student?.studentId || "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Class:</strong> {className || "—"}
        </Typography>
        <Typography variant="body2">
          <strong>MSISDN:</strong> {formatPhoneNumberIntl(tx.msisdn || "") || tx.msisdn || "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Network:</strong> {tx.network || "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Amount:</strong> GHS {tx.amount || "—"}
        </Typography>
        <Typography variant="body2">
          <strong>Date:</strong> {tx.createdAt || "—"}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function PaymentWithdrawalDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [loading, setLoading] = useState(false);
  const [withdrawal, setWithdrawal] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const responseData = await getPaymentWithdrawalsById(id);
      // console.log("withdrawal detail:", responseData);

      if (!responseData.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: responseData.message || "Failed to fetch withdrawal data",
        });
        return;
      }

      if (!responseData.data) {
        showAlert({
          title: "Not Found",
          severity: "warning",
          text: "No withdrawal record found.",
        });
        return;
      }

      setWithdrawal(responseData.data);
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExcelExport = () => {
    if (!withdrawal?.paymentTransactions?.length) return;

    // Flatten all transactions across all batch groups
    const rows: any[] = [];
    withdrawal.paymentTransactions.forEach((group: any) => {
      const examsLabel = `${group.batch?.academicYearDetails?.name ? group.batch.academicYearDetails.name + " - " : ""}${group.batch?.name?.toUpperCase() || ""}`.trim();
      group.transactions?.forEach((tx: any) => {
        const studentId = tx.student?.studentId || "";
        const studentName = `${tx.student?.firstName || ""} ${tx.student?.lastName || ""}`.trim().toUpperCase();
        const studentClass = `${tx.student?.class?.form || ""} ${tx.student?.class?.name || ""}`.trim().toUpperCase();
        const msisdn = formatPhoneNumberIntl(tx.msisdn || "") || tx.msisdn || "";
        rows.push({
          "Student ID": studentId,
          "Student Name": studentName,
          "Student Class": studentClass,
          "Exams": examsLabel,
          "MSISDN": msisdn,
          "Date/Time": tx.createdAt || "",
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "paymentwithdrawals.xlsx");
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <Box>
        {/* Page header */}
        <Typography
          variant="h5"
          gutterBottom
          mb={2}
          px={{ xs: 1, sm: 2, md: 3 }}
          pt={3}
        >
          Payment Withdrawal Details
        </Typography>
        <Divider />

        <PermissionGuard requiredPermission={USER_PERMISSIONS.EXAMS_PAYMENTS_VIEW_ALL}>
          <Box px={{ xs: 1, sm: 2, md: 3 }} mt={3} mb={4}>
            {withdrawal && (
              <>
                {/* ── Summary card ── */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm="auto">
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={withdrawal.status || "—"}
                        color={statusChipColor(withdrawal.status)}
                        size="small"
                        sx={{ fontWeight: 700, mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm="auto">
                      <Typography variant="subtitle2" color="text.secondary">Total Withdrawal Amount</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        GHS {Number(withdrawal.totalWithdrawalAmount ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm="auto">
                      <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                      <Typography variant="body1">{withdrawal.createdAt || "—"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm="auto">
                      <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
                      <Typography variant="body1">{withdrawal.updatedAt || "—"}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* ── First / Last transaction cards ── */}
                {/* <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={6}>
                    <TransactionInfoCard label="First Payment Transaction" tx={withdrawal.firstPaymentTransaction} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TransactionInfoCard label="Last Payment Transaction" tx={withdrawal.lastPaymentTransaction} />
                  </Grid>
                </Grid> */}

                {/* ── Transactions grouped by Exams ── */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">
                    Transactions by Exams
                  </Typography>
                  {withdrawal.paymentTransactions?.length > 0 && (
                    <Button
                      variant="contained"
                      disableElevation
                      size="small"
                      startIcon={<FileDownloadIcon />}
                      onClick={handleExcelExport}
                    >
                      Export to Excel
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />

                {withdrawal.paymentTransactions?.length > 0 ? (
                  withdrawal.paymentTransactions.map((group: any) => (
                    <Accordion key={group._id} defaultExpanded={false} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center">
                          <Typography variant="subtitle1" fontWeight={700}>
                            {group.batch?.academicYearDetails?.name || "—"}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {group.batch?.name?.toUpperCase() || "—"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {group?.batch?.yearGroup}
                          </Typography>
                          <Chip
                            label={`${group.count} transaction${group.count !== 1 ? "s" : ""}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`GHS ${Number(group.totalAmount ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <TableContainer component={Paper} elevation={0} sx={{
                          maxHeight: "calc(100vh - 260px)", // Adjust this value based on your layout
                          overflow: "auto",

                        }}>
                          <Table stickyHeader sx={{ minWidth: 650 }} aria-label="batch transactions table">
                            <TableHead>
                              <TableRow>
                                <StyledTableCell>Student</StyledTableCell>
                                <StyledTableCell>Class</StyledTableCell>
                                <StyledTableCell>MSISDN</StyledTableCell>
                                <StyledTableCell>Network</StyledTableCell>
                                <StyledTableCell>Amount</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Date / Time</StyledTableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {group.transactions?.map((tx: any, idx: number) => {
                                const name = `${tx.student?.firstName || ""} ${tx.student?.lastName || ""}`.trim().toUpperCase();
                                const cls = `${tx.student?.class?.form || ""} ${tx.student?.class?.name || ""}`.trim().toUpperCase();
                                return (
                                  <StyledTableRow key={tx._id || idx}>
                                    <StyledTableCell>
                                      <Typography variant="body2">{name || "—"}</Typography>
                                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        ID: {tx.student?.studentId || "—"}
                                      </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>{cls || "—"}</StyledTableCell>
                                    <StyledTableCell>
                                      {formatPhoneNumberIntl(tx.msisdn || "") || tx.msisdn || "—"}
                                    </StyledTableCell>
                                    <StyledTableCell>{tx.network || "—"}</StyledTableCell>
                                    <StyledTableCell>GHS {tx.amount || "—"}</StyledTableCell>
                                    <StyledTableCell>
                                      <Chip
                                        label={tx.status || "—"}
                                        size="small"
                                        color={
                                          tx.status?.toLowerCase() === "success"
                                            ? "success"
                                            : tx.status?.toLowerCase() === "failed"
                                              ? "error"
                                              : "warning"
                                        }
                                      />
                                    </StyledTableCell>
                                    <StyledTableCell>{tx.createdAt || "—"}</StyledTableCell>
                                  </StyledTableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Typography color="text.secondary">No transactions found.</Typography>
                )}
              </>
            )}

            {!withdrawal && !loading && (
              <Typography color="text.secondary">No withdrawal data available.</Typography>
            )}
          </Box>
        </PermissionGuard>
      </Box>
    </>
  );
}
