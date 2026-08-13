"use client";
import React, { FC, SyntheticEvent, use, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import {
  Typography,
  useTheme,
  Button,
  MenuItem,
  TextField,
  Select,
  Grid,
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, array, boolean, number, object, string } from "yup";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useForm } from "react-hook-form";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";

import { useRouter } from "next/navigation";
import { SnackbarType } from "@/types/commonTypes";

import { CustomizedSelect } from "@/components/CustomizedSelect";

import { useBatchesContext } from "@/context/BatchesContext";
import { getAllNewCurriculumSubjects, getAllSubjects } from "@/utils/serverActions/subject";

import axios from "axios";
import { getAllClasses } from "@/utils/serverActions/classes";
import { deleteStudentPrevRegisterdSubject } from "@/utils/serverActions/fridayTestScore";
import { showAlert } from "@/components/Alerts";

const schema = object().shape({
  firstName: string().required("First name is required"),
  lastName: string(),
  classId: string().required("Class is required"),
  cassRefID: string().required("Cass reference ID is required"),
  selectedElectiveSubjects: array<{
    id: number;
    name: string;
    type: string;
  }>().required(),
  // coreSubjects: array<{ _id: number; name: string; type: string }>().required(
  //   "Core subjects are required"
  // ),
  parentFirstName: string(),
  parentLastName: string(),
  parentEmail: string().email(
    "Parent/Guardian email must be a valid email address"
  ),
  parentPhoneNumber: string().required("Parent/Guardian number is required"),
});

export interface FormData extends InferType<typeof schema> {
  // using interface instead of type generally gives nicer editor feedback
}

export default function EditStudent({
  params,
}: {
  params: Promise<{ id: string; form: string }>;
}) {
  const theme = useTheme();

  const router = useRouter();
  const { fetchedBatches } = useBatchesContext();
  // const [fetchedSubjects, setFetchedSubjects] = useState<any>(null);
  const [loadingSubjectsState, setLoadingSubjectsState] = useState<
    null | string
  >();
  const [electiveSubjects, setElectiveSubjects] = useState<
    Array<{ id: string; name: string; type: string }>
  >([]);
  const [loadingProgrammesState, setLoadingProgrammesState] = useState<
    null | string
  >();
  const [fetchedProgrammes, setFetchedProgrammes] = useState<any>(null);
  const [phoneNum, setPhoneNum] = useState("");
  // const [snackbar, setSnackbar] = useState<SnackbarType>({
  //   open: false,
  //   message: "",
  //   severity: undefined,
  // });

  const { form: classForm, id } = use(params);
  const [studentData, setStudentData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [prevElectives, setPrevElectives] = useState<Array<any>>([]);

  const [selectedSubjectsId, setSelectedSubjectsId] = useState<Array<string>>(
    []
  );

  const form = useForm({
    // defaultValues: {},
    resolver: yupResolver(schema),
    mode: "all",
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    // control,
    setValue,
  } = form;

  const fetchStudentsData = async () => {
    setLoading(true);
    setStudentData({});
    // setSnackbar({
    //   open: false,
    //   message: "Loading data...",
    //   severity: undefined,
    // });
    // console.log(selectedBatch)
    try {
      const res = await axios.get(`/api/students/${id}`);
      if (!res?.data?.data) {
        showAlert({
          title: "Error",
          text: res?.data?.message || "An error occurred, please try again",
          severity: "error",
        });
      }

      setStudentData(res?.data?.data);
      // const electives = res?.data?.data?.subjectInfo?.filter(
      //   (subject: any) => subject?.type === "elective"
      // );
      // const cores = res?.data?.data?.subjectInfo?.filter(
      //   (subject: any) => subject?.type === "core"
      // );
      // setValue("coreSubjects", cores, {
      //   shouldDirty: true,
      //   shouldTouch: true,
      //   shouldValidate: true,
      // });
      setPrevElectives(res?.data?.data?.subjectInfo || []);
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        text: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStudentsData();
  }, [id]);

  useEffect(() => {
    if (Object.keys(studentData).length > 0) {
      let list: Array<string> = [];

      setSelectedSubjectsId(prevElectives.map((subject) => subject?._id));
      setValue("firstName", studentData?.firstName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("lastName", studentData?.lastName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("selectedElectiveSubjects", prevElectives, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("classId", studentData?.classId || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("cassRefID", studentData?.cassRefID || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("parentFirstName", studentData?.parentFirstName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("parentLastName", studentData?.parentLastName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("parentEmail", studentData?.parentEmail || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("parentPhoneNumber", studentData?.parentPhoneNumber || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setPhoneNum(studentData?.parentPhoneNumber || "");
    }
    // eslint-disable-next-line
  }, [studentData, prevElectives]);

  const fetchSubjects = async () => {
    setLoadingSubjectsState("Loading...");
    setElectiveSubjects([]);
    try {
      const response = await getAllNewCurriculumSubjects();
      if (response.status === "error") return;

      const electives = response?.data;
      // const electives = response?.data?.filter(
      //   (subject: any) => subject?.type === "elective"
      // );
      setElectiveSubjects(electives || []);
      // setFetchedSubjects(response?.data || []);
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

  const handleElectiveSubjectChange = (
    event: SyntheticEvent<Element, Event>,
    value: any[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    const list: Array<string> = [];
    value.forEach((subject: any) => {
      list.push(subject._id);
    });
    setSelectedSubjectsId(list);
    setValue("selectedElectiveSubjects", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const fetchClasses = async () => {
    setLoadingProgrammesState("Loading...");
    setFetchedProgrammes([]);
    try {
      const response = await getAllClasses(classForm);
      if (!response.data) return;
      setFetchedProgrammes(response?.data || []);
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

  const handleChange = (e: any, fieldName?: string) => {
    setValue("parentPhoneNumber", e, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPhoneNum(e);
  };
  const Submit = async (data: FormData) => {
    if (isValidPhoneNumber(data.parentPhoneNumber) === false) {
      showAlert({
        title: "Error",
        text: "parentPhoneNumber number is invalid",
        severity: "error",
      });
      return;
    }
    const subjectsId = [
      // ...data.coreSubjects,
      ...data.selectedElectiveSubjects,
    ].map((subject: any) => {
      return subject._id;
    });
    try {
      const newNames = data?.selectedElectiveSubjects.map((elective) => {
        return elective._id;
      });

      const electivesToDelete: any[] = [];

      for (const subject of prevElectives) {
        if (!newNames.includes(subject._id)) {
          electivesToDelete.push(subject);
        }
      }

      setLoading(true);

      const { selectedElectiveSubjects, ...updatedData } = data;

      const res = await axios.put(`/api/students/${id}`, {
        ...updatedData,
        subjects: subjectsId,
      });

      // if (electivesToDelete.length > 0) {
      //   await Promise.all([
      //     ...electivesToDelete.map(async (subject) => {
      //       deleteStudentPrevRegisterdSubject({
      //         studentId: id,
      //         subjectId: subject._id,
      //         // fridayTestBatchId: fetchedBatches[0]?._id,
      //       });
      //     }),
      //   ]);
      // }
      showAlert({
        title: "Success",
        text: "Student details updated successfully",
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

  if (loading) return <LoadingAlert open={true} />;
  return (
    <>
      <LoadingAlert open={loading} />
      <Box sx={{ pt: 3, px: { xs: 1, sm: 2, md: 4 } }}>
        <Typography variant="h5" gutterBottom>
          Edit student details
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
          {/* <Typography>Enter your details below</Typography> */}

          <Grid container spacing={3}>
            {/* First name */}
            <Grid item xs={12} sm={12} md={3}>
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
            <Grid item xs={12} sm={12} md={3}>
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
            {/* Programme */}
            <Grid item xs={12} sm={12} md={3}>
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
            {/* cassRefID */}
            <Grid item xs={12} sm={12} md={3}>
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
                      : electiveSubjects?.filter(
                        (item: any) => !selectedSubjectsId?.includes(item._id)
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
                  First name{" "}
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
                <Typography gutterBottom>Last name</Typography>
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
                  {...register("parentLastName", { required: true })}
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
                  {...register("parentEmail", { required: true })}
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
            // onClick={() => router.push(`/students/${id}`)}
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
    </>
  );
}
