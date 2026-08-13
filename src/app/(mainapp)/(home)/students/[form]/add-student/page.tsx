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

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import SuccessDialog from "@/components/SuccessAlert";
import { getAllNewCurriculumSubjects } from "@/utils/serverActions/subject";
import {
  getAllClasses,
} from "@/utils/serverActions/classes";
import axios from "axios";
import { showAlert } from "@/components/Alerts";
import { yearOfAdmissions } from "@/utils/common";

const schema = object().shape({
  firstName: string().required("First name is required"),
  lastName: string(),
  // gender: string().required("Gender is required"),
  email: string(),
  classId: string().required("Class is required"),
  yearOfAdmission: string().required("Year of admission is required"),
  cassRefID: string().required("Cass reference ID is required"),
  // scholarshipType: string(),
  selectedElectiveSubjects: array<{
    _id: number;
    name: string;
    type: string;
  }>().required("Elective subjects are required"),
  // coreSubjects: array<{ _id: number; name: string; type: string }>().required(
  //   "Core subjects are required"
  // ),
  parentFirstName: string(),
  parentMiddleName: string(),
  parentLastName: string(),
  parentEmail: string(),
  parentPhoneNumber: string().required("Parent/Guardian number is required"),
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
  // const { selectedBatch, batches, fetchedBatches } = useBatchesContext();
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loadingProgrammesState, setLoadingProgrammesState] = useState<
    null | string
  >();
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [fetchedSubjects, setFetchedSubjects] = useState<any>(null);
  const [loadingSubjectsState, setLoadingSubjectsState] = useState<
    null | string
  >();

  const [fetchedProgrammes, setFetchedProgrammes] = useState<any>(null);

  // const [coreSubjects, setCoreSubjects] = useState<
  //   Array<{ _id: string; name: string; type?: string }>
  // >([]);
  const [electiveSubjects, setElectiveSubjects] = useState<
    Array<{ _id: string; name: string; type?: string }>
  >([]);
  const [selectElectivesId, setSelectedElectivesId] = useState<Array<string>>(
    []
  );
  const [phoneNum, setPhoneNum] = useState("");
  const [studentPhoneNumber, setStudentPhoneNumber] = useState("");
  const [newStudentDetails, setNewStudentDetails] = useState({
    name: "",
    serialNumber: "",
  });

  const form = useForm({
    // defaultValues: {
    // },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
    // control,
    setValue,
  } = form;

  const handleChange = (e: any) => {
    // console.log(e);
    // console.log(isValidPhoneNumber(e))
    // console.log(e);
    setValue("parentPhoneNumber", e, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPhoneNum(e);
  };

  const handleCloseSuccessDialog = () => {
    router.back();
    setOpenSuccessDialog(false);
  };
  const handleNew = () => {
    reset();
    setPhoneNum("");
    setValue("parentPhoneNumber", "");
    // setValue("programme", "");
    // setValue("gender", "");
    setValue("selectedElectiveSubjects", []);
    // setValue("coreSubjects", coreSubjects, {
    //   shouldDirty: true,
    //   shouldTouch: true,
    //   shouldValidate: true,
    // });
    setSelectedElectivesId([]);
    setOpenSuccessDialog(false);
    // window.location.reload();
  };
  const fetchClasses = async () => {
    setLoadingProgrammesState("Loading...");
    setFetchedProgrammes([]);
    try {
      const response = await getAllClasses(classForm);
      if (!response.data) return;
      setFetchedProgrammes(response.data);
      setLoadingProgrammesState(null);
    } catch (error: any) {
      console.log("error", error);
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
  useEffect(() => {
    // setCoreSubjects([]);
    setElectiveSubjects([]);

    fetchedSubjects?.length > 0 &&
      fetchedSubjects.map((subject: any) => {
        setElectiveSubjects((prev) => [...prev, subject]);
        // if (subject.type === "core") {
        //   setCoreSubjects((prev) => [...prev, subject]);
        // } else {
        //   setElectiveSubjects((prev) => [...prev, subject]);
        // }
      });
  }, [fetchedSubjects]);


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

  const Submit = async (dat: FormData) => {
    // if (
    //   dat.selectedElectiveSubjects.length === 0 ||
    //   dat.selectedElectiveSubjects.length >= 6
    // ) {
    //   setSnackbar({
    //     open: true,
    //     message: "Elective subjects should be five or less",
    //     severity: "error",
    //   });
    //   return;
    // }
    if (isValidPhoneNumber(dat.parentPhoneNumber) === false) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "parentPhoneNumber number is invalid",
      });
      return;
    }

    const subjectsId = [
      // ...dat.coreSubjects,
      ...dat.selectedElectiveSubjects,
    ].map((subject: any) => {
      return subject._id;
    });
    setLoading(true);
    try {
      const { selectedElectiveSubjects, ...rest } = dat;

      const finalData = {
        students: [{ ...rest, subjects: subjectsId }],
        classId: rest.classId,
        yearOfAdmission: rest.yearOfAdmission,
      }

      const responsedata = await axios.post(`/api/students`, finalData);

      if (responsedata.data.success) {

        if (responsedata.data.duplicateStudents.length > 0) {
          showAlert({
            title: "Error",
            text: `Student with this CASS Reference ID already exist.`,
            severity: "error",
          });
          return;
        }
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
        text: error.message || "An error occurred, please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
        redirect={`students/${classForm}`}
      />
      <SuccessDialog
        open={openSuccessDialog}
        name={newStudentDetails.name}
        serialNumber={newStudentDetails.serialNumber}
        title="Student registered successfully"
        handleNew={handleNew}
        handleClose={handleCloseSuccessDialog}
      />
      {/* <Button variant="contained" onClick={handleAddProgrammes}>
        handleAddProgrammes
      </Button> */}
      <Box px={{ xs: 1, sm: 2, md: 3 }} pt={{ xs: 2, sm: 3, md: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          REGISTER STUDENT
        </Typography>
        <form
          onSubmit={handleSubmit(Submit)}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            padding: "10px 20px",
          }}
        >
          <Typography fontWeight="bold">
            Enter student's details below
          </Typography>

          <Grid container spacing={3}>
            {/* First name */}
            <Grid item xs={12} sm={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  First name{" "}
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
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter first name"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("firstName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.firstName?.message}
                </Typography>
              </Box>
            </Grid>

            {/* last name */}
            <Grid item xs={12} sm={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  Last name{" "}
                </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter last name"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("lastName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.lastName?.message}
                </Typography>
              </Box>
            </Grid>

            {/* Class */}
            <Grid item xs={12} sm={12} md={4}>
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
                <Typography color="error" variant="subtitle2">
                  {errors.classId?.message}
                </Typography>
              </Box>
            </Grid>

            {/* Year of admission */}
            <Grid item xs={12} sm={12} md={4}>
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

            {/* cassRefID */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  CassRefID{" "}
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
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter cassRefID"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("cassRefID", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.cassRefID?.message}
                </Typography>
              </Box>
            </Grid>

            {/* Select elective subjects */}
            <Grid item container xs={12} spacing={3}>
              <Grid item xs={12}>
                <Typography>
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
              </Grid>
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
                      // label="Select elective subjects"
                      placeholder="subject"
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Parent/Guardian Details */}
            <Grid item xs={12}>
              <Typography fontWeight="bold">Parent/Guardian Details</Typography>
            </Grid>
            {/* First name */}
            <Grid item xs={12} sm={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  First name
                </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter first name"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("parentFirstName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.parentFirstName?.message}
                </Typography>
              </Box>
            </Grid>

            {/* last name */}
            <Grid item xs={12} sm={12} md={6}>
              <Box>
                <Typography gutterBottom>Last name </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter last name"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("parentLastName")}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.parentLastName?.message}
                </Typography>
              </Box>
            </Grid>

            {/* Parent's email */}
            <Grid item xs={12} sm={12} md={6}>
              <Box>
                <Typography gutterBottom>Email</Typography>
                <TextField
                  type="email"
                  fullWidth
                  variant="standard"
                  placeholder="Enter email"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("parentEmail")}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.parentEmail?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Parent's phone number */}
            <Grid item xs={12} sm={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  Phone Number{" "}
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
                <PhoneInput
                  defaultCountry="GH"
                  countryCallingCodeEditable={false}
                  international
                  value={phoneNum}
                  onChange={(formattedValue) => handleChange(formattedValue)}
                />
              </Box>
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
            <Button
              variant="contained"
              type="submit"
              sx={{ width: "120px" }}
              disabled={!isDirty || !isValid || loading}
            >
              Save
            </Button>
          </Box>
        </form>
      </Box>

      {/* <DevTool control={control} /> */}
    </>
  );
}
