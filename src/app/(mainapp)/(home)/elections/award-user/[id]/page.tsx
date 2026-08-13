"use client";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  useTheme,
} from "@mui/material";
import React, {
  LegacyRef,
  forwardRef,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import LoadingAlert from "@/components/LoadingAlert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";
import Link from "next/link";

import { formatPhoneNumberIntl } from "react-phone-number-input";
import { getElectionUserByIdAndElectionId } from "@/utils/serverActions/electionUser";
import { useAwards } from "@/hooks/useAwards";
const GradeTableCell = styled(TableCell)(({ theme }) => ({
  padding: "3px 8px",
  [`&.${tableCellClasses.head}`]: {
    // backgroundColor: theme.palette.primary.main,
    // color: theme.palette.common.white,
    fontSize: 10,
    fontWeight: "bold",
    border: "1px solid black",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 10,
    border: "1px solid black",
  },
}));

const ResultsTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const ResultsTableCell = styled(TableCell)(({ theme }) => ({
  padding: "9px 8px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "9px 8px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    // padding: "4px 4px",
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

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { award } = useAwards();
  const [studentData, setStudentData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });

  const fetchStudentsData = async () => {
    setLoading(true);
    setStudentData({});
    try {
      const res = await getElectionUserByIdAndElectionId({
        id,
        electionId: award?._id,
      });
      // console.log("getElectionUserByIdAndElectionId res", res);
      if (!res?.success) {
        setSnackbar({
          open: true,
          message: res?.data?.message || "An error occurred, please try again",
          severity: "error",
        });
        return;
      }

      setStudentData(res?.data);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (award === undefined) return;
    fetchStudentsData();
  }, [award]);

  return (
    <>
      <LoadingAlert open={loading} />
      <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
        // redirect="/charities"
      />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Box
          display="flex"
          justifyContent="space-between"
          mb={1}
          // mt={1}
          // px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Typography variant="h6">Award user details</Typography>
        </Box>
        <Divider />
        <Box
          sx={{
            // px: { xs: 1, sm: 2, md: 4 },
            mb: 2,
            mt: 3,
          }}
        >
          {Object.keys(studentData)?.length !== 0 && (
            <>
              <Grid container spacing={2}>
                {/* student name */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.firstName?.toUpperCase()}{" "}
                    {studentData?.lastName?.toUpperCase()}
                  </Typography>
                </Grid>
                {/* Alias */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Alias:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.aliasName}
                  </Typography>
                </Grid>

                {/* email */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Email:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.email?.toLowerCase()}
                  </Typography>
                </Grid>
                {/* phone number */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Phone number:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {formatPhoneNumberIntl(studentData?.phoneNumber || "")}
                  </Typography>
                </Grid>

                {/* role */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Role:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.role?.split("_")[1]?.toUpperCase()}
                  </Typography>
                </Grid>
              </Grid>
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                mt={2}
                mb={2}
                alignItems={"flex-end"}
              >
                <Typography variant="body1" fontWeight={700}>
                  Nominations
                </Typography>
              </Box>
              <Paper
                sx={{ width: { md: "65%", xs: "100%" }, overflow: "hidden" }}
              >
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table aria-label="results table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>CATEGORY</StyledTableCell>

                        <StyledTableCell>NO. OF VOTES</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentData?.nominations?.length === 0 ? (
                        <StyledTableRow>
                          <StyledTableCell colSpan={2} align="center">
                            No nominations found
                          </StyledTableCell>
                        </StyledTableRow>
                      ) : (
                        studentData?.nominations.map(
                          (subject: any, index: number) => (
                            <StyledTableRow key={subject?._id}>
                              <StyledTableCell>
                                {subject?.categoryDetails?.name?.toUpperCase()}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {subject?.votes || 0}
                              </StyledTableCell>
                            </StyledTableRow>
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Box>
      </Container>
    </>
  );
}
