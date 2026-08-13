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
  Divider,
  IconButton,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, date, number, object, string } from "yup";
// import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useForm } from "react-hook-form";
import LoadingAlert from "@/components/LoadingAlert";
import { useRouter } from "next/navigation";
import { SnackbarType } from "@/types/commonTypes";

import { CustomizedSelect } from "@/components/CustomizedSelect";

import { useBatchesContext } from "@/context/BatchesContext";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from "axios";
import regionsAndDistricts from "@/utils/regionAndDistricts.json"
import uploadFile, { deleteFile } from "@/utils/services/cloudinaryUpload";
import { useSession } from "next-auth/react";
import { getPlacedStudentById, updatePlacedStudent } from "@/utils/serverActions/placedStudent";

import EditIcon from '@mui/icons-material/Edit';
import { showAlert } from "@/components/Alerts";
import Image from "next/image";
import dayjs, { Dayjs } from "dayjs";
import ImagesDropzone, { FileType } from "@/components/ImageDropZone";

const regions = () => {
  return regionsAndDistricts.map(region => {
    return region.label
  })
}
const schema = object().shape({
  firstName: string().required("First name is required"),
  lastName: string(),

  parentFirstName: string().required("Guardian first name is required"),
  parentLastName: string().required("Guardian last name is required"),
  parentEmail: string(),
  parentPhoneNumber: string().required("Guardian phone number is required"),
  // gender: string().required("Gender is required"),
  religion: string().required("Religion is required"),
  religiousDenomination: string().required("Religious denomination is required"),
  dob: date().required("Date of birth is requred"),
  nationality: string().required("Nationality is required"),
  beceIndexNumber: string().required("BECE index number is required"),
  csspsEnrolmentCode: string().required("CSSPS enrolment code is required"),
  // profileImage: string(),
  placeOfBirth: string().required("Place of birth is required"),
  jhsAttended: string().required("JHS attended is required"),
  jhsType: string().required("JHS type is required"),
  intersts: string(),
  schoolAwards: string(),
  positionsHeld: string(),
  aggregate: number().required("Aggregate is required"),
  admissionProgramme: string().required("Programme is required"),
  rawScore: number().required("Raw score is required"),
  town: string().required("Town is required"),
  district: string().required("District is required"),
  region: string().required("Region is required"),
  permanentAddress: string().required("Permanent address is required"),
  fatherFirstName: string().required("Father's first name is required"),
  fatherLastName: string().required("Father's last name is required"),
  fatherOccupation: string().required("Father's occupation is required"),
  motherFirstName: string().required("Mother's first name is required"),
  motherLastName: string().required("Mother's last name is required"),
  motherOccupation: string().required("Mother's occupation is required"),
  parentAltPhoneNumber: string(),
});

export interface FormData extends InferType<typeof schema> {
  // using interface instead of type generally gives nicer editor feedback
}

export default function PlacedStudentDetails({
  params,
}: {
  params: Promise<{ id: string, form: string }>;
}) {
  const theme = useTheme();
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { fetchedBatches } = useBatchesContext();
  // const [showForm, setShowForm] = useState(true);
  const [phoneNum, setPhoneNum] = useState("");
  const [altPhoneNum, setAltPhoneNum] = useState("");

  const [studentData, setStudentData] = useState<any>({});
  const [districts, setDistricts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUploadImageComponent, setShowUploadImageComponent] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs('2022-04-17'));

  const [selectedProfileImage, setSelectedProfileImage] = useState<FileType[] | null>(null)

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
    try {

      const res = await getPlacedStudentById(id || "");


      if (!res.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.message || "An error occurred, please try again"
        })
        return
      }
      setStudentData(res?.data);
    } catch (error: any) {

      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred"
      })
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!id) return;
    fetchStudentsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (Object.keys(studentData || {}).length > 0) {
      let list: Array<string> = [];

      setValue("beceIndexNumber", studentData?.beceIndexNumber || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
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
      // setValue("gender", studentData?.gender || "", {
      //   shouldDirty: true,
      //   shouldTouch: true,
      //   shouldValidate: true,
      // });
      setValue("nationality", studentData?.nationality || "Ghanaian", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("admissionProgramme", studentData?.admissionProgramme || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("aggregate", studentData?.aggregate || 0, {
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

      setValue("motherOccupation", studentData?.motherOccupation || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("motherLastName", studentData?.motherLastName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("motherFirstName", studentData?.motherFirstName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("fatherOccupation", studentData?.fatherOccupation || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("fatherLastName", studentData?.fatherLastName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("fatherFirstName", studentData?.fatherFirstName || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("permanentAddress", studentData?.permanentAddress || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("region", studentData?.region, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("district", studentData?.district || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("town", studentData?.town || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("rawScore", studentData?.rawScore || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("positionsHeld", studentData?.positionsHeld || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("schoolAwards", studentData?.schoolAwards || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("intersts", studentData?.intersts || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("jhsType", studentData?.jhsType || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("jhsAttended", studentData?.jhsAttended || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("placeOfBirth", studentData?.placeOfBirth || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      // setValue("profileImage", studentData?.profileImage || "", {
      //   shouldDirty: true,
      //   shouldTouch: true,
      //   shouldValidate: true,
      // });
      // if (studentData?.profileImage || studentData?.profileImage !== "") {
      //   setShowUploadImageComponent(false)
      // }
      setValue("religion", studentData?.religion || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("religiousDenomination", studentData?.religiousDenomination || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("csspsEnrolmentCode", studentData?.csspsEnrolmentCode || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("dob", studentData?.dob || "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setSelectedDate(dayjs(studentData?.dob) || null);
      setPhoneNum(studentData?.parentPhoneNumber || "");
    }
    // eslint-disable-next-line
  }, [studentData]);

  const hanldleDobChange = (date: Dayjs | null) => {
    setValue("dob", new Date(date?.toString() || ""), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setSelectedDate(dayjs(date));
  }
  const getDistricts = () => {
    const districts = regionsAndDistricts
      .filter(region => region.label === watch("region"))?.[0]?.districts
      .map(district => district.label) || [];
    setDistricts(districts);
  };
  useEffect(() => {
    getDistricts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("region")])
  const handleSelectChange = (
    event: SyntheticEvent<Element, Event>,
    value: string | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {

    setValue("region", value || "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
  const handleSelectDistrictChange = (
    event: SyntheticEvent<Element, Event>,
    value: string | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    setValue("district", value || "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  const handleChange = (e: any, altPhoneNumber?: string) => {

    if (altPhoneNumber) {
      setValue("parentAltPhoneNumber", e, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setAltPhoneNum(e);
      return
    }
    setValue("parentPhoneNumber", e, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPhoneNum(e);
  };

  // const handleProfileImageChange = async (File: FileType) => {
  //   if (File.file.size > 2 * 1024 * 1024) {
  //     showAlert({
  //       title: "Error",
  //       severity: "error",
  //       text: "File size must be less than 2MB"
  //     })
  //     return
  //   }
  //   setUploadingImage(true)
  //   try {
  //     if (watch("profileImage")) {
  //       const res = await deleteFile(watch("profileImage") as string);
  //     }

  //     const res = await uploadFile({ file: File.file, folder: "profileImage" })
  //     setValue("profileImage", res, {
  //       shouldDirty: true,
  //       shouldTouch: true,
  //       shouldValidate: true,
  //     });
  //   } catch (error: any) {

  //   } finally {
  //     setUploadingImage(false)
  //   }
  // }
  // useEffect(() => {
  //   if (!selectedProfileImage) return
  //   handleProfileImageChange(selectedProfileImage[0])
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedProfileImage])
  const Submit = async (data: FormData) => {

    if (isValidPhoneNumber(data.parentPhoneNumber) === false) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "Guardian phone number is invalid"
      })
      return;
    }

    try {

      // if (data.profileImage === "" && selectedProfileImage === null) {
      //   showAlert({
      //     title: "Error",
      //     severity: "error",
      //     text: "Profile image is required"
      //   })
      //   return
      // }
      setLoading(true);

      const res = await updatePlacedStudent({ id: studentData?._id || "", data: data })

      showAlert({
        title: "Success",
        severity: "success",
        text: "Student details updated successfully",
        handleConfirmButtonClick: () => {
          router.back();
        },
        allowOutsideClick: false
      })
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "Something went wrong"
      })
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingAlert open={true} />;
  return (
    <>
      <LoadingAlert open={loading} />
      <Box sx={{ pt: 3, px: { xs: 1, sm: 1, md: 4 } }}>
        <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Typography variant="h5" gutterBottom>
            Personal Records form (2025/2026 Academic Year)
          </Typography>

        </Box>
        <form
          onSubmit={handleSubmit(Submit)}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "10px 5px",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Enrollment Details
          </Typography>

          <Grid container spacing={3} mb={3}>

            {/* Index number */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Index number{" "}
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
                  placeholder="Enter index number"
                  value={watch("beceIndexNumber")}
                  disabled
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                // {...register("beceIndexNumber", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.beceIndexNumber?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Name */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Name{" "}
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
                  value={watch("firstName")}
                  disabled
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                // {...register("firstName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.firstName?.message}
                </Typography>
              </Box>
            </Grid>


            {/* Gender */}
            {/* <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Gender{" "}
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
                  placeholder="Enter gender"
                  disabled
                  value={watch("gender")}
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                // {...register("gender", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.gender?.message}
                </Typography>
              </Box>
            </Grid> */}
            {/* Programme */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Programme{" "}
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
                  placeholder="Enter programme"
                  value={watch("admissionProgramme")}
                  disabled
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                // {...register("admissionProgramme", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.admissionProgramme?.message}
                </Typography>
              </Box>
            </Grid>
            {/* aggregate */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Aggregate of best six{" "}
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
                  placeholder="Enter aggregate"
                  value={watch("aggregate")}
                  disabled
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                // {...register("aggregate", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors?.aggregate?.type === "typeError"
                    ? "Aggregate is required"
                    : errors.aggregate?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Date of birth */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Date of birth{" "}
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


                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={selectedDate}
                    onChange={hanldleDobChange}

                    slotProps={{
                      textField: {
                        variant: "standard",
                        InputProps: {
                          style: {
                            width: "100%",
                            border: "2px solid #ABB3BF",
                            padding: "6px 10px",
                            // paddingTop: "17px",
                            borderRadius: "5px",
                          },
                        },
                      },

                    }}
                    sx={{
                      width: "100%",
                    }}
                  />
                </LocalizationProvider>

                <Typography color="error" variant="subtitle2">
                  {errors?.dob?.type === "typeError"
                    ? "Date of birth is required"
                    : errors.dob?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Place of birth */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Place of birth{" "}
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
                  placeholder="Enter place of birth"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("placeOfBirth", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.placeOfBirth?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Nationality */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Nationality{" "}
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
                  placeholder="Enter nationality"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("nationality", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.nationality?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Religion */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Religion{" "}
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
                  input={<CustomizedSelect />}
                  renderValue={() => {
                    if (watch("religion") === "") {
                      return <em style={{ color: "#ABB3BF" }}>Select</em>;
                    } else {
                      return <Typography>{(watch("religion") || "").toUpperCase()}</Typography>;
                    }
                  }}
                  {...register("religion")}
                >
                  <MenuItem value={"chritianity"}>CHRISTIANITY</MenuItem>
                  <MenuItem value={"islam"}>ISLAM</MenuItem>
                  <MenuItem value={"africanReligion"}>AFRICAN RELIGION</MenuItem>
                </Select>
                <Typography color="error" variant="subtitle2">
                  {errors.religion?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Religious denomination */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Religious denomination{" "}
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
                  placeholder="Enter religious denomination"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("religiousDenomination", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.religiousDenomination?.message}
                </Typography>
              </Box>
            </Grid>
            <Grid item container xs={12} spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" color="error.main" fontWeight={"bold"}>
                  Enter exactly what's on the ENROLMENT FORM
                </Typography>
              </Grid>
              {/* Raw score */}
              <Grid item xs={12} sm={12} md={4}>
                <Box>
                  <Typography gutterBottom>
                    Raw Score{" "}
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
                    type="number"
                    min="0"
                    fullWidth
                    variant="standard"
                    placeholder="Enter raw score"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("rawScore")}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors?.rawScore?.type === "typeError"
                      ? "Raw score is required"
                      : errors.rawScore?.message}
                  </Typography>
                </Box>
              </Grid>
              {/* enrolment code */}
              <Grid item xs={12} sm={12} md={4}>
                <Box>
                  <Typography gutterBottom>
                    Enrolment code{" "}
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
                    placeholder="Enter enrolment code"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("csspsEnrolmentCode")}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors.csspsEnrolmentCode?.message}
                  </Typography>
                </Box>
              </Grid>

              {/* Jhs attended */}
              <Grid item xs={12} sm={12} md={6}>
                <Box>
                  <Typography gutterBottom>
                    Name of JHS attended{" "}
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
                    placeholder="Enter name of JHS attend"
                    inputProps={{
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "10px",
                        // paddingTop: "17px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("jhsAttended", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors.jhsAttended?.message}
                  </Typography>
                </Box>
              </Grid>

              {/* Jhs type */}
              <Grid item xs={12} sm={12} md={6}>
                <Box>
                  <Typography gutterBottom>
                    Select JHS type{" "}
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
                    input={<CustomizedSelect />}
                    renderValue={() => {
                      if (watch("jhsType") === "") {
                        return <em style={{ color: "#ABB3BF" }}>Select</em>;
                      } else {
                        return <Typography>{(watch("jhsType") || "").toUpperCase()}</Typography>;
                      }
                    }}
                    {...register("jhsType")}
                  >
                    <MenuItem value={"public"}>PUBLIC</MenuItem>
                    <MenuItem value={"private"}>PRIVATE</MenuItem>
                  </Select>
                  <Typography color="error" variant="subtitle2">
                    {errors.jhsType?.message}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Divider />

          {/* interest and awards */}

          <Grid container spacing={3} mb={3}>
            {/* Interest */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Your interests
                </Typography>
                <Typography variant="caption" gutterBottom>
                  Seperate them with a semi colon(;)
                </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter your interests"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("intersts", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.intersts?.message}
                </Typography>
              </Box>
            </Grid>
            {/* schoolAwards */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Awards
                </Typography>
                <Typography variant="caption" gutterBottom>
                  Seperate them with a semi colon(;)
                </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter your awards"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("schoolAwards", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.schoolAwards?.message}
                </Typography>
              </Box>
            </Grid>
            {/* schoolAwards */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Positions held
                </Typography>
                <Typography variant="caption" gutterBottom>
                  Seperate them with a semi colon(;)
                </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Enter your positions held"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("positionsHeld", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.positionsHeld?.message}
                </Typography>
              </Box>
            </Grid>

          </Grid>

          <Divider />

          <Typography variant="h6" fontWeight="bold" mt={3}>
            Address Details
          </Typography>
          <Grid container spacing={3} mb={3}>
            {/* permanentAddress */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Address
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
                  {...register("permanentAddress", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.permanentAddress?.message}
                </Typography>
              </Box>
            </Grid>

            {/* town */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Town{" "}
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
                  placeholder="Enter name of town"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("town", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.town?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Region */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Region{" "}
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
                <Autocomplete
                  id="filter-by-region"
                  fullWidth
                  size="small"
                  options={regions() || []}
                  value={watch("region") || ""}
                  getOptionLabel={(option: any) => option}
                  // isOptionEqualToValue={(option, value) => option.value === value}

                  onChange={handleSelectChange}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField {...params} placeholder="region" />
                  )}
                // {...register("region", { required: true })}
                />





                <Typography color="error" variant="subtitle2">
                  {errors.region?.message}
                </Typography>
              </Box>
            </Grid>
            {/* District */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  District{" "}
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
                <Autocomplete
                  id="filter-by-district"
                  fullWidth
                  size="small"
                  options={districts || []}
                  value={watch("district")}
                  getOptionLabel={(option: any) => option}
                  onChange={handleSelectDistrictChange}
                  // // defaultValue={[top100Films[13]]}
                  // onChange={handleSearchByProgramme}
                  // {...register("district", { required: true })}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField {...params} placeholder="district" />
                  )}
                />

                <Typography color="error" variant="subtitle2">
                  {errors.district?.message}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider />
          <Typography variant="h6" fontWeight="bold" mt={3}>
            Parent Details
          </Typography>
          <Grid container spacing={3} mb={3}>
            {/* Father's First name */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Father's first name{" "}
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
                  {...register("fatherFirstName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.fatherFirstName?.message}
                </Typography>
              </Box>
            </Grid>

            {/* last name */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Father's last name{" "}
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
                  placeholder="Enter last name"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("fatherLastName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.fatherLastName?.message}
                </Typography>
              </Box>
            </Grid>
            {/* father's occupation */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Father's occupation{" "}
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
                  placeholder="Enter father's occupations"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("fatherOccupation", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.fatherOccupation?.message}
                </Typography>
              </Box>
            </Grid>
            {/* Mother's First name */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Mother's first name{" "}
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
                  placeholder="Enter mother's first name"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("motherFirstName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.motherFirstName?.message}
                </Typography>
              </Box>
            </Grid>

            {/* last name */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Mother's last name{" "}
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
                  placeholder="Enter mother's last name"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("motherLastName", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.motherLastName?.message}
                </Typography>
              </Box>
            </Grid>
            {/* mother's occupation */}
            <Grid item xs={12} sm={12} md={4}>
              <Box>
                <Typography gutterBottom>
                  Mother's occupation{" "}
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
                  placeholder="Enter mother's occupations"
                  inputProps={{
                    style: {
                      border: "2px solid #ABB3BF",
                      padding: "10px",
                      // paddingTop: "17px",
                      borderRadius: "5px",
                    },
                  }}
                  {...register("motherOccupation", { required: true })}
                />
                <Typography color="error" variant="subtitle2">
                  {errors.motherOccupation?.message}
                </Typography>
              </Box>
            </Grid>

            {/* Guardian Details */}
            <Grid item xs={12}>
              <Typography fontWeight="bold">Guardian Details</Typography>
            </Grid>
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
            {/* Parent's alt phone number */}
            <Grid item xs={12} sm={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  Alt. Phone Number{" "}
                </Typography>
                <PhoneInput
                  defaultCountry="GH"
                  countryCallingCodeEditable={false}
                  international
                  value={altPhoneNum}
                  onChange={(formattedValue) => handleChange(formattedValue, "altPhoneNumber")}
                />
              </Box>
            </Grid>
          </Grid>
          <Divider />
          {/* <Typography variant="h6" fontWeight="bold" mt={2}>
            Profile Image
          </Typography>
          <Grid container>
            <Grid item xs={12}>
              {showUploadImageComponent ? <ImagesDropzone setSelectedImages={setSelectedProfileImage} /> : (
                <Box display="flex" flexDirection={"column"} gap={2}>
                  <Image
                    src={watch("profileImage") || "/default.png"}
                    height={100}
                    width={100}

                    alt={`profile image`}
                  />
                  <Typography
                    variant="caption"
                    color="error"
                    onClick={() => setShowUploadImageComponent(true)}
                    sx={{ cursor: "pointer" }}
                  >
                    Remove
                  </Typography>

                </Box>
              )}
            </Grid>
          </Grid> */}
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
            // disabled={!isDirty || !isValid || loading || uploadingImage || (watch("profileImage") === "" && !selectedProfileImage)}
            >
              Save
              {/* {uploadingImage ? "Uploading..." : "Save"} */}
            </Button>
          </Box>
        </form>

      </Box >
    </>
  );
}

