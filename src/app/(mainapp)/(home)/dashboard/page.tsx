"use client";
import {
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Button,
} from "@mui/material";
import { Box, useTheme } from "@mui/system";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { SnackbarType } from "@/types/commonTypes";
import axios from "axios";
import LoadingAlert from "@/components/LoadingAlert";
// import ProgressAlert from "@/components/ProgressAlert";
import { showAlert } from "@/components/Alerts";
import { convertAllSubjectNamesToUppercase, getNumberOfStudent, getNumberOfStudentBySubject } from "@/utils/serverActions/dashboard";
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.primary.main,
  height: "100px",
  // padding: "20px",
  // boxShadow: " 0px 1px 6px 0px #D0CDE1",
}));
export default function Dashboard() {
  const theme = useTheme();
  const [numberOfStudents, setNumberOfStudents] = useState<any>(null);
  const [subjects, setSubjects] = useState<Array<any>>([]);
  const [selectedForm, setSelectedForm] = useState<string>("3");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudentsData = async () => {
      setLoadingStudents(true);
      try {
        const res = await getNumberOfStudent();
        if (!res?.success) {
          showAlert({
            title: "Error",
            text: res?.message || "An error occurred",
            severity: "error",
          });
          return;
        }
        setNumberOfStudents(res?.data);
      } catch (error: any) {
        showAlert({
          title: "Error",
          text: error.message || error.data || "An error occurred",
          severity: "error",
        });
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudentsData();
  }, []);

  useEffect(() => {
    const fetchSubjectsData = async () => {
      setLoadingSubjects(true);
      try {
        const res = await getNumberOfStudentBySubject(selectedForm);
        if (!res?.success) {
          showAlert({
            title: "Error",
            text: res?.message || "An error occurred",
            severity: "error",
          });
          return;
        }
        setSubjects(res?.data || []);
      } catch (error: any) {
        showAlert({
          title: "Error",
          text: error.message || error.data || "An error occurred",
          severity: "error",
        });
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjectsData();
  }, [selectedForm]);

  return (
    <>
      <LoadingAlert open={loading} />
      <Box mb={1} mt={2} px={{ xs: 1, sm: 2, md: 3 }}>

        <Grid container spacing={2} mb={2}>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                height: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                }}
              >
                No. of students
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                }}
              >
                {loadingStudents ? (
                  <Skeleton variant="text" width={40} height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
                ) : (
                  numberOfStudents?.totalNumberOfStudents || 0
                )}
              </Typography>
            </Card>
          </Grid>
          <Grid item container spacing={2} xs={12} md={8}>
            <Grid item xs={12} md={4}>
              <Link href="/students/1" style={{ textDecoration: "none" }}>
                <StyledCard
                  sx={{
                    cursor: "pointer",
                    "&:hover .form1-label": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography
                    className="form1-label"
                    variant="body1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      lineHeight: "23px",
                    }}
                  >
                    Form 1
                  </Typography>
                  <Typography
                    className="form-label"
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {loadingStudents ? (
                      <Skeleton variant="text" width={40} height={20} />
                    ) : (
                      numberOfStudents?.numOfForm1Student || 0
                    )}
                  </Typography>
                </StyledCard>
              </Link>
            </Grid>
            <Grid item xs={12} md={4}>
              <Link href="/students/2" style={{ textDecoration: "none" }}>
                <StyledCard
                  sx={{
                    cursor: "pointer",
                    "&:hover .form2-label": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography
                    className="form2-label"
                    variant="body1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      lineHeight: "23px",
                    }}
                  >
                    Form 2
                  </Typography>
                  <Typography
                    className="form2-label"
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {loadingStudents ? (
                      <Skeleton variant="text" width={40} height={20} />
                    ) : (
                      numberOfStudents?.numOfForm2Student || 0
                    )}
                  </Typography>
                </StyledCard>
              </Link>
            </Grid>
            <Grid item xs={12} md={4}>
              <Link href="/students/3" style={{ textDecoration: "none" }}>
                <StyledCard
                  sx={{
                    cursor: "pointer",
                    "&:hover .form3-label": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  <Typography
                    className="form3-label"
                    variant="body1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      lineHeight: "23px",
                    }}
                  >
                    Form 3
                  </Typography>
                  <Typography
                    className="form-label"
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {loadingStudents ? (
                      <Skeleton variant="text" width={40} height={20} />
                    ) : (
                      numberOfStudents?.numOfForm3Student || 0
                    )}
                  </Typography>
                </StyledCard>
              </Link>

            </Grid>
          </Grid>
        </Grid>

        {/* students per subjects table*/}

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 1, pt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: "18px" }}>Students per Subject</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="form-select-label">Form</InputLabel>
                  <Select
                    labelId="form-select-label"
                    id="form-select"
                    value={selectedForm}
                    label="Form"
                    onChange={(e) => setSelectedForm(e.target.value as string)}
                  >
                    <MenuItem value="1">Form 1</MenuItem>
                    <MenuItem value="2">Form 2</MenuItem>
                    <MenuItem value="3">Form 3</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small" sx={{
                  "& .MuiTableCell-root": { fontSize: "16px" },
                  "& .MuiTableRow-root:nth-of-type(even)": {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>No. of Students</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingSubjects ? (
                      [...Array(10)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton variant="text" width="60%" height={20} />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="30%" height={20} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : subjects?.length > 0 ? (
                      subjects.map((subject: any) => (
                        <TableRow key={subject.name}>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>{subject.numberOfStudents}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2}>No subjects found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
