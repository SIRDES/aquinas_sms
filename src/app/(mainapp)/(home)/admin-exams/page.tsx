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
import { useEffect, useState } from "react";
import { useBatchesContext } from "@/context/BatchesContext";
import { useSession } from "next-auth/react";
import { removeASubjectAndAddAnotherForStudentsInClass } from "@/utils/serverActions/student";

export default function AdminExams() {
  const theme = useTheme();
  const router = useRouter();
  // const { data: session } = useSession();
  const { selectedBatch, batches, setBatches, fetchedBatches } =
    useBatchesContext();
  // console.log("fetchedBatches", fetchedBatches);
  const [loading, setLoading] = useState(false);
  // const [snackbar, setSnackbar] = useState<SnackbarType>({
  //   open: false,
  //   message: "",
  //   severity: undefined,
  // });
  // const [subject, setSubject] = useState<string>();
  // const [subjectType, setSubjectType] = useState<string>();
  // const [subjectId, setSubjectId] = useState<string>();

  // useEffect(() => {
  //   if (session?.user?.subjectsDetails?.length === 0) return;
  //   const subjectType = session?.user?.subjectsDetails?.[0]?.type as string;
  //   const subjectId = session?.user?.subjectsDetails?.[0]?._id as string;
  //   const subject = session?.user?.subjectsDetails?.[0]?.name as string;
  //   // console.log("subjectType", subjectType);
  //   // console.log("subjectId", subjectId);
  //   // console.log("subject", subject);
  //   setSubject(subject);
  //   setSubjectType(subjectType);
  //   setSubjectId(subjectId);
  // }, [session]);

  const handleSearch = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedBatches.filter(
      (student: any) =>
        student?.name?.toLowerCase().includes(value.toLowerCase()) ||
        student?.examType?.toLowerCase().includes(value.toLowerCase())
    );
    setBatches(filteredStudents);
  };

  // const handleAddSubjectToStudents = async () => {
  //   setLoading(true);
  //   try {
  //     await removeASubjectAndAddAnotherForStudentsInClass({ addSubjectId: subjectId as string, classId: "67bc53ef4ee174b1681cc472", removeSubjectId: "67a7c20a65f763996851515d" });
  //     setSnackbar({
  //       open: true,
  //       message: "Subjects added successfully",
  //       severity: "success",
  //     });
  //   } catch (error: any) {
  //     console.log("add progrmmes error", error);
  //     setSnackbar({
  //       open: true,
  //       message: error.message || "An error occurred, please try again",
  //       severity: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    <>
      {/* <LoadingAlert open={loading} /> */}
      {/* <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
      /> */}
      <Box>
        {/* <Button onClick={handleAddSubjectToStudents}>handleAddSubjectToStudents</Button> */}
        {/* <Typography variant="h6" gutterBottom mb={1} mt={1} pl={3}>
          {subject?.toUpperCase()}
        </Typography>
        <Divider /> */}
        {/* <Box
          display={"flex"}
          justifyContent={"space-between"}
          mb={2}
          mt={2}
          px={3}
        > */}
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
            placeholder="Search exam"
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
        {/* </Box> */}
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <Grid container spacing={2} mb={2}>
            {batches.map((batch: any) => (
              <Grid item xs={12} sm={6} md={4} key={batch._id}>
                <Card
                  sx={{
                    padding: 2,
                    backgroundColor: theme.palette.background.paper,
                    cursor: "pointer",
                    height: "100%",
                  }}
                  onClick={() => {
                    router.push(`/admin-exams/${batch._id}/subjects`);
                  }}
                >
                  <Typography variant="body1" gutterBottom>
                    {batch?.name?.toUpperCase()}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {batch?.examType}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Form {batch?.form}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Academic year {batch?.academicYearDetails?.name}
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
