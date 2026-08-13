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
import {
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

import Image from "next/image";
import dynamic from "next/dynamic";
import axios from "axios";
import { getAllElectionCategoriesByAwardId } from "@/utils/serverActions/electionCategory";
import { useAwards } from "@/hooks/useAwards";
import { getAllElectionNomineesByElectionId } from "@/utils/serverActions/electionNominee";
import {
  getAllElectionUsers,
  addElectionUser,
  updateElectionUser,
} from "@/utils/serverActions/electionUser";
import UserFormModal from "./UserFormModal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { showAlert } from "@/components/Alerts";

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
}));

export default function ElectionUsers() {
  const theme = useTheme();
  const router = useRouter();
  // const { form } = use(params);
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
  const [students, setStudents] = useState<Array<StudentType>>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenModal = (user: any = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      setIsSubmitting(true);
      let response;
      if (selectedUser) {
        // Update existing user
        response = await updateElectionUser({
          id: selectedUser._id,
          ...userData,
        });
      } else {
        // Add new user
        response = await addElectionUser({
          ...userData,
          electionId: award?._id,
        });
      }
      if (!response.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: response.message || "Failed to save user",
        });
        return;
      }
      showAlert({
        title: "Success",
        severity: "success",
        text: selectedUser
          ? "User updated successfully"
          : "User added successfully",
      });
      fetchNomineesData(); // Refresh the user list
    } catch (error: any) {
      console.error("Error saving user:", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "Failed to save user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchNomineesData = async () => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    // console.log(selectedBatch)
    console.log("award ", award);
    try {
      const responseData = await getAllElectionUsers(award?._id || "");
      console.log("responseData", responseData);

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
          message: "No User found",
          severity: "error",
        });
        return;
      }
      setFetchedStudents(responseData?.data || []);
      setStudents(responseData?.data || []);
    } catch (error: any) {
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
    if (!award) return;
    fetchNomineesData();
  }, [award]);

  const handleSearchByName = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        `${student?.firstName?.toUpperCase()} ${student?.lastName?.toUpperCase()}`
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.beceIndexNumber.includes(value)
    );
    setStudents(filteredStudents);
  };

  const handleSearchByRole = (
    event: SyntheticEvent<Element, Event>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    // const value = e.target.value;
    console.log(value, reason, details);
    if (reason === "clear" || value === null) {
      setStudents(fetchedStudents);
      return;
    }
    // console.log(value);
    const filteredTeachers = fetchedStudents.filter((student: any) =>
      student?.role?.toLowerCase().includes(value?.name.toLowerCase())
    );
    setStudents(filteredTeachers);
  };

  // if (loading) return <LoadingAlert open={true} />;

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
      <UserFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSave={handleSaveUser}
        loading={isSubmitting}
      />
      <Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          mb={2}
          mt={2}
          // px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Box display={"flex"} gap={3}>
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
            <Autocomplete
              id="filter-by-role"
              fullWidth
              size="small"
              options={[
                { name: "Manage", value: "award_manager" },
                { name: "Nominee", value: "election_nominee" },
              ]}
              getOptionLabel={(option: any) => option?.name?.toUpperCase()}
              // defaultValue={[top100Films[13]]}
              onChange={handleSearchByRole}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} placeholder="Role" />
              )}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              borderRadius: "4px",
              width: "fit-content",
              color: "white",
              fontWeight: 700,
            }}
          >
            New User
          </Button>
        </Box>
        <Divider />
        <Box mt={2} mb={4}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="students table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Alias</StyledTableCell>
                  <StyledTableCell>Phone</StyledTableCell>
                  <StyledTableCell>Role</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
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
                          {`${student?.firstName ? student?.firstName : ""} ${
                            student?.lastName ? student?.lastName : ""
                          }`
                            .trim()
                            .toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>{student?.email}</StyledTableCell>
                        <StyledTableCell>{student?.aliasName}</StyledTableCell>
                        <StyledTableCell>
                          {student?.phoneNumber}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.role?.split("_")[1]?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box display="flex" gap={1}>
                            <IconButton
                              size="small"
                              component={Link}
                              href={`/elections/award-user/${student?._id}`}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(student);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
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
