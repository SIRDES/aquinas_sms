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

import { getAllNewCurriculumSubjects, getAllSubjects } from "@/utils/serverActions/subject";
import { addClasses, getAllClasses } from "@/utils/serverActions/classes";
import axios from "axios";

import AddMultipleStudentsCSV from "@/components/AddMultipleStudentsCSV";
import { showAlert } from "@/components/Alerts";
import { yearOfAdmissions } from "@/utils/common";

const schema = object().shape({
    classId: string().required("Class is required"),
    yearOfAdmission: string().required("Year of admission is required"),
    selectedElectiveSubjects: array<{
        _id: number;
        name: string;
        type: string;
    }>().required("Elective subjects are required"),
    // coreSubjects: array<{ _id: number; name: string; type: string }>().required(
    //     "Core subjects are required"
    // ),
});

type FormData = InferType<typeof schema>;

export default function AddStudent({
    params,
}: {
    params: Promise<{ form: string }>;
}) {
    const theme = useTheme();
    const router = useRouter();
    const { form: classForm } = use(params);
    const [rowsToAdd, setRowsToAdd] = useState<
        Array<any>
    >([]);
    const { selectedBatch, batches, fetchedBatches } = useBatchesContext();
    const [loading, setLoading] = useState(false);

    const [loadingProgrammesState, setLoadingProgrammesState] = useState<
        null | string
    >();
    // const [snackbar, setSnackbar] = useState<SnackbarType>({
    //     open: false,
    //     message: "",
    //     severity: undefined,
    // });
    const [fetchedSubjects, setFetchedSubjects] = useState<any>(null);
    const [loadingSubjectsState, setLoadingSubjectsState] = useState<
        null | string
    >();
    const [coreSubjects, setCoreSubjects] = useState<
        Array<{ _id: string; name: string; type?: string }>
    >([]);
    const [electiveSubjects, setElectiveSubjects] = useState<
        Array<{ _id: string; name: string; type?: string }>
    >([]);
    const [selectElectivesId, setSelectedElectivesId] = useState<Array<string>>(
        []
    );
    const [fetchedProgrammes, setFetchedProgrammes] = useState<any>(null);

    const form = useForm({
        resolver: yupResolver(schema),
        mode: "all",
    });

    const {
        register,
        watch,
        reset,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        // control,
        setValue,
    } = form;

    const fetchClasses = async () => {
        setLoadingProgrammesState("Loading...");
        setFetchedProgrammes([]);
        try {
            const response = await getAllClasses(classForm);
            if (!response.data) return;

            setFetchedProgrammes(response.data);
            setLoadingProgrammesState(null);
        } catch (error: any) {
            setLoadingProgrammesState(
                error.message || error.data || "An error occurred"
            );
        }
    };
    useEffect(() => {
        fetchClasses();
    }, []);
    const fetchSubjects = async () => {
        setLoadingSubjectsState("Loading...");
        setFetchedSubjects([]);
        try {
            const response = await getAllNewCurriculumSubjects();
            if (response.status === "error") return;
            setFetchedSubjects(response?.data || []);
            setElectiveSubjects(response?.data || []);
            setLoadingSubjectsState(null);
        } catch (error: any) {
            setLoadingSubjectsState(
                error.message || error.data || "An error occurred"
            );
        }
    };
    useEffect(() => {
        fetchSubjects();
    }, []);


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
    const handleElectiveSubjectChange = (
        event: SyntheticEvent<Element, Event>,
        value: Array<{ _id: string; name: string; type: string }>,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<any> | undefined
    ) => {
        const list: Array<string> = [];
        value.forEach((subject: any) => {
            list.push(subject._id);
        });
        setSelectedElectivesId(list);
        setValue("selectedElectiveSubjects", value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const handleAddMultipleStudents = async () => {
        const subjectsId = [
            // ...watch('coreSubjects'),
            ...watch('selectedElectiveSubjects'),
        ].map((subject: any) => {
            return subject._id;
        });
        setLoading(true);
        try {
            const formatPhoneNumber = (phone: string) => {
                if (phone === "") return "";
                return `+233${phone.slice(1)}`;
            };
            let studentsWithSSId: any = [];
            // for (const student of rowsToAdd) {

            //     const res = await isStudentWithSSIdExists(student.studentId);
            //     // console.log("res", res);
            //     if (res?.status === "success") {
            //         studentsWithSSId.push(student);
            //         // Skip this student and continue with the next one
            //     } else {
            //         await axios.post(`/api/students`, {
            //             firstName: student?.name || "",
            //             lastName: student?.lastName || "",
            //             ssId: student?.studentId || "",
            //             subjects: subjectsId || [],
            //             classId: watch("classId") || "",
            //             parentFirstName: "",
            //             parentLastName: "",
            //             parentEmail: "",
            //             parentPhoneNumber: formatPhoneNumber(student.phoneNumber),
            //         });
            //     }
            //     // console.log("student", student);

            // }

            const studentsToAdd = rowsToAdd.map((student: any) => {
                return {
                    firstName: student?.firstName || "",
                    lastName: student?.lastName || "",
                    ssId: student?.studentId || "",
                    subjects: subjectsId || [],
                    // classId: watch("classId") || "",
                    parentFirstName: "",
                    parentLastName: "",
                    parentEmail: "",
                    parentPhoneNumber: formatPhoneNumber(student.phoneNumber),
                    cassRefID: student?.cassRefID || "",
                }
            })
            const finalData = {
                students: studentsToAdd,
                classId: watch("classId") || "",
                yearOfAdmission: watch("yearOfAdmission") || "",
            }
            // console.log("finalData>>>>>>>>>>", finalData)

            const responsedata = await axios.post(`/api/students`, finalData);

            // console.log("response>>>>>>>>>>", responsedata)

            if (responsedata.data.success) {
                showAlert({
                    title: "success",
                    text: responsedata.data.message || "Students added successfully",
                    severity: "success",
                    handleConfirmButtonClick: () => {
                        router.back();
                    }
                });
            } else {
                showAlert({
                    title: "Error",
                    text: responsedata.data.message || responsedata.data.error || "An error occurred",
                    severity: "error",
                });
            }

        } catch (error: any) {
            showAlert({
                title: "Error",
                severity: "error",
                text: error.error || error.message || "An error occurred",
            });
        } finally {
            setLoading(false);
        }
    };
    // const handleUpdateCassRefIDForStudents = async () => {
    //     setLoading(true);
    //     try {

    //         const responsedata = await updateParentPhoneNumbers()

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
            {/* <ProgressAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                setOpen={setSnackbar}
                redirect={`students/${classForm}`}
            /> */}
            <Box px={{ xs: 1, sm: 2, md: 3 }} pt={{ xs: 2, sm: 3, md: 4 }}>
                {/* <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateCassRefIDForStudents}
                >
                    Update CassRefID
                </Button> */}
                <Typography variant="h5" gutterBottom align="center">
                    ADD MULTIPLE STUDENTS
                </Typography>

                <Typography fontWeight="bold">
                    Enter student's details below
                </Typography>

                <Grid container spacing={3}>

                    {/* Class */}
                    <Grid item xs={12} sm={12} md={2}>
                        <Box>
                            <Typography gutterBottom>
                                Class{" "}
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

                            <Select
                                fullWidth
                                displayEmpty
                                value={watch("classId") || ""} // Ensures a default value
                                input={<CustomizedSelect />}
                                renderValue={() => {
                                    const classId = watch("classId") || "";
                                    const selectedClass = fetchedProgrammes?.find(
                                        (item: any) => item._id === classId
                                    )?.name;
                                    return selectedClass ? (
                                        <em>{selectedClass}</em>
                                    ) : (
                                        <em style={{ color: "#ABB3BF" }}>Select class</em>
                                    );
                                }}
                                {...register("classId", { required: true })}
                            >
                                {loadingProgrammesState ? (
                                    <MenuItem disabled>{loadingProgrammesState}</MenuItem>
                                ) : (
                                    fetchedProgrammes?.map((programme: any) => (
                                        <MenuItem key={programme._id} value={programme._id}>
                                            {programme?.name?.toUpperCase()}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </Box>
                    </Grid>
                    {/* Year of admission */}
                    <Grid item xs={12} sm={12} md={2}>
                        <Box>
                            <Typography gutterBottom>
                                Year of admission{" "}
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

                            <Select
                                fullWidth
                                displayEmpty
                                value={watch("yearOfAdmission") || ""} // Ensures a default value
                                input={<CustomizedSelect />}
                                renderValue={() => {
                                    const yearOfAdmission = watch("yearOfAdmission") || "";
                                    const selectedYearOfAdmission = yearOfAdmissions?.find(
                                        (item: any) => item === yearOfAdmission
                                    );
                                    return selectedYearOfAdmission ? (
                                        <em>{selectedYearOfAdmission}</em>
                                    ) : (
                                        <em style={{ color: "#ABB3BF" }}>Select year of admission</em>
                                    );
                                }}
                                {...register("yearOfAdmission", { required: true })}
                            >
                                {yearOfAdmissions?.map((year: any) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Grid>
                    {/* Select elective subjects */}
                    <Grid item container sm={12} md={8}>
                        <Typography gutterBottom>
                            Select both core and elective subjects{" "}
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
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                id="add-student-select-elective-subject"
                                options={
                                    loadingSubjectsState
                                        ? [loadingSubjectsState]
                                        : electiveSubjects.filter(
                                            (item) => !selectElectivesId?.includes(item._id)
                                        ) || []
                                }
                                getOptionLabel={(option: any) => option?.name?.toUpperCase()}
                                onChange={handleElectiveSubjectChange}
                                filterSelectedOptions
                                value={watch("selectedElectiveSubjects") || []}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        InputProps={{
                                            ...params.InputProps,
                                            style: {
                                                border: "1px solid #ABB3BF",
                                                padding: "3px",
                                                borderRadius: "5px",
                                            },
                                        }}
                                        placeholder="subject"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <AddMultipleStudentsCSV
                            disabledUploadBtn={!watch("classId") || selectElectivesId.length === 0 || !watch("yearOfAdmission")}
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
