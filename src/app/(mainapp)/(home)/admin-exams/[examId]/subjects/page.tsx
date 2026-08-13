"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useBatchesContext } from "@/context/BatchesContext";
import { getAllNewCurriculumSubjects, getAllSubjects } from "@/utils/serverActions/subject";
import { showAlert } from "@/components/Alerts";
import { getAllFridayTestScoreForABatch } from "@/utils/serverActions/fridayTestScore";
import ActionStatusAlert from "@/components/ActionStatusAlert";
import PermissionGuard, { useHasPermission } from "@/components/PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";

export default function AdminExamsSubjects({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const theme = useTheme();
  const router = useRouter();
  // const { data: session } = useSession();
  const { examId } = use(params);
  const { fetchedBatches } = useBatchesContext();
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [fetchedSubjects, setFetchedSubjects] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [actionStatus, setActionStatus] = useState({
    open: false,
    message: "",
  });

  const canViewDetails = useHasPermission(USER_PERMISSIONS.EXAMS_UPLOAD_SCORE);


  useEffect(() => {
    // console.log("examId", examId);
    if (!examId) {
      setSelectedExam(null);
      return;
    }
    const exam = fetchedBatches.find((exam: any) => exam._id === examId);
    // console.log("selectedExams>>>>>>>>>", exam);
    setSelectedExam(exam);
  }, [examId, fetchedBatches]);

  const handleSearch = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedSubjects.filter((student: any) =>
      student?.name?.toLowerCase().includes(value.toLowerCase())
    );
    setSubjects(filteredStudents);
  };
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      let response: any
      if (selectedExam.isNewCurriculum) {
        response = await getAllNewCurriculumSubjects();
      } else {
        response = await getAllSubjects();
      }
      if (response.status === "error") {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Failed to fetch subjects",
        });
        return;
      }
      if (selectedExam?.subjectIds?.length > 0) {
        const subjectData = response.data?.filter((subject: any) =>
          selectedExam?.subjectIds?.includes(subject._id)
        );
        setSubjects(subjectData || []);
        setFetchedSubjects(subjectData || []);
        return;
      }
      const subjectData = response.data?.filter(
        (subject: any) =>
          subject?.isNewCurriculum === selectedExam?.isNewCurriculum
      );
      setSubjects(subjectData || []);
      setFetchedSubjects(subjectData || []);
    } catch (error: any) {
      // console.error("Error fetching subjects:", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: "Failed to fetch subjects",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExam === null) return;
    fetchSubjects();
  }, [selectedExam]);

  const exportToExcel = (scores: any[]) => {
    try {
      // Group scores by subject
      const scoresBySubject: Record<string, any[]> = {};

      scores.forEach((score) => {
        const subjectId = score.subject._id;
        if (!scoresBySubject[subjectId]) {
          scoresBySubject[subjectId] = [];
        }
        scoresBySubject[subjectId].push(score);
      });

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Create a worksheet for each subject
      Object.entries(scoresBySubject).forEach(([subjectId, subjectScores]) => {
        if (subjectScores.length === 0) return;

        // Get subject name for the sheet name (clean and truncate if necessary)
        let cleanSheetName = subjectScores[0].subject.name
          .replace(/[\/\?\*\[\]:]/g, "")
          .substring(0, 30); // Reduced by 1 to leave room for number
        if (cleanSheetName?.toLowerCase() === "history") {
          cleanSheetName = "Hist";
        }

        // Format data for the worksheet
        const worksheetData = subjectScores.map((score) => ({
          "Student ID": score.student.studentId,
          "Student Name": score.student.name.trim(),
          Class: score.student.class.name,
          "Class Score": score.classScore,
          Marks: score.marks,
          "Total Score": score.totalScore,
          Grade: score.grade,
          Remarks: score.remarks,
        }));

        // Create worksheet and add to workbook
        const ws = XLSX.utils.json_to_sheet(worksheetData);

        // Auto-size columns
        const columnWidths = [
          { wch: 15 }, // Student ID
          { wch: 30 }, // Student Name
          { wch: 15 }, // Class
          { wch: 12 }, // Class Score
          { wch: 10 }, // Marks
          { wch: 12 }, // Total Score
          { wch: 10 }, // Grade
          { wch: 20 }, // Remarks
        ];
        ws["!cols"] = columnWidths;

        // Add the worksheet to the workbook with the final unique name
        XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
      });

      // Generate the Excel file
      const fileName = `${selectedExam?.name?.toLowerCase()}_test_scores.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: "Failed to export to Excel. Please try again.",
      });
    }
  };

  const fetchTestScores = async () => {
    // setLoading(true);
    try {
      if (subjects.length === 0) {
        showAlert({
          title: "Error",
          severity: "error",
          text: "No subjects found",
        });
        return;
      }
      setActionStatus({ open: true, message: "Fetching scores..." });

      const response = await getAllFridayTestScoreForABatch({
        fridayTestBatchId: examId,
      });
      if (response.status === "error") {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Failed to fetch scores",
        });
        return;
      }
      // console.log("getAllFridayTestScoreForABatch>>>>>>>", response.data);
      const scoresData = response.data;

      // Export to Excel after fetching
      if (scoresData && scoresData.length > 0) {
        setActionStatus({ open: true, message: "Generating file..." });
        exportToExcel(scoresData);
      }
    } catch (error: any) {
      console.error("Error fetching scores:", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: "Failed to fetch scores",
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
        {/* <Button onClick={handleAddSubjectToStudents}>handleAddSubjectToStudents</Button> */}
        <Typography variant="h6" gutterBottom mb={1} mt={1} pl={3}>
          {selectedExam?.name?.toUpperCase()}
        </Typography>
        <Divider />
        <Box
          display={"flex"}
          gap={1}
          alignItems={"center"}
          justifyContent={"space-between"}
          mb={2}
          mt={2}
          px={3}
        >
          <TextField
            name={"search"}
            // fullWidth
            sx={{ width: "300px" }}
            size="small"
            placeholder="Search subject"
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <PermissionGuard requiredPermission={USER_PERMISSIONS.EXAMS_VIEW_ALL}>

            <Button
              sx={{ width: "150px" }}
              variant="contained"
              disabled={loading || subjects?.length === 0}
              onClick={fetchTestScores}
            >
              Export all scores
            </Button>
          </PermissionGuard>
        </Box>
        {/* </Box> */}
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <Grid container spacing={2} mb={2}>
            {subjects?.map((subject: any) => (
              <Grid item xs={12} sm={6} md={4} key={subject._id}>
                <Card
                  sx={{
                    padding: 2,
                    backgroundColor: theme.palette.background.paper,
                    cursor: canViewDetails ? "pointer" : "default",
                    height: "100%",
                  }}
                  onClick={() => {
                    if (!canViewDetails) return;
                    router.push(
                      `/admin-exams/${examId}/subjects/${subject?.name}/${subject?._id}/${selectedExam?.yearGroup}`
                    );
                  }}
                >
                  <Typography variant="body1" gutterBottom>
                    {subject?.name?.toUpperCase()}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {subject?.type?.toUpperCase()}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
