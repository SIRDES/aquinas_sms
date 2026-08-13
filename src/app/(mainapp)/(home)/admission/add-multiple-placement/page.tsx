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
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";



import AddMultiplePlacementCSV from "@/components/adminssion/AddMultiplePlacementCSV";
import { addAdminSetting } from "@/utils/serverActions/adminSettings";
import { AddMultiplePlacedStudents, isStudentWithHashedBeceIndexNumberExists } from "@/utils/serverActions/placedStudent";

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

export default function AddMultiplePlacedStudent() {
    const theme = useTheme();
    const router = useRouter();
    const [rowsToAdd, setRowsToAdd] = useState<
        Array<any>
    >([]);
    const { selectedBatch, batches, adminSettings } = useBatchesContext();
    const [loading, setLoading] = useState(false);


    const [snackbar, setSnackbar] = useState<SnackbarType>({
        open: false,
        message: "",
        severity: undefined,
    });

    console.log("adminSettings", adminSettings);

    const handleAddMultipleStudents = async () => {
        setLoading(true);
        try {
            const year = adminSettings?.admissionDetails?.admissionYear || "";
            const hashedBeceIndexNumbers = rowsToAdd.map(student => student?.Index || "");
            console.log("hashedBeceIndexNumbers", hashedBeceIndexNumbers);
            let studentsWithSSId: any = [];
            let newStudentsToAdd: Array<any> = [];

            const checkResponse = await isStudentWithHashedBeceIndexNumberExists({ hashedBeceIndexNumbers, yearOfAdmission: year });
            console.log("checkResponse", checkResponse);

            for (const student of rowsToAdd) {
                // console.log("res", res);
                // checkResponse?.data?.includes(student?.Index)
                // Check if any student in checkResponse.data has matching firstName, aggregate, and admissionProgramme
                const exists = checkResponse?.success && checkResponse?.data?.some((existingStudent: any) =>
                    existingStudent.firstName === student.Name &&
                    Number(existingStudent.aggregate) === Number(student.Aggregate) &&
                    existingStudent.admissionProgramme === student.Programme
                );

                if (exists) {
                    studentsWithSSId.push(student);
                    // Skip this student and continue with the next one
                } else {
                    newStudentsToAdd.push({
                        firstName: student.Name,
                        lastName: student?.lastName || "",
                        hashedBeceIndexNumber: student?.Index || "",
                        beceIndexNumber: student?.Index || "",
                        yearOfAdmission: year || "",
                        admissionProgramme: student?.Programme || "",
                        aggregate: Number(student?.Aggregate || 0) || 0
                    });
                }
            }
            console.log("newStudentsToAdd", newStudentsToAdd);
            if (newStudentsToAdd.length === 0) {
                setSnackbar({
                    open: true,
                    message: "No new students added",
                    severity: "error",
                });
                return;
            }
            await AddMultiplePlacedStudents(newStudentsToAdd);

            setSnackbar({
                open: true,
                message: `Added ${newStudentsToAdd?.length} new students`,
                severity: "success",
            });
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || "An error occurred, please try again",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // const handleaddFridayTestBatch = async () => {
    //     try {
    //         setLoading(true);
    //         // await addAcademicYear();
    //         await addAdminSetting();
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

    return (
        <>
            <LoadingAlert open={loading} />
            <ProgressAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                setOpen={setSnackbar}
                redirect={`admission/`}
            />
            {/* <Button onClick={handleaddFridayTestBatch}>Add Multiple Students</Button> */}
            <Box px={{ xs: 1, sm: 2, md: 3 }} pt={{ xs: 2, sm: 3, md: 4 }}>
                <Typography variant="h5" gutterBottom align="center">
                    ADD MULTIPLE STUDENTS
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <AddMultiplePlacementCSV
                            previewModalTitle={"Add Multiple Students"}
                            // disabledUploadBtn={!watch("classId") || selectElectivesId.length === 0}
                            setRowsToAdd={setRowsToAdd}
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
