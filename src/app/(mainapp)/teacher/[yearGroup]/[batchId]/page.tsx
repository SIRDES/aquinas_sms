"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType, StudentType } from "@/types/commonTypes";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  InputAdornment,
  InputBase,
  MenuItem,
  Paper,
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
  useTheme,
} from "@mui/material";
import * as XLSX from "xlsx";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { useBatchesContext } from "@/context/BatchesContext";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

import { useSession } from "next-auth/react";
import { addFridayTestBatch } from "@/utils/serverActions/fridayTestBatch";
import {
  getAllFridayTestScoreForASubject,
  registerStudentsToSubject,
  updateStudentMarks,
} from "@/utils/serverActions/fridayTestScore";
import { addAcademicYear } from "@/utils/serverActions/academicYear";
import Link from "next/link";
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
  // "&:hover": {
  //   cursor: "pointer",
  // },
}));

export default function Students({
  params,
}: {
  params: Promise<{ yearGroup: string; batchId: string }>;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  //   const yearGroup = "3";
  const { yearGroup, batchId } = use(params);

  const { batches, fetchedBatches } = useBatchesContext();
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
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
  const [sortAsc, setSortAsc] = useState(false);
  const [editAll, setEditAll] = useState(false);
  const [editOne, setEditOne] = useState<Array<string> | null>(null);
  const [updateList, setUpdateList] = useState<Array<string> | null>(null);
  const [subject, setSubject] = useState<string>();
  const [subjectType, setSubjectType] = useState<string>();
  const [subjectId, setSubjectId] = useState<string>();
  // const [numOfNewlyEntered, setNumOfNewlyEntered] = useState<number>(0);
  const [excelData, setExcelData] = useState<Array<any>>([]);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  useEffect(() => {
    if (session?.user?.subjectsDetails?.length === 0) return;
    const subjectType = session?.user?.subjectsDetails?.[0]?.type as string;
    const subjectId = session?.user?.subjectsDetails?.[0]?._id as string;
    const subject = session?.user?.subjectsDetails?.[0]?.name as string;
    setSubject(subject);
    setSubjectType(subjectType);
    setSubjectId(subjectId);
  }, [session]);

  useEffect(() => {
    if (fetchedBatches?.length === 0) return;
    const batch = fetchedBatches?.filter(
      (batch: any) => batch._id === batchId
    )[0];
    setSelectedBatch(batch);
  }, [fetchedBatches]);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  // console.log("selectedBatch", selectedBatch);
  const fetchStudentsData = async () => {
    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    // console.log("subjectId", subjectId);
    // console.log("yearGroup", yearGroup);
    try {
      const response = await getAllFridayTestScoreForASubject({
        subjectId: subjectId as string,
        fridayTestBatchId: selectedBatch?._id,
        yearGroup: yearGroup,
      });
      if (!response.data) return;
      let lists: any = [];
      if (response.data.length === 0) {
        showAlert({
          title: "Error",
          text: "No students found",
          severity: "error",
        });
        return;
      }
      // console.log("res data", response.data);
      setStudents(response.data);
      setFetchedStudents(response.data);
    } catch (error: any) {
      // console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatch === null) return;
    fetchStudentsData();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [selectedBatch]);

  useEffect(() => {
    // setReportData(students);
    setExcelData(
      students.map((student) => ({
        id: student.student?._id,
        ID: student.student?.studentId?.split("/")[1],
        SSID: student.student?.ssId,
        "Student name": student.student.name.toUpperCase(),
        Class: student.student.class.name,
        "Class score": student?.classScore,
        Exams: student?.marks,
        Total: student?.totalScore,
      }))
    );
  }, [students]);

  const handleExcelClick = () => {
    // setSelectedBatch(batch);

    // handleDownloadClose();
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(
      wb,
      `form_${selectedBatch.form}_${subject?.replaceAll(" ", "_")}.xlsx`
    );
  };

  const handleSearch = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedStudents.filter(
      (student: any) =>
        student?.student?.name?.toLowerCase().includes(value.toLowerCase()) ||
        student?.student?.studentId?.split("/")[1].includes(value)
    );
    setStudents(filteredStudents);
  };

  const handleAddIsSemesterScore = (
    value: number | string,
    type: string,
    studentId: string,
    index: number
  ) => {
    const classMaxMarks = selectedBatch?.isNewCurriculum ? 60 : 30;
    const marksMaxMarks = selectedBatch?.isNewCurriculum ? 40 : 70;

    if (type === "classScore" && (+value < 0 || +value > classMaxMarks)) {
      // alert("Score should be between 0 - 100");
      showAlert({
        title: "Error",
        text: `Score should be between 0 - ${classMaxMarks}`,
        severity: "error",
      });
      return;
    }

    if (type === "marks" && (+value < 0 || +value > marksMaxMarks)) {
      // alert("Score should be between 0 - 100");
      showAlert({
        title: "Error",
        text: `Score should be between 0 - ${marksMaxMarks}`,
        severity: "error",
      });
      return;
    }

    const newStudents = [...students];
    newStudents.forEach((student: any) => {
      if (student._id === studentId) {
        if (type === "classScore") {
          if (value === "") {
            student.classScore = value;
            return;
          }
          student.classScore = +value;
          student.totalScore = +value + student.marks;
          handleSubmitScore(student.totalScore, student._id, index);
        }
        if (type === "marks") {
          if (value === "") {
            student.marks = value;
            return;
          }
          student.marks = +value;
          student.totalScore = +value + student.classScore;
          handleSubmitScore(student.totalScore, student._id, index);
        }
      }
    });
    setStudents(newStudents);
  };
  const handleSortByIDAsc = () => {
    const sortedStudents = students.sort((a: any, b: any) => {
      const studentA = a?.student?.studentId.split("/")[1];
      const studentB = b?.student?.studentId.split("/")[1];
      if (sortAsc) {
        if (studentA > studentB) return -1;
        else if (studentA < studentB) return 1;
        return 0;
      } else {
        if (studentA < studentB) return -1;
        else if (studentA > studentB) return 1;
        return 0;
      }
    });
    setStudents(sortedStudents);
    setSortAsc((prev) => !prev);
  };
  const setStudentScoreAndGrade = (
    student: {
      marks: string | number;
      groupWork: string | number;
      projectWork: string | number;
      classScore: string | number;
      totalScore: string | number;
      grade: string;
      remarks: string;
    },
    detail:
      | "groupWork"
      | "projectWork"
      | "classScore"
      | "marks"
      | "totalScore"
      | "grade"
      | "remarks",
    value: string | number
  ) => {
    if (detail === "grade" || detail === "remarks") {
      student[detail] = String(value);
    } else {
      student[detail] = +value;
    }
  };

  const handleSubmitScore = (value: string, id: string, index: number) => {
    const roundedValue = Math.round(Number(value));
    if (+value < 0 || +value > 100) {
      // alert("Score should be between 0 - 100");
      showAlert({
        title: "Error",
        text: "Score should be between 0 - 100",
        severity: "error",
      });
      return;
    }
    const newStudents = [...students];
    setUpdateList((prev) => {
      if (prev === null) {
        return [id];
      }
      if (prev.includes(id)) {
        return prev;
      }
      return [...prev, id];
    });

    if (value === "") {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "ic"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "incomplete"
      );
    } else if (roundedValue >= 80 && roundedValue <= 100) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "A1"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Excellent"
      );
    } else if (roundedValue >= 70 && roundedValue <= 79) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "B2"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Very Good"
      );
    } else if (roundedValue >= 60 && roundedValue <= 69) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "B3"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Good"
      );
    } else if (roundedValue >= 55 && roundedValue <= 59) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "C4"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Credit"
      );
    } else if (roundedValue >= 50 && roundedValue <= 54) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "C5"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Credit"
      );
    } else if (roundedValue >= 45 && roundedValue <= 49) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "C6"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Credit"
      );
    } else if (roundedValue >= 40 && roundedValue <= 44) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "D7"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Pass"
      );
    } else if (roundedValue >= 35 && roundedValue <= 39) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "E8"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Pass"
      );
    } else {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatch?.isSemester ? "totalScore" : "marks",
        +value
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "F9"
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Fail"
      );
    }
    setStudents(newStudents);
  };
  const saveScore = async (student: any) => {
    return await updateStudentMarks({ student });
  };
  const handleSaveAll = async () => {
    const updateListSet = new Set(updateList);
    // console.log("updateListSet", updateListSet);

    setLoading(true);
    try {
      let numOfUpdates = 0;
      let newIdsToAdd: Array<string> = [];
      await Promise.all(
        students.map((student: any) => {
          // console.log(student);
          if (updateListSet.has(student._id)) {
            return saveScore(student);
          }
        })
      );
      // console.log(numOfUpdates);
      setEditAll(false);
      setEditOne(null);
      await fetchStudentsData();
      showAlert({
        title: "Success",
        text: "Students' marks have been recorded successfully",
        severity: "success",
      });
    } catch (error: any) {
      // console.log(error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred",
        severity: "error",
      });
      //   setSnackbar({
      //     open: true,
      //     message: error.message || "An error occurred",
      //     severity: "error",
      //   });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOne = async (student: any) => {
    setLoading(true);
    try {
      await saveScore(student);

      handleCancelEditOne(student._id);
      await fetchStudentsData();
      showAlert({
        title: "Success",
        text: "Student's marks has been recorded successfully",
        severity: "success",
      });
    } catch (error: any) {
      // console.log(error);
      showAlert({
        title: "Error",
        text: error.message || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEditOne = (student: any, index: number) => {
    setEditOne((prev) => {
      if (prev === null) {
        return [student._id];
      }
      return [...prev, student._id];
    });
  };
  const handleCancelEditOne = (id: string) => {
    setEditOne((prev) => {
      if (prev === null) {
        return null;
      }
      return prev.filter((item) => item !== id);
    });
    const prevStudent = fetchedStudents?.filter(
      (student: any) => student._id === id
    )[0];

    setStudents((prev) =>
      prev.map((student: any, index: number) => {
        if (student._id === id) {
          return prevStudent;
        }
        return student;
      })
    );
  };
  const handleCanceEditAll = () => {
    setEditAll(false);
    setEditOne(null);
    fetchStudentsData();
  };
  // const handleaddFridayTestBatch = async () => {
  //     try {
  //         setLoading(true);
  //         // await addAcademicYear();
  //         await addFridayTestBatch();
  //         setSnackbar({
  //             open: true,
  //             message: "Friday batch added successfully",
  //             severity: "success",
  //         });
  //     } catch (error: any) {
  //         setSnackbar({
  //             open: true,
  //             message: error?.message || "An error occurred",
  //             severity: "error",
  //         });
  //     } finally {
  //         setLoading(false);
  //     }
  // };
  const handleregisterStudentsToSubject = async () => {
    try {
      setLoading(true);
      if (
        !selectedBatch?.isSemester &&
        !selectedBatch?.subjectIds?.includes(subjectId)
      ) {
        showAlert({
          title: "Error",
          text: "This subject was not written this week",
          severity: "error",
        });
        // setSnackbar({
        //   open: true,
        //   message: "This subject was not written this week",
        //   severity: "error",
        // });
        return;
      }
      const response = await registerStudentsToSubject({
        fridayTestBatchId: selectedBatch?._id,
        subjectId: subjectId as string,
        yearGroup: yearGroup,
      });

      fetchStudentsData();
      showAlert({
        title: "Success",
        text: response?.message || "An error occurred",
        severity: "success",
      });
      //   setSnackbar({
      //     open: true,
      //     message: response?.message || "An error occurred",
      //         severity: "success",
      //     });
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred",
        severity: "error",
      });
      // setSnackbar({
      //     open: true,
      //     message: error?.message || "An error occurred",
      //     severity: "error",
      // });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <LoadingAlert open={loading} />
      {/* <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
        // redirect="/students"
      /> */}
      {/* <ConfirmationDialog
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        message={`Are you sure you want delete ${
          selectedStudent?.firstName || "this student"
        }?`}
        title={"Delete Student"}
        handleConfirmation={() => handleDelete(selectedStudent.id || 0)}
      /> */}
      <Box>
        {/* <Button onClick={handleExcelClick}>handleExcelClick</Button> */}
        {/* <Button onClick={handleaddFridayTestBatch}>handleaddFridayTestBatch</Button> */}

        {/* <Typography variant="h5" gutterBottom mb={2} pl={3} pt={3}>
          Students
        </Typography> */}
        {/* <Divider /> */}
        <Box
          display={"flex"}
          alignItems={"center"}
          gap={1}
          mb={1}
          mt={1}
          pl={3}
        >
          <Typography variant="h6">{`${subject?.toUpperCase()}`}</Typography>
          <Typography variant="body1">
            {`${selectedBatch?.name?.toUpperCase()}`}
          </Typography>
        </Box>
        <Divider />
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          mb={2}
          mt={2}
          px={3}
        >
          <Box display={"flex"} gap={1}>
            <TextField
              name={"search"}
              fullWidth
              size="small"
              placeholder="Search student"
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {selectedBatch !== null && !loading && students.length === 0 ? (
            <Box>
              <Button
                variant="contained"
                onClick={handleregisterStudentsToSubject}
                size="small"
                style={{ marginRight: "10px" }}
              >
                Register
              </Button>
              {/* <Button
                                LinkComponent={Link}
                                href={`/teacher/${yearGroup}/${batchId}/upload-results`}
                                variant="contained"
                                size="small"
                                style={{ marginRight: "10px" }}
                            >
                                Upload results
                            </Button> */}
            </Box>
          ) : editAll ? (
            <Box>
              <Button
                variant="contained"
                disabled={students.some(
                  (student) => student?.score === ""
                  // (student) => getStudentScoreAndGrade(student, "score") === ""
                )}
                onClick={() => {
                  setEditAll(false);
                  handleSaveAll();
                }}
                size="small"
                color="success"
                sx={{ marginRight: "10px" }}
              >
                save all
              </Button>
              <Button
                variant="outlined"
                // disabled={students.some(
                //   (student) => getStudentScoreAndGrade(student, "score") === ""
                // )}
                onClick={handleCanceEditAll}
                size="small"
              >
                cancel all
              </Button>
            </Box>
          ) : (
            <Box>
              <Button
                variant="contained"
                size="small"
                style={{ marginRight: "10px" }}
                onClick={handleExcelClick}
              >
                Export data
              </Button>
              <Button
                LinkComponent={Link}
                href={`/teacher/${yearGroup}/${batchId}/upload-results`}
                variant="contained"
                size="small"
                style={{ marginRight: "10px" }}
              >
                Upload results
              </Button>
              <Button
                variant="contained"
                onClick={handleregisterStudentsToSubject}
                size="small"
                style={{ marginRight: "10px" }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                onClick={() => setEditAll(true)}
                size="small"
              >
                edit all
              </Button>
            </Box>
          )}
        </Box>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="students table"
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>
                    S/N{" "}
                    <Tooltip
                      title={`Sort in ${sortAsc ? "descending" : "ascending"}`}
                    >
                      <ArrowUpwardIcon
                        sx={{
                          cursor: "pointer",
                          fontSize: "12px",
                          marginLeft: "5px",
                          transition: "all 0.3s ease",
                          transform: sortAsc
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                        onClick={handleSortByIDAsc}
                      />
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Phone</StyledTableCell>
                  <StyledTableCell>Class</StyledTableCell>
                  {/* <StyledTableCell>Marks</StyledTableCell> */}
                  {selectedBatch?.isSemester === true ? (
                    <>
                      <StyledTableCell>Class Score</StyledTableCell>
                      <StyledTableCell>Exam Score</StyledTableCell>
                      <StyledTableCell>Total Score</StyledTableCell>
                    </>
                  ) : (
                    <StyledTableCell>Marks</StyledTableCell>
                  )}
                  <StyledTableCell>Grade</StyledTableCell>
                  <StyledTableCell>Remarks</StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 &&
                  students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student: any, index: number) => (
                      <StyledTableRow
                        key={student?._id}

                      // sx={{ cursor: "pointer" }}
                      >
                        <StyledTableCell>
                          {student?.student?.studentId?.split("/")[1]}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.student?.name?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {student?.student?.parentPhoneNumber}
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${student?.student?.class?.form} ${student?.student?.class?.name}`?.toUpperCase()}
                        </StyledTableCell>
                        {selectedBatch?.isSemester === true && (
                          <StyledTableCell>
                            <InputBase
                              type="number"
                              value={student?.classScore}
                              disabled={
                                !editAll && !editOne?.includes(student?._id)
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                handleAddIsSemesterScore(
                                  value,
                                  "classScore",
                                  student?._id,
                                  index
                                );
                              }}
                              inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                maxLength: 3,
                                style: { textAlign: "center" },
                              }}
                              style={{
                                width: "50px",
                                border:
                                  editAll || editOne?.includes(student?._id)
                                    ? "1px solid #0100a3"
                                    : "none",
                                transition: "all 0.7s ease",
                              }}
                            />
                          </StyledTableCell>
                        )}
                        <StyledTableCell>
                          <InputBase
                            type="number"
                            value={student?.marks}
                            disabled={
                              !editAll && !editOne?.includes(student?._id)
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (selectedBatch?.isSemester === true) {
                                handleAddIsSemesterScore(
                                  value,
                                  "marks",
                                  student?._id,
                                  index
                                );
                              } else {
                                handleSubmitScore(value, student?._id, index);
                              }
                            }}
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                              maxLength: 3,
                              style: { textAlign: "center" },
                            }}
                            style={{
                              width: "50px",
                              border:
                                editAll || editOne?.includes(student?._id)
                                  ? "1px solid #0100a3"
                                  : "none",
                              transition: "all 0.7s ease",
                            }}
                          />
                        </StyledTableCell>
                        {selectedBatch?.isSemester === true && (
                          <StyledTableCell align="center">
                            {student?.totalScore}
                          </StyledTableCell>
                        )}
                        <StyledTableCell>{student?.grade}</StyledTableCell>
                        <StyledTableCell>{student?.remarks}</StyledTableCell>
                        <StyledTableCell align="center">
                          {editAll ? (
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              disabled={
                                student?.marks === "" || student?.marks === null
                              }
                              onClick={() => handleSaveOne(student)}
                            >
                              save
                            </Button>
                          ) : editOne?.includes(student?._id) ? (
                            <Box
                              display={"flex"}
                              gap={1}
                              alignItems={"center"}
                              justifyContent={"center"}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                disabled={
                                  student?.marks === "" ||
                                  student?.marks === null
                                }
                                onClick={() => handleSaveOne(student)}
                              >
                                save
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={
                                  student?.marks === "" ||
                                  student?.marks === null
                                }
                                onClick={() =>
                                  handleCancelEditOne(student?._id)
                                }
                              >
                                cancel
                              </Button>
                            </Box>
                          ) : (
                            <Button
                              onClick={() => handleEditOne(student, index)}
                            >
                              edit
                            </Button>
                          )}
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
