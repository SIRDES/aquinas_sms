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

import { showAlert } from "@/components/Alerts";

import UploadAttendanceLogCSV from "@/components/UploadAttendanceLogCSV";
import { addMultipleStudentAttendanceLogs } from "@/utils/serverActions/studentAttendanceLog";

export default function AddStudent({
    params,
}: {
    params: Promise<{ form: string }>;
}) {
    const theme = useTheme();
    const router = useRouter();
    const [rowsToAdd, setRowsToAdd] = useState<StudentAttendanceLogType[]>([]);
    const [loading, setLoading] = useState(false);

    const [classForm, setClassForm] = useState<string>("2");
    const [attendanceYear, setAttendanceYear] = useState<string>(" ");
    const [attendanceMonth, setAttendanceMonth] = useState<string>(" ");

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
