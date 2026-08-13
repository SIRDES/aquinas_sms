"use client";
import React, { SyntheticEvent, use, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  Typography,
  useTheme,
  Button,
  MenuItem,
  TextField,
  Grid,
  Chip,
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
  Divider,
  FormControl,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, array, boolean, number, object, string } from "yup";

import { useForm } from "react-hook-form";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { useRouter } from "next/navigation";
import { AssessmentModesType, SnackbarType } from "@/types/commonTypes";
import { CustomizedSelect } from "@/components/CustomizedSelect";

import { useBatchesContext } from "@/context/BatchesContext";
// import { DevTool } from "@hookform/devtools";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import SuccessDialog from "@/components/SuccessAlert";
import {
  addProgrammes,
  getAllProgrammes,
} from "@/utils/serverActions/programme";
import { addClasses, getAllClasses } from "@/utils/serverActions/classes";
import axios from "axios";

import {
  updateMultipleStudentMarksWithCassRefID,
  updateMultipleStudentMarksWithSSID,
  // updateStudentMarks,
  // updateStudentMarksWithSSID,
} from "@/utils/serverActions/fridayTestScore";
import { useSession } from "next-auth/react";
import UploadStpResultsCSV from "@/components/UploadStpResults";
import { getRemarksAndGrade } from "@/utils/services/utils";
import { showAlert } from "@/components/Alerts";
import { assessmentModes } from "@/utils/common";

const schema = object().shape({
  classId: string().required("Class is required"),
  selectedElectiveSubjects: array<{
    _id: number;
    name: string;
    type: string;
  }>().required("Elective subjects are required"),
  coreSubjects: array<{ _id: number; name: string; type: string }>().required(
    "Core subjects are required"
  ),
});

type FormData = InferType<typeof schema>;

export default function AdminExamsUploadResults({
  params,
}: {
  params: Promise<{
    yearGroup: string;
    subjectId: string;
    examId: string;
    subjectName: string;
  }>;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { examId, yearGroup, subjectId, subjectName } = use(params);
  const decodedSubjectName = decodeURIComponent(subjectName);
  const [rowsToAdd, setRowsToAdd] = useState<Array<any>>([]);
  // const [isProcessingRows, setIsProcessingRows] = useState(false);
  const { batches, fetchedBatches } = useBatchesContext();
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState<AssessmentModesType | "">("");

  useEffect(() => {
    if (fetchedBatches?.length === 0) return;
    const batch = fetchedBatches?.filter(
      (batch: any) => batch._id === examId
    )[0];
    setSelectedBatch(batch);
  }, [fetchedBatches, examId]);
  const handleSaveScores = async () => {
    setLoading(true);
    try {
      const studentsMarks = rowsToAdd.map((student: any) => {
        return {
          subjectId: subjectId as string,
          batchId: examId as string,
          ssId: student?.["Admission Number"] as string,
          classScore: student?.["Class (30%)"] || 0,
          projectWork: student?.["Project Score"] || 0,
          groupWork: student?.["Group Work Score"] || 0,
          totalScore: student?.["TOTAL"] || 0,
          marks: student?.["Exams (70%)"] || 0,
          grade: getRemarksAndGrade(
            student?.["TOTAL"] === 0 ? null : student?.["TOTAL"]
          ).grade,
          remarks: getRemarksAndGrade(
            student?.["TOTAL"] === 0 ? null : student?.["TOTAL"]
          ).remarks,
        };
      });
      const result = await updateMultipleStudentMarksWithSSID({
        students: studentsMarks,
      });
      // return updateStudentMarksWithSSID({ student: data });

      if (!result?.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Failed to save students' marks",
        });
        return;
      }
      showAlert({
        title: "Success",
        severity: "success",
        text: "Students' marks have been recorded successfully",
        handleConfirmButtonClick: () => {
          router.back();
        },
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

  const handleSaveNewCurriculumScores = async () => {
    if (assessmentMode === "" || assessmentMode === undefined || assessmentMode === null) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "Assessment mode is required",
      });
      return;
    }
    setLoading(true);
    try {
      // console.log("rowstoadd>>>>>>>>>>>>>>", rowsToAdd)
      const studentsMarks = rowsToAdd.map((student: any) => {
        if (!student?.["CassRefID"]) {
          throw new Error("CassRefID is required");
        }

        return {
          cassRefID: student?.["CassRefID"] as string,
          assessmentScore: student?.["Score"] || 0,
          overallScore: student?.["OverallScore"] || 0,
        };
      });

      // console.log("studentsMarks>>>>>>>>>>>>>>", studentsMarks)
      const result = await updateMultipleStudentMarksWithCassRefID({
        students: studentsMarks,
        assessmentMode,
        batchId: examId as string,
        subjectId: subjectId as string,
      });

      if (!result?.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: result.message || "Failed to save students' marks",
        });

        return;
      }
      showAlert({
        title: "Success",
        severity: "success",
        text: "Students' marks have been recorded successfully",
        handleConfirmButtonClick: () => {
          router.back();
        },
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



  return (
    <>
      <LoadingAlert open={loading} />

      <Box display={"flex"} alignItems={"center"} gap={1} mb={1} mt={1} pl={3}>
        <Typography variant="h6">{`${decodedSubjectName?.toUpperCase()} - ${selectedBatch?.name?.toUpperCase()}`}</Typography>
      </Box>
      <Divider />
      <Box px={{ xs: 1, sm: 2, md: 3 }} pt={{ xs: 2, sm: 3, md: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          UPLOAD STUDENTS RESULTS FROM STP
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={6}>
            <Box>
              <Typography gutterBottom>
                Select assessment mode{" "}
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  *
                </span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={assessmentMode}
                  onChange={(e) => setAssessmentMode(e.target.value as AssessmentModesType)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value="" disabled>
                    SELECT MODE OF ASSESSMENT
                  </MenuItem>
                  {assessmentModes.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.name}
                    </MenuItem>
                  ))}

                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <UploadStpResultsCSV
              // previewModalTitle={"Add Multiple Students"}
              setRowsToAdd={setRowsToAdd}
              //   isProcessingRows={isProcessingRows}
              //   setIsProcessingRows={setIsProcessingRows}
              // handleUploadResults={handleAddSubjectToStudents}
              handleUploadResults={handleSaveNewCurriculumScores}
              isNewCurriculum={selectedBatch?.isNewCurriculum}
            />
          </Grid>
        </Grid>
        {/* Buttons */}
        <Box display="flex" gap={2} justifyContent={"flex-end"}>
          <Button
            variant="outlined"
            sx={{ width: "120px" }}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </>
  );
}
