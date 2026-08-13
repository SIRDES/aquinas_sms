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
import { StudentAttendanceLogType } from "@/types/commonTypes";
import { CustomizedSelect } from "@/components/CustomizedSelect";

import { useBatchesContext } from "@/context/BatchesContext";
// import { DevTool } from "@hookform/devtools";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import { getAllNewCurriculumSubjects, getAllSubjects } from "@/utils/serverActions/subject";
import { addClasses, getAllClasses } from "@/utils/serverActions/classes";
import axios from "axios";

import { showAlert } from "@/components/Alerts";

import UploadAttendanceLogCSV from "@/components/UploadAttendanceLogCSV";
import { addMultipleStudentAttendanceLogs } from "@/utils/serverActions/studentAttendanceLog";

// const schema = object().shape({
//     classId: string().required("Class is required"),
//     yearOfAdmission: string().required("Year of admission is required"),
//     selectedElectiveSubjects: array<{
//         _id: number;
//         name: string;
//         type: string;
//     }>().required("Elective subjects are required"),
//     // coreSubjects: array<{ _id: number; name: string; type: string }>().required(
//     //     "Core subjects are required"
//     // ),
// });

// type FormData = InferType<typeof schema>;

export default function AddStudent({
    params,
}: {
    params: Promise<{ form: string }>;
}) {
    const theme = useTheme();
    const router = useRouter();
    const [rowsToAdd, setRowsToAdd] = useState<StudentAttendanceLogType[]>([]);
    // const { selectedBatch, batches, fetchedBatches } = useBatchesContext();
    const [loading, setLoading] = useState(false);

    const [classForm, setClassForm] = useState<string>("2");
    const [attendanceYear, setAttendanceYear] = useState<string>(" ");
    const [attendanceMonth, setAttendanceMonth] = useState<string>(" ");

    // const [snackbar, setSnackbar] = useState<SnackbarType>({
    //     open: false,
    //     message: "",
    //     severity: undefined,
    // });
    // const [fetchedSubjects, setFetchedSubjects] = useState<any>(null);
    // const [loadingSubjectsState, setLoadingSubjectsState] = useState<
    //     null | string
    // >();
    // const [coreSubjects, setCoreSubjects] = useState<
    //     Array<{ _id: string; name: string; type?: string }>
    // >([]);
    // const [electiveSubjects, setElectiveSubjects] = useState<
    //     Array<{ _id: string; name: string; type?: string }>
    // >([]);
    // const [selectElectivesId, setSelectedElectivesId] = useState<Array<string>>(
    //     []
    // );
    // const [fetchedProgrammes, setFetchedProgrammes] = useState<any>(null);

    // const form = useForm({
    //     resolver: yupResolver(schema),
    //     mode: "all",
    // });

    // const {
    //     register,
    //     watch,
    //     reset,
    //     handleSubmit,
    //     formState: { errors, isDirty, isValid },
    //     // control,
    //     setValue,
    // } = form;

    // const fetchClasses = async () => {
    //     setLoadingProgrammesState("Loading...");
    //     setFetchedProgrammes([]);
    //     try {
    //         const response = await getAllClasses(classForm);
    //         if (!response.data) return;

    //         setFetchedProgrammes(response.data);
    //         setLoadingProgrammesState(null);
    //     } catch (error: any) {
    //         setLoadingProgrammesState(
    //             error.message || error.data || "An error occurred"
    //         );
    //     }
    // };
    // useEffect(() => {
    //     fetchClasses();
    // }, []);
    // const fetchSubjects = async () => {
    //     setLoadingSubjectsState("Loading...");
    //     setFetchedSubjects([]);
    //     try {
    //         const response = await getAllNewCurriculumSubjects();
    //         if (response.status === "error") return;
    //         setFetchedSubjects(response?.data || []);
    //         setElectiveSubjects(response?.data || []);
    //         setLoadingSubjectsState(null);
    //     } catch (error: any) {
    //         setLoadingSubjectsState(
    //             error.message || error.data || "An error occurred"
    //         );
    //     }
    // };
    // useEffect(() => {
    //     fetchSubjects();
    // }, []);


    // const yearOfAdmissions = [
    //     new Date().getFullYear(),
    //     new Date().getFullYear() - 1,
    //     new Date().getFullYear() - 2,
    //     new Date().getFullYear() - 3,
    // ];
    // useEffect(() => {
    //     setCoreSubjects([]);
    //     setElectiveSubjects([]);

    //     fetchedSubjects?.length > 0 &&
    //         fetchedSubjects.map((subject: any) => {
    //             if (subject.type === "core") {
    //                 setCoreSubjects((prev) => [...prev, subject]);
    //             } else {
    //                 setElectiveSubjects((prev) => [...prev, subject]);
    //             }
    //         });
    // }, [fetchedSubjects]);

    // useEffect(() => {
    //     setValue("coreSubjects", coreSubjects, {
    //         shouldDirty: true,
    //         shouldTouch: true,
    //         shouldValidate: true,
    //     });
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [coreSubjects]);
    // const handleElectiveSubjectChange = (
    //     event: SyntheticEvent<Element, Event>,
    //     value: Array<{ _id: string; name: string; type: string }>,
    //     reason: AutocompleteChangeReason,
    //     details?: AutocompleteChangeDetails<any> | undefined
    // ) => {
    //     const list: Array<string> = [];
    //     value.forEach((subject: any) => {
    //         list.push(subject._id);
    //     });
    //     setSelectedElectivesId(list);
    //     setValue("selectedElectiveSubjects", value, {
    //         shouldDirty: true,
    //         shouldTouch: true,
    //         shouldValidate: true,
    //     });
    // };

    const handleAddMultipleStudents = async () => {
        if (!attendanceMonth || !attendanceYear || !classForm) {
            showAlert({
                title: "Error",
                severity: "error",
                text: "Please select a class, year, and month",
            });
            return;
        }
        if (!rowsToAdd || rowsToAdd.length === 0) {
            showAlert({
                title: "Error",
                severity: "error",
                text: "No attendance log added",
            });
            return;
        }

        setLoading(true);
        try {

            const finalData = {
                studentsLogs: rowsToAdd,
                year: attendanceYear,
                month: attendanceMonth,
                form: classForm,
            }
            // console.log("finalData>>>>>>>>>>", finalData)

            const responsedata = await addMultipleStudentAttendanceLogs(finalData)

            console.log("response>>>>>>>>>>", responsedata)

            if (responsedata.success) {
                setRowsToAdd([]);
                showAlert({
                    title: "success",
                    text: responsedata.message || "Attendance logs uploaded successfully",
                    severity: "success",
                    handleConfirmButtonClick: () => {
                        router.back();
                    }
                });

            } else {
                showAlert({
                    title: "Error",
                    text: responsedata.message || "An error occurred",
                    severity: "error",
                });
            }

        } catch (error: any) {
            showAlert({
                title: "Error",
                severity: "error",
                text: error.message || error.error || "An error occurred",
            });
        } finally {
            setLoading(false);
        }
    };
    // const handleUpdateCassRefIDForStudents = async () => {
    //     setLoading(true);
    //     try {

    //         const studentsToAdd: any = [];
    //         form2List.forEach((student: any) => {
    //             if (student.stpId === "" || student?.stpId?.toUpperCase() === "NA" || student.stpId?.toUpperCase() === "N/A") {
    //                 console.log("This student was skipped because his stpId is missing", student)
    //             } else {
    //                 studentsToAdd.push({
    //                     ssId: student?.studentId,
    //                     cassRefID: student?.stpId,
    //                 })
    //             }
    //         })
    //         console.log("studentsToAdd>>>>>>>>>>", studentsToAdd)

    //         const responsedata = await updateCassRefIDForStudents({ students: studentsToAdd })

    //         console.log("response>>>>>>>>>>", responsedata)

    //         if (responsedata.success) {
    //             showAlert({
    //                 title: "success",
    //                 text: responsedata.message || "Students added successfully",
    //                 severity: "success",
    //                 handleConfirmButtonClick: () => {
    //                     router.back();
    //                 }
    //             });
    //         } else {
    //             showAlert({
    //                 title: "Error",
    //                 text: responsedata.message || "An error occurred",
    //                 severity: "error",
    //             });
    //         }

    //     } catch (error: any) {
    //         showAlert({
    //             title: "Error",
    //             severity: "error",
    //             text: error.error || error.message || "An error occurred",
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <>
            <LoadingAlert open={loading} />

            <Box px={{ xs: 1, sm: 2, md: 3 }} pt={{ xs: 2, sm: 3, md: 4 }}>

                <Typography variant="h5" gutterBottom align="center">
                    UPLOAD ATTENDANCE LOG FILE
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <UploadAttendanceLogCSV
                            disabledUploadBtn={!classForm}
                            setRowsToAdd={setRowsToAdd}
                            setAttendanceYear={setAttendanceYear}
                            setAttendanceMonth={setAttendanceMonth}
                            handleAddMultipleStudents={handleAddMultipleStudents}
                        // handleAddMultipleStudents={handleaddSubjectToStudent}
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
