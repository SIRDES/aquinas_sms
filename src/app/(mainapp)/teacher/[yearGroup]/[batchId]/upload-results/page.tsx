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
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, array, boolean, number, object, string } from "yup";

import { useForm } from "react-hook-form";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { useRouter } from "next/navigation";
import { SnackbarType } from "@/types/commonTypes";
import { CustomizedSelect } from "@/components/CustomizedSelect";

import { useBatchesContext } from "@/context/BatchesContext";
// import { DevTool } from "@hookform/devtools";
import "react-phone-number-input/style.css";


import {
  updateMultipleStudentMarksWithSSID,
} from "@/utils/serverActions/fridayTestScore";
import { useSession } from "next-auth/react";
import UploadResultsCSV from "@/components/UploadResultsCSV";
import { getRemarksAndGrade } from "@/utils/services/utils";
import { showAlert } from "@/components/Alerts";

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

export default function UploadResults({
  params,
}: {
  params: Promise<{ yearGroup: string; batchId: string }>;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { yearGroup, batchId } = use(params);
  const [rowsToAdd, setRowsToAdd] = useState<Array<any>>([]);
  const [isProcessingRows, setIsProcessingRows] = useState(false);
  const { batches, fetchedBatches } = useBatchesContext();
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState<string>();
  const [subjectType, setSubjectType] = useState<string>();
  const [subjectId, setSubjectId] = useState<string>();
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });

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
  const handleSaveScores = async () => {
    setLoading(true);
    try {
      const studentsMarks = rowsToAdd.map((student: any) => {
        return {
          subjectId: subjectId as string,
          batchId: batchId as string,
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
    setLoading(true);
    try {
      const studentsMarks = rowsToAdd.map((student: any) => {
        return {
          subjectId: subjectId as string,
          batchId: batchId as string,
          // ssId: student?.["Index Number"] as string,
          ssId: student?.["Admission Number"] as string,
          classScore: student?.["Class (60%)"] || 0,
          projectWork: student?.["Project Score"] || 0,
          groupWork: student?.["Group Work Score"] || 0,
          totalScore: student?.["Total (100%)"] || 0,
          marks: student?.["Exams (40%)"] || 0,
          grade: getRemarksAndGrade(
            student?.["Total (100%)"] === 0 ? null : student?.["Total (100%)"]
          ).grade,
          remarks: getRemarksAndGrade(
            student?.["Total (100%)"] === 0 ? null : student?.["Total (100%)"]
          ).remarks,
        };
      });
      const result = await updateMultipleStudentMarksWithSSID({
        students: studentsMarks,
      });
      if (!result?.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Failed to save students' marks",
        });
        // setSnackbar({
        //     open: true,
        //     message: "Failed to save students' marks",
        //     severity: "error",
        // });
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
      // setSnackbar({
      //     open: true,
      //     message: "Students' marks have been recorded successfully",
      //     severity: "success",
      // });
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred",
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

  // const handleAddSubjectToStudents = async () => {
  //     setLoading(true);
  //     try {
  //         await Promise.all(
  //             rowsToAdd.map((student: any) => {
  //                 const data = {
  //                     subjectId: subjectId as string,
  //                     batchId: batchId as string,
  //                     ssId: student?.["Admission Number"] as string,
  //                     classScore: student?.["Class (30%)"] || 0,
  //                     projectWork: student?.["Project Score"] || 0,
  //                     groupWork: student?.["Group Work Score"] || 0,
  //                     totalScore: student?.["TOTAL"] || 0,
  //                     marks: student?.["Exams (70%)"] || 0,
  //                     grade: getRemarksAndGrade(student?.["TOTAL"] === 0 ? null : student?.["TOTAL"]).grade,
  //                     remarks: getRemarksAndGrade(student?.["TOTAL"] === 0 ? null : student?.["TOTAL"]).remarks,
  //                 }
  //                 // return data
  //                 return addSubjectToStudent({ studentId: data.ssId, subjectsId: [subjectId as string] });

  //             })
  //         );
  //         setSnackbar({
  //             open: true,
  //             message: "Subjects added successfully",
  //             severity: "success",
  //         });
  //     } catch (error: any) {
  //         console.log("add progrmmes error", error);
  //         setSnackbar({
  //             open: true,
  //             message: error.message || "An error occurred, please try again",
  //             severity: "error",
  //         });
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  return (
    <>
      <LoadingAlert open={loading} />
      {/* <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
        redirect={`teacher/${yearGroup}/${batchId}`}
      /> */}
      <Box display={"flex"} alignItems={"center"} gap={1} mb={1} mt={1} pl={3}>
        <Typography variant="h6">{`${subject?.toUpperCase()}`}</Typography>
        <Typography variant="body1">
          {`${selectedBatch?.name?.toUpperCase()}`}
        </Typography>
      </Box>
      <Divider />
      <Box px={{ xs: 1, sm: 2, md: 3 }} pt={{ xs: 2, sm: 3, md: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          UPLOAD STUDENTS RESULTS
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <UploadResultsCSV
              // previewModalTitle={"Add Multiple Students"}
              setRowsToAdd={setRowsToAdd}
              //   isProcessingRows={isProcessingRows}
              //   setIsProcessingRows={setIsProcessingRows}
              // handleUploadResults={handleAddSubjectToStudents}
              handleUploadResults={
                selectedBatch?.isNewCurriculum
                  ? handleSaveNewCurriculumScores
                  : handleSaveScores
              }
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
