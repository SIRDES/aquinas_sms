"use client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
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
  Select,
  FormControl,
  styled,
  tableCellClasses,
  useTheme,
  Chip,
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

import ProgressAlert from "@/components/ProgressAlert";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import { SnackbarType, SubjectType } from "@/types/commonTypes";
import Link from "next/link";
import {
  Document,
  pdf,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import { useBatchesContext } from "@/context/BatchesContext";

import { formatPhoneNumberIntl } from "react-phone-number-input";
import Tooltip from "@mui/material/Tooltip";

import EditIcon from "@mui/icons-material/Edit";
import BookIcon from "@mui/icons-material/Book";
import { useReactToPrint } from "react-to-print";
import Image from "next/image";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ActionStatusAlert from "@/components/ActionStatusAlert";
import axios from "axios";
import {
  getStudentsTestScoreForABatch,
  updateStudentMarks,
} from "@/utils/serverActions/fridayTestScore";
import { sendSms } from "@/utils/services/sms";
import { getPaymentsByBatchIdAndStudentId } from "@/utils/serverActions/paymentTransaction";
import StudentReportCard from "@/components/StudentReportCard";
import { showAlert } from "@/components/Alerts";
import PermissionGuard from "@/components/PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";
import { getAllFridayTestBatch, getAllFridayTestBatchForSpecficYearGroup } from "@/utils/serverActions/fridayTestBatch";
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
    padding: "4px 4px",
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



export default function Page({
  params,
}: {
  params: Promise<{ id: string; }>;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { id } = use(params);
  // const { fetchedBatches } = useBatchesContext();
  const [fetchedBatches, setFetchedBatches] = useState<any>([]);
  const [selectedBatchExams, setSelectedExams] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>({});
  const [openConfirmSendSMS, setOpenConfirmSendSMS] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openNotifyParent, setOpenNotifyParent] = useState(false);
  const [openConfirmNotify, setOpenConfirmNotify] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [coreSubjects, setCoreSubjects] = useState<Array<any>>([]);
  const [electiveSubjects, setElectiveSubjects] = useState<Array<any>>([]);
  const [editResult, setEditResult] = useState<{
    show: boolean;
    subject: SubjectType | null;
  }>({ show: false, subject: null });
  const [actionStatus, setActionStatus] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [testScores, setTestScores] = useState<Array<any>>([]);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const fetchStudentsData = async () => {
    setLoading(true);
    setStudentData({});
    setCoreSubjects([]);
    setElectiveSubjects([]);
    try {
      const res = await axios.get(`/api/students/${id}`);
      console.log("api/students res", res.data);
      if (!res?.data?.data) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.data?.message || "An error occurred, please try again",
        });
      }

      setStudentData(res?.data?.data);

      setCoreSubjects([]);
      setElectiveSubjects([]);
    } catch (error: any) {
      // console.log("error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };
  const checkStudentPayments = async () => {
    setPaymentToken(null);
    try {
      const response = await getPaymentsByBatchIdAndStudentId({
        batchId: selectedBatchExams?._id,
        studentId: id,
      });
      if (response.success) {
        const payment = response.data?.find(
          (p: any) => p.status?.toLowerCase() === "success",
        )?._id;
        // console.log("payment", payment)
        if (payment) {
          setPaymentToken(payment);
        }
      }
    } catch (error: any) {
      console.log("error", error);
    }
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await getAllFridayTestBatchForSpecficYearGroup({ getIsSuspended: true, yearGroup: studentData?.yearGroup });
      if (!response?.data) return;

      setFetchedBatches(response?.data || []);
    } catch (error: any) {
      showAlert({ title: "Error", text: error.message || error.data || "An error occurred", severity: "error" })
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentData?.yearGroup) {
      fetchBatches();
    }
  }, [studentData?.yearGroup]);

  const getTestScores = async () => {
    try {
      const res = await getStudentsTestScoreForABatch({
        batchId: selectedBatchExams?._id,
        studentId: id,
      });
      if (!res?.data) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.message || "An error occurred, please try again",
        });
      }
      setTestScores(res?.data || []);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });
    }
  };
  useEffect(() => {
    setCoreSubjects([]);
    setElectiveSubjects([]);
    if (selectedBatchExams === undefined) return;
    fetchStudentsData();
    // checkToShowSMSButton();
  }, [selectedBatchExams, id]);

  useEffect(() => {
    setCoreSubjects([]);
    setElectiveSubjects([]);
    if (selectedBatchExams === undefined) return;
    getTestScores();
    checkStudentPayments();
  }, [selectedBatchExams, id]);

  const handleActionBtnClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionAnchorEl(event.currentTarget);
  };
  const handleActionClose = () => {
    setActionAnchorEl(null);
  };

  const handleSendSMS = async () => {
    setOpenConfirmSendSMS(false);
    setActionStatus({ open: true, message: "Sending..." });
    try {
      let message = `${selectedBatchExams?.name} results for `;
      const studentName = `${studentData?.firstName ? studentData?.firstName.toUpperCase() : ""
        } ${studentData?.lastName ? studentData?.lastName.toUpperCase() : ""}`;

      message += `${studentName}\n`;
      message += "Subject. I  Marks  I  Grade\n";
      for (const subject of testScores.sort((a: any, b: any) => {
        return a?.name?.localeCompare(b?.name);
      })) {
        message += `${subject?.subject?.name.toUpperCase()}  I  ${selectedBatchExams?.isSemester ? subject.totalScore : subject.marks
          }  I  ${subject.grade.toUpperCase()}\n`;
      }

      if (selectedBatchExams?.isSemester && paymentToken) {
        message += `Visit: ${process.env.NEXT_PUBLIC_STUDENT_REPORT_URL}?token=${paymentToken} for more details`;
      }

      await sendSms({
        message: message,
        recipients: [studentData?.parentPhoneNumber],
      });

      // await fetchStudentsData();
      showAlert({
        title: "Success",
        severity: "success",
        text: "Results sent successfully",
      });
    } catch (error: any) {
      // console.log("sms error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });
    } finally {
      setActionStatus({ open: false, message: "" });
    }
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
    value: string | number,
  ) => {
    if (detail === "grade" || detail === "remarks") {
      student[detail] = String(value);
    } else {
      student[detail] = +value;
    }
  };
  const handleAddIsSemesterScore = (
    value: number | string,
    type: string,
    studentId: string,
    index: number,
  ) => {
    const classMaxMarks = selectedBatchExams?.isNewCurriculum ? 60 : 30;
    const marksMaxMarks = selectedBatchExams?.isNewCurriculum ? 40 : 70;
    if (type === "classScore" && (+value < 0 || +value > classMaxMarks)) {
      // alert("Score should be between 0 - 100");
      showAlert({
        title: "Error",
        severity: "error",
        text: `Invalid score. Score should be between 0 - ${classMaxMarks}`,
      });
      // setSnackbar({
      //   open: true,
      //   message: `Invalid score. Score should be between 0 - ${classMaxMarks}`,
      //   severity: "error",
      // });
      return;
    }

    if (type === "marks" && (+value < 0 || +value > marksMaxMarks)) {
      // alert("Score should be between 0 - 100");
      showAlert({
        title: "Error",
        severity: "error",
        text: `Invalid score. Score should be between 0 - ${marksMaxMarks}`,
      });
      // setSnackbar({
      //   open: true,
      //   message: `Invalid score. Score should be between 0 - ${marksMaxMarks}`,
      //   severity: "error",
      // });
      return;
    }

    const newStudents = [...testScores];
    newStudents.forEach((student: any) => {
      if (student._id === studentId) {
        if (type === "classScore") {
          if (value === "") {
            student.classScore = value;
            return;
          }
          student.classScore = Number(value);
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
    setTestScores(newStudents);
  };
  const handleSubmitScore = (value: string, id: string, index: number) => {
    const roundedValue = Math.round(Number(value));
    if (+value < 0 || +value > 100) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "Invalid score. Score should be between 0 - 100",
      });
      return;
    }
    const newStudents = [...testScores];
    if (value === "") {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "ic",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "incomplete",
      );
    } else if (roundedValue >= 80 && roundedValue <= 100) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "A1",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Excellent",
      );
    } else if (roundedValue >= 70 && roundedValue <= 79) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "B2",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Very Good",
      );
    } else if (roundedValue >= 60 && roundedValue <= 69) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "B3",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Good",
      );
    } else if (roundedValue >= 55 && roundedValue <= 59) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "C4",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Credit",
      );
    } else if (roundedValue >= 50 && roundedValue <= 54) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "C5",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Credit",
      );
    } else if (roundedValue >= 45 && roundedValue <= 49) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "C6",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Credit",
      );
    } else if (roundedValue >= 40 && roundedValue <= 44) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "D7",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Pass",
      );
    } else if (roundedValue >= 35 && roundedValue <= 39) {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "E8",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Pass",
      );
    } else {
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        selectedBatchExams?.isSemester ? "totalScore" : "marks",
        +value,
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "grade",
        "F9",
      );
      setStudentScoreAndGrade(
        newStudents?.find((student: any) => student._id === id),
        "remarks",
        "Fail",
      );
    }
    // setStudents(newStudents);

    setTestScores(newStudents);
  };

  const saveScore = async (student: any) => {
    return await updateStudentMarks({ student });
  };

  const handleSaveOne = async (student: any) => {
    setLoading(true);
    try {
      await saveScore(student);

      setEditResult({
        show: false,
        subject: null,
      });
      await fetchStudentsData();
      showAlert({
        title: "Success",
        severity: "success",
        text: "Student's marks has been recorded successfully",
      });
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

  const handleSaveAsWithPrint = async () => {
    const blob = await pdf(
      <StudentReportCard
        data={{
          studentInfo: studentData,
          testScores,
          programmeDetails: studentData?.classInfo?.programmeInfo,
          classDetails: studentData?.classInfo,
          batchInfo: selectedBatchExams,
          academicYearDetails: selectedBatchExams?.academicYearDetails,
        }}
      />,
    ).toBlob();
    saveAs(
      blob,
      `${studentData?.firstName?.toUpperCase()} ${studentData?.lastName?.toUpperCase()}_report.pdf`,
    );
  };

  const handleDelete = async () => {
    try {
      setOpenConfirmDelete(false);

      setLoading(true);

      const res = await axios.delete(`/api/students/${id}`);

      showAlert({
        title: "Success",
        text: "Student deleted successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.back();
        },
      });
    } catch (error: any) {
      console.log(error);
      showAlert({
        title: "Error",
        text: error.message || "Something went wrong",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSendResultsReadyNotification = async () => {
    try {
      setActionStatus({ open: true, message: "Sending notification..." });

      await sendSms({
        message: notificationMessage,
        recipients: [studentData?.parentPhoneNumber],
      });

      // console.log("notificationMessage", res);

      showAlert({
        title: "Success",
        text: "SMS sent successfully",
        severity: "success",
      });
    } catch (error: any) {
      console.log("sms error", error);
      showAlert({
        title: "Error",
        text: error.message || "Something went wrong",
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
      <ConfirmationDialog
        open={openConfirmSendSMS}
        setOpen={setOpenConfirmSendSMS}
        message="Are you sure you want to send the students results via SMS?"
        title="Send Results via SMS"
        handleConfirmation={handleSendSMS}
      />
      <ConfirmationDialog
        open={openConfirmNotify}
        setOpen={setOpenConfirmNotify}
        message="Are you sure you want to send this notification to the parent?"
        title="Send Notification"
        handleConfirmation={handleSubmitSendResultsReadyNotification}
      />
      <ConfirmationDialog
        open={openConfirmDelete}
        setOpen={setOpenConfirmDelete}
        message="Are you sure you want to delete this student? This action cannot be undone."
        title="Delete Student"
        handleConfirmation={handleDelete}
      />
      <Box mb={10}>
        <Box
          display="flex"
          justifyContent="space-between"
          mb={1}
          mt={1}
          px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Typography
            variant="h6"
          // gutterBottom
          >
            <Link
              href={""}
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              style={{ textDecoration: "none", color: "#2C7873" }}
            >
              Completed Students
            </Link>{" "}
            / student details
          </Typography>
          {/* <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_UPDATE}>
            {Object.keys(studentData).length !== 0 && (
              <Button
                component={Link}
                href={`/students/completed/${id}/edit-student`}
                size="small"
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            )}
          </PermissionGuard> */}
        </Box>
        <Divider />
        <Box
          sx={{
            px: { xs: 1, sm: 2, md: 4 },
            mb: 2,
            mt: 3,
          }}
        >
          {Object.keys(studentData).length !== 0 && (
            <>
              <Grid container spacing={2}>
                {/* student id */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">ID:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.studentId?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">CassRefID:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.cassRefID}
                  </Typography>
                </Grid>

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

                {/* Gender */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Gender:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.gender?.toUpperCase()}
                  </Typography>
                </Grid>
                {/* On scholarship */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Class</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.classInfo?.name?.toUpperCase()}
                  </Typography>
                </Grid>

                {/* Programme */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Programme:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.classInfo?.programmeInfo?.name?.toUpperCase()}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Year of admission:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.yearOfAdmission}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Year of completion:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.yearGroup}
                  </Typography>
                </Grid>


                <Grid item xs={12}>
                  <Typography variant="body1" fontWeight={700}>
                    Parent/Guardian Details
                  </Typography>
                </Grid>
                {/* parent's name */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.parentFirstName?.toUpperCase()}{" "}
                    {studentData?.parentLastName?.toUpperCase()}
                  </Typography>
                </Grid>

                {/* Email */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{ display: "flex", gap: "10px" }}
                >
                  <Typography variant="body1">Email:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.parentEmail?.toLowerCase()}
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
                    {formatPhoneNumberIntl(
                      studentData?.parentPhoneNumber || "",
                    )}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight={700}>
                  Subjects
                </Typography>
              </Grid>
              {/* subjects */}
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: 1 }}>
                  {studentData?.subjectInfo && studentData.subjectInfo.length > 0 ? (
                    studentData.subjectInfo.map((subject: any) => (
                      <Chip
                        key={subject?._id || subject?.name}
                        // icon={<BookIcon sx={{ fontSize: "0.9rem !important" }} />}
                        label={subject?.name?.toUpperCase()}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: "16px",
                          // fontWeight: 600,
                          // fontSize: "0.75rem",
                          px: 0.5,
                          py: 1.5,
                          // color: "primary.main",
                          borderColor: "primary.light",
                          // backgroundColor: "rgba(44, 120, 115, 0.04)",
                          // transition: "all 0.2s ease",
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      No subjects assigned
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                mt={2}
                mb={2}
                alignItems={"flex-end"}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {/* <Typography variant="body1" fontWeight={700}>
                    Results for
                  </Typography> */}


                  <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_VIEW_EXAMS_REPORTS}>
                    <FormControl size="small" sx={{ minWidth: 400 }}>
                      <Select
                        displayEmpty
                        value={selectedBatchExams?._id || ""}
                        onChange={(e) => {
                          const batchId = e.target.value;
                          const batch = fetchedBatches.find((b: any) => b._id === batchId);
                          setSelectedExams(batch || null);
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select exams</em>
                        </MenuItem>
                        {fetchedBatches
                          ?.filter(
                            (batch: any) =>
                              batch?.yearGroup === studentData?.yearGroup
                          )
                          .map((batch: any) => (
                            <MenuItem key={batch._id} value={batch._id}>
                              {batch.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </PermissionGuard>
                </Box>
                <Box display={"flex"} gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleActionBtnClick}
                  >
                    Action
                  </Button>
                  <Menu
                    id="menu-action"
                    anchorEl={actionAnchorEl}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(actionAnchorEl)}
                    onClose={handleActionClose}
                  >
                    <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_EXAMS_REPORT_DOWNLOAD}>
                      <MenuItem
                        sx={{ fontSize: "12px" }}
                        onClick={() => {
                          // console.log("smsData in table", smsData);
                          handleActionClose();
                          if (testScores.length === 0) {
                            showAlert({
                              title: "Error",
                              text: "No exams results found",
                              severity: "error",
                            });
                            return;
                          }
                          handleSaveAsWithPrint();
                        }}
                      >
                        Download results (PDF)
                      </MenuItem>
                    </PermissionGuard>
                    {/* <PermissionGuard requiredPermission={USER_PERMISSIONS.ATTENDANCE_VIEW_STUDENT_ATTENDANCE_RECORDS}>
                      <MenuItem
                        sx={{ fontSize: "12px" }}
                        component={Link}
                        href={`/attendance/${studentData?._id}`}
                      >
                        View attendance
                      </MenuItem>
                    </PermissionGuard> */}


                    {/* <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_EXAMS_REPORT_SEND_TO_PARENT}>
                      <MenuItem
                        sx={{ fontSize: "12px" }}
                        onClick={() => {
                          handleActionClose();
                          if (testScores.length === 0) {
                            showAlert({
                              title: "Error",
                              text: "No exams results found",
                              severity: "error",
                            });
                            return;
                          }
                          if (
                            !studentData?.parentPhoneNumber ||
                            studentData?.parentPhoneNumber === ""
                          ) {
                            showAlert({
                              text: "Parent phone number is required",
                              title: "Error",
                              severity: "error",
                            });
                            return;
                          }
                          setOpenConfirmSendSMS(true);
                        }}
                      >
                        Send results (SMS)
                      </MenuItem>
                    </PermissionGuard> */}

                    {/* <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_EXAMS_REPORT_NOTIFY_PARENT}>
                      <MenuItem
                        sx={{ fontSize: "12px" }}
                        onClick={() => {
                          handleActionClose();
                          if (
                            !studentData?.parentPhoneNumber ||
                            studentData?.parentPhoneNumber === ""
                          ) {
                            showAlert({
                              text: "Parent phone number is required",
                              title: "Error",
                              severity: "error",
                            });
                            return;
                          }
                          setOpenNotifyParent(true);
                          const studentName = `${studentData?.firstName || ""} ${studentData?.lastName || ""
                            }`;
                          const batchName =
                            fetchedBatches
                              .find(
                                (batch: any) =>
                                  batch?.yearGroup === studentData?.yearGroup,
                              )
                              ?.name?.trim()
                              ?.toUpperCase() || "";

                          const studentId =
                            studentData?.studentId?.trim()?.toUpperCase() || "";
                          setNotificationMessage(
                            `Dear Parent, Your ward, ${studentName
                              ?.trim()
                              ?.toUpperCase()}, ${batchName} results is ready. You can optionally visit https://portal.staquinasshs.org/check-result, enter Student Number: ${studentId} and pay GHS 10 to access it. NB: A PDF download link will be provided. Thank you.`,
                          );
                        }}
                      >
                        Notify Parent - Results Ready
                      </MenuItem>
                    </PermissionGuard> */}
                    {/* <PermissionGuard requiredPermission={USER_PERMISSIONS.STUDENT_DELETE}>
                      <MenuItem
                        sx={{ fontSize: "12px", color: "error.main" }}
                        onClick={() => {
                          handleActionClose();
                          setOpenConfirmDelete(true);
                        }}
                      >
                        Delete Student
                      </MenuItem>
                    </PermissionGuard> */}
                  </Menu>
                </Box>
              </Box>
              <Paper
                sx={{ width: { md: "65%", xs: "100%" }, overflow: "hidden" }}
              >
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table aria-label="results table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>SUBJECT</StyledTableCell>

                        {selectedBatchExams?.isSemester === true ? (
                          <>
                            <StyledTableCell>CLASS SCORE</StyledTableCell>
                            <StyledTableCell>EXAM SCORE</StyledTableCell>
                            <StyledTableCell>TOTAL</StyledTableCell>
                          </>
                        ) : (
                          <StyledTableCell>SCORE</StyledTableCell>
                        )}
                        <StyledTableCell align="center">GRADE</StyledTableCell>
                        <StyledTableCell align="center">
                          REMARKS
                        </StyledTableCell>
                        {/* <StyledTableCell align="center"></StyledTableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testScores.length !== 0 &&
                        testScores.map((subject: any, index: number) => (
                          <StyledTableRow key={subject?._id}>
                            <StyledTableCell>
                              {subject?.subject?.name?.toUpperCase()}
                            </StyledTableCell>

                            {/* <StyledTableCell align="center">
                              {subject?.score}
                            </StyledTableCell> */}
                            {selectedBatchExams?.isSemester === true && (
                              <StyledTableCell>
                                <InputBase
                                  type="number"
                                  value={subject?.classScore}
                                  disabled={
                                    editResult.show &&
                                    editResult?.subject?.name !== subject?.name
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleAddIsSemesterScore(
                                      value,
                                      "classScore",
                                      subject?._id,
                                      index,
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
                                    // paddingLeft: "10px",
                                    border:
                                      editResult.show &&
                                        editResult?.subject?.name ===
                                        subject?.name
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
                                value={subject?.marks}
                                // value={getStudentScoreAndGrade(student, "score")}
                                disabled={
                                  editResult.show &&
                                  editResult?.subject?.name !== subject?.name
                                }
                                // onChange={(e: any) => {
                                //   const value = e.target.value;
                                //   handleSubmitScore(value, subject?._id, index);
                                // }}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (selectedBatchExams?.isSemester === true) {
                                    handleAddIsSemesterScore(
                                      value,
                                      "marks",
                                      subject?._id,
                                      index,
                                    );
                                  } else {
                                    handleSubmitScore(
                                      value,
                                      subject?._id,
                                      index,
                                    );
                                  }
                                }}
                                inputProps={{
                                  inputMode: "numeric",
                                  pattern: "[0-9]*",
                                  maxLength: 3,
                                  style: { textAlign: "center" },
                                }}
                                // placeholder="Enter score"
                                style={{
                                  width: "50px",
                                  // paddingLeft: "10px",
                                  border:
                                    editResult.show &&
                                      editResult?.subject?.name === subject?.name
                                      ? "1px solid #0100a3"
                                      : "none",
                                  transition: "all 0.7s ease",
                                }}
                              />
                            </StyledTableCell>
                            {selectedBatchExams?.isSemester === true && (
                              <StyledTableCell align="center">
                                {subject?.totalScore}
                              </StyledTableCell>
                            )}
                            <StyledTableCell align="center">
                              {subject?.grade?.toUpperCase()}
                            </StyledTableCell>
                            <StyledTableCell>
                              {subject?.remarks?.toUpperCase()}
                            </StyledTableCell>
                            {/* <StyledTableCell>
                              {editResult.show &&
                                editResult?.subject?.name === subject?.name ? (
                                <>
                                  <Tooltip title="save score">
                                    <IconButton
                                      disabled={
                                        subject?.marks === "" ||
                                        subject?.marks === null
                                      }
                                      onClick={() => handleSaveOne(subject)}
                                    >
                                      <SaveIcon sx={{ fontSize: "16px" }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="cancel">
                                    <IconButton
                                      onClick={() =>
                                        setEditResult({
                                          show: false,
                                          subject: null,
                                        })
                                      }
                                    >
                                      <ClearIcon sx={{ fontSize: "16px" }} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip title="edit score">
                                  <IconButton
                                    onClick={() =>
                                      setEditResult({
                                        show: true,
                                        subject: subject,
                                      })
                                    }
                                  >
                                    <EditIcon sx={{ fontSize: "16px" }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </StyledTableCell> */}
                          </StyledTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Box>
      </Box>
      {/* Notify Parent Modal */}
      <Dialog
        open={openNotifyParent}
        onClose={() => setOpenNotifyParent(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notify Parent - Results Ready</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="notification-message"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotifyParent(false)}>Cancel</Button>
          <Button
            disabled={!notificationMessage}
            onClick={() => {
              setOpenNotifyParent(false);
              setOpenConfirmNotify(true);
            }}
            color="primary"
            variant="contained"
          >
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Notification Dialog */}
      <Dialog
        open={openConfirmNotify}
        onClose={() => setOpenConfirmNotify(false)}
      >
        <DialogTitle>Confirm Send Notification</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send this notification to the parent?
          </Typography>
          <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="body2" whiteSpace="pre-line">
              {notificationMessage}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmNotify(false)}>Cancel</Button>
          <Button
            disabled={!notificationMessage}
            onClick={() => {
              setOpenConfirmNotify(false);
              handleSubmitSendResultsReadyNotification();
            }}
            color="primary"
            variant="contained"
          >
            Confirm Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
