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
import { formatDate } from "@/utils/services/utils";
import LoadingAlert from "@/components/LoadingAlert";
import { getAllAuditLogs } from "@/utils/serverActions/auditLog";


const AuditLogsSettings: React.FC = () => {
  const theme = useTheme();

  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Data states
  const [auditLogs, setAuditLogs] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 1000);


  const fetchAuditLogsData = async ({
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
      const res = await getAllAuditLogs({
        searchText: searchStr,
        page: pageIndex,
        rowsPerPage: limit,
      });

      console.log("fetchAuditLogsData res", res);

      if (res.success) {
        setAuditLogs(res.data || []);
        setPage(pageIndex);
        setRowsPerPage(limit);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 0);
      } else {
        showAlert({
          title: "Error",
          text: res.message || "Failed to fetch audit logs",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("error", error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred while fetching audit logs",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };



  // initial render to fetch all audit logs 
  useEffect(() => {
    fetchAuditLogsData({
      searchStr: "",
      pageIndex: 1,
      limit: rowsPerPage,
    });
  }, []);



  useEffect(() => {
    fetchAuditLogsData({
      searchStr: debouncedSearchText,
      pageIndex: 1,
      limit: rowsPerPage,
    });
  }, [debouncedSearchText, rowsPerPage]);

  const handleChangePage = async (data: { selected: number }) => {
    await fetchAuditLogsData({
      searchStr: debouncedSearchText,
      pageIndex: data.selected + 1,
      limit: rowsPerPage,
    });
  };

  const handleChangeRowsPerPage = async (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    setRowsPerPage(value);
  };


  return (
    <Box>
      <LoadingAlert open={loading} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Audit Logs</Typography>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by user name..."
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

      {/* Audit Logs Table */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>User Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Loading audit logs...
                </TableCell>
              </TableRow>
            ) : auditLogs && auditLogs.length > 0 ? (
              auditLogs.map((auditLog: any) => (
                <TableRow key={auditLog._id}>
                  <TableCell>{new Date(auditLog.createdAt).toDateString()}</TableCell>
                  <TableCell>{auditLog.user?.email}</TableCell>
                  <TableCell>{auditLog.action}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {auditLogs && auditLogs.length > 0 && (
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
    </Box>
  );
};

export default AuditLogsSettings;
