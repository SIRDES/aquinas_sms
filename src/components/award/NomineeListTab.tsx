"use client";

import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType, StudentType } from "@/types/commonTypes";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";


import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

import Image from "next/image";
import dynamic from "next/dynamic";
import { getAllElectionCategoriesByAwardId } from "@/utils/serverActions/electionCategory";
import { useAwards } from "@/hooks/useAwards";
import {
  addElectionNominee,
  deleteElectionNominee,
  getAllElectionNomineesByElectionId,
} from "@/utils/serverActions/electionNominee";
import { showAlert } from "../Alerts";
import NomineeFormModal from "./NomineeFormModal";
import DeleteIcon from "@mui/icons-material/Delete";


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
  // "&:hover": {
  //     cursor: "pointer",
  // },
}));

export default function NomineeList() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programmes, setProgrammes] = useState<Array<any>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nomineeToDelete, setNomineeToDelete] = useState<string | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchNomineesData = async () => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    // console.log(selectedBatch)
    try {
      const responseData = await getAllElectionNomineesByElectionId({
        electionId: award?._id || "",
      });
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
          message: "No Nominees found",
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

  // console.log(selectedBatch);
  useEffect(() => {
    if (!award) return;
    fetchNomineesData();
  }, [award]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setNomineeToDelete(id);
    setDeleteDialogOpen(true);
  };
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setNomineeToDelete(null);
  };
  const fetchProgrammes = async () => {
    setProgrammes([]);
    try {
      const response = await getAllElectionCategoriesByAwardId({
        electionId: award?._id,
      });
      console.log("election category", response);
      if (!response.success) return;
      setProgrammes(response?.data || []);
    } catch (error: any) {
      // console.log("error", error);
    }
  };

  useEffect(() => {
    if (!award) return;
    fetchProgrammes();
  }, [award]);

  const handleSearchByName = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        `${student?.nominee?.firstName?.toUpperCase()} ${student?.nominee?.lastName?.toUpperCase()}`
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        student?.nomineeCode?.includes(value)
    );
    setStudents(filteredStudents);
  };

  const handleSearchByProgramme = (
    event: SyntheticEvent<Element, Event>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    // const value = e.target.value;
    // console.log(value, reason, details);
    if (reason === "clear" || value === null) {
      setStudents(fetchedStudents);
      return;
    }
    // console.log(value);
    const filteredTeachers = fetchedStudents.filter((student: any) =>
      student?.category?.name.toLowerCase().includes(value?.name.toLowerCase())
    );
    setStudents(filteredTeachers);
  };


  const handleConfirmDelete = async () => {
    if (!nomineeToDelete) return;

    try {
      const response = await deleteElectionNominee({ id: nomineeToDelete });
      if (response.success) {
        showAlert({
          title: "Success",
          severity: "success",
          text: "Nominee deleted successfully",
        });
        fetchNomineesData();
      }
    } catch (error: any) {
      console.error("Error deleting nominee:", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "Failed to delete nominee",
      });
    } finally {
      setDeleteDialogOpen(false);
      setNomineeToDelete(null);
    }
  };

  const handleSaveNominee = async (userData: any) => {
    try {
      setIsSubmitting(true);
      const response = await addElectionNominee({
        nomineeId: userData.nomineeId,
        electionId: award._id,
        categoryId: userData.categoryId,
      });
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
        text: "Nominee added successfully",
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
      <NomineeFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNominee}
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
              id="filter-by-category"
              fullWidth
              size="small"
              options={programmes}
              getOptionLabel={(option: any) => option?.name?.toUpperCase()}
              // defaultValue={[top100Films[13]]}
              onChange={handleSearchByProgramme}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} placeholder="category" />
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
            New Nominee
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
                  <StyledTableCell>Nominee code</StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Alias</StyledTableCell>
                  <StyledTableCell>Category</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students &&
                  !!students.length &&
                  students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student: any, index: number) => (
                      <StyledTableRow
                        key={student._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTableCell>
                          {student?.nomineeCode}
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${
                            student?.nominee?.firstName
                              ? student?.nominee?.firstName
                              : ""
                          } ${
                            student?.nominee?.lastName
                              ? student?.nominee?.lastName
                              : ""
                          }`
                            .trim()
                            .toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.nominee?.aliasName}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.category?.name}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(student._id);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Nominee</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this nominee? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
