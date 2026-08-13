"use client";
import React, { SyntheticEvent, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  Typography,
  Button,
  MenuItem,
  TextField,
  Grid,
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import Select from "@mui/material/Select";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, object, string, array } from "yup";
import { userPermissions } from "@/utils/common";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControlLabel from "@mui/material/FormControlLabel";

import { useForm } from "react-hook-form";
import LoadingAlert from "@/components/LoadingAlert";
import { useRouter } from "next/navigation";

import "react-phone-number-input/style.css";
import {
  getAllNewCurriculumSubjects,
} from "@/utils/serverActions/subject";
import { getStaffById, updateStaff } from "@/utils/serverActions/user";
import { showAlert } from "@/components/Alerts";

const schema = object().shape({
  firstName: string().required("First name is required"),
  lastName: string().required("Last name is required"),
  email: string().required("Email is required"),
  role: string().required("Role is required"),
  subjectId: string().when("role", {
    is: "teacher",
    then: (schema) => schema.required("Assigning a subject is required for teachers"),
    otherwise: (schema) => schema.notRequired(),
  }),
  userPermissions: array().of(string().required()).when("role", {
    is: "admin",
    then: (schema) => schema.min(1, "At least one permission is required").required("Staff permission is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type FormData = InferType<typeof schema>;

export default function EditStaff({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [loadingSubjectsState, setLoadingSubjectsState] = useState<null | string>();

  const [fetchedSubjects, setFetchedSubjects] = useState<
    Array<{
      _id: string;
      name: string;
      type?: string;
      isNewCurriculum?: boolean;
    }>
  >([]);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "teacher",
      subjectId: "",
      userPermissions: [] as string[],
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
    setValue,
  } = form;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setInitialLoading(true);
        const res = await getStaffById(id);
        if (res.success && res.data) {
          reset({
            firstName: res.data.firstName || "",
            lastName: res.data.lastName || "",
            email: res.data.email || "",
            role: res.data.role || "teacher",
            subjectId: res.data.subjects?.[0] || "",
            userPermissions: res.data.userPermissions || [],
          });
        } else {
          showAlert({ title: "Error", text: res.message || "Failed to load user", severity: "error" });
        }
      } catch (err: any) {
        showAlert({ title: "Error", text: "An error occurred while loading user", severity: "error" });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUser();
  }, [id, reset]);

  useEffect(() => {
    const fetchSubjects = async () => {
      setFetchedSubjects([]);
      try {
        setLoadingSubjectsState("Loading subjects...");
        const response = await getAllNewCurriculumSubjects();
        if (!response.data) return;
        setFetchedSubjects(response.data);
      } catch (error: any) {
        showAlert({
          title: "Error",
          text: error.message || "An error occurred, please try again",
          severity: "error",
        });
      } finally {
        setLoadingSubjectsState(null);
      }
    };
    fetchSubjects();
  }, []);

  const handleElectiveSubjectChange = (
    event: SyntheticEvent<Element, Event>,
    value: { _id: string; name: string; type?: string; isNewCurriculum?: boolean } | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined
  ) => {
    setValue("subjectId", value?._id || "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };



  const Submit = async (dat: FormData) => {
    if (dat.role === "teacher" && !dat.subjectId) {
      showAlert({
        title: "Error",
        text: "Assigning a subject is required for teachers",
        severity: "error",
      });
      return;
    }

    if (dat.role === "admin" && (!dat?.userPermissions?.length || dat?.userPermissions.length < 1)) {
      showAlert({
        title: "Error",
        text: "Assigning a permission is required for admins",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await updateStaff(id, {
        ...dat,
        subjectId: dat.role === "admin" ? [] : dat.subjectId ? [dat.subjectId] : [],
        userPermissions: dat.role === "teacher" ? [] : dat.userPermissions,
      });
      if (!res?.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred, please try again",
          severity: "error",
        });
        return;
      }

      showAlert({
        title: "Success",
        text: "Staff details updated successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.back();
        },
      });



    } catch (error: any) {
      console.log("update staff error", error);
      showAlert({
        title: "Error",
        text: error?.response?.data?.message || error.message || "An error occurred, please try again",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingAlert open={true} />;
  }

  return (
    <Box sx={{ minHeight: "80vh", py: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <LoadingAlert open={loading} />

      <Paper
        elevation={4}
        sx={{
          width: "100%",
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Edit Staff Details
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Update the details of the staff member below
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          <form onSubmit={handleSubmit(Submit)} noValidate>
            <Grid container spacing={3}>
              {/* First name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  {...register("firstName", { required: true })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  required
                />
              </Grid>

              {/* last name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  {...register("lastName", { required: true })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  required
                />
              </Grid>

              {/*  email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  type="email"
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  required
                />
              </Grid>

              {/* role */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" error={!!errors.role} required>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    label="Role"
                    value={watch("role")}
                    {...register("role", { required: true })}
                  >
                    <MenuItem value={"teacher"}>Teacher</MenuItem>
                    <MenuItem value={"admin"}>Admin</MenuItem>
                  </Select>
                  {errors.role && (
                    <FormHelperText>{errors.role?.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Select subject */}
              <Grid item xs={12}>
                <Autocomplete
                  id="edit-staff-select-elective-subject"
                  options={
                    loadingSubjectsState
                      ? [{ _id: "loading", name: loadingSubjectsState }]
                      : fetchedSubjects?.filter(
                        (item) => watch("subjectId") !== item._id
                      ) || []
                  }
                  getOptionLabel={(option: any) =>
                    option?.name?.toUpperCase() || ""
                  }
                  value={fetchedSubjects.find((s) => s._id === watch("subjectId")) || null}
                  onChange={handleElectiveSubjectChange}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Assign Subject${watch("role") === "teacher" ? "" : " (Optional)"}`}
                      variant="outlined"
                      placeholder="Select a subject to assign"
                      error={!!errors.subjectId}
                      helperText={errors.subjectId?.message}
                      required={watch("role") === "teacher"}
                    />
                  )}
                />
              </Grid>

              {/* userPermissions */}
              <Grid item xs={12}>
                <FormControl error={!!errors.userPermissions} fullWidth>
                  <Typography variant="subtitle1" gutterBottom>
                    Staff Permissions {watch("role") === "admin" ? <span style={{ color: "red" }}>*</span> : <span style={{ color: "text.secondary", fontSize: '0.85em' }}>(Optional)</span>}
                  </Typography>

                  <Box sx={{ p: 2, border: "1px solid", borderColor: errors.userPermissions ? "error.main" : "divider", borderRadius: 1, bgcolor: "background.paper" }}>
                    <Grid container spacing={2}>
                      {Object.entries(
                        userPermissions.reduce((acc, permission) => {
                          const [group] = permission.split(":");
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(permission);
                          return acc;
                        }, {} as Record<string, string[]>)
                      ).map(([group, permissions]) => {
                        const selectedPermissions = watch("userPermissions") || [];
                        const isAllSelected = permissions.every((p) => selectedPermissions.includes(p));
                        const isIndeterminate = permissions.some((p) => selectedPermissions.includes(p)) && !isAllSelected;

                        const handleGroupToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
                          event.stopPropagation();
                          let newSelected = [...selectedPermissions];
                          if (isAllSelected) {
                            newSelected = newSelected.filter((p) => !permissions.includes(p));
                          } else {
                            permissions.forEach((p) => {
                              if (!newSelected.includes(p)) newSelected.push(p);
                            });
                          }
                          setValue("userPermissions", newSelected, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        };

                        return (
                          <Grid item xs={12} md={6} key={group}>
                            <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:before': { display: 'none' }, overflow: 'hidden' }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <FormControlLabel
                                  onClick={(event) => event.stopPropagation()}
                                  onFocus={(event) => event.stopPropagation()}
                                  control={
                                    <Checkbox
                                      checked={isAllSelected}
                                      indeterminate={isIndeterminate}
                                      onChange={handleGroupToggle}
                                    />
                                  }
                                  label={<Typography fontWeight="bold">{group.replace(/_/g, ' ')}</Typography>}
                                />
                              </AccordionSummary>
                              <AccordionDetails sx={{ pt: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {permissions.map((permission) => {
                                  const isSelected = selectedPermissions.includes(permission);
                                  const handlePermissionToggle = () => {
                                    let newSelected = [...selectedPermissions];
                                    if (isSelected) {
                                      newSelected = newSelected.filter((p) => p !== permission);
                                    } else {
                                      newSelected.push(permission);
                                    }
                                    setValue("userPermissions", newSelected, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                  };

                                  return (
                                    <FormControlLabel
                                      key={permission}
                                      control={
                                        <Checkbox
                                          checked={isSelected}
                                          onChange={handlePermissionToggle}
                                          size="small"
                                        />
                                      }
                                      label={permission.split(":")[1].replace(/_/g, ' ')}
                                      sx={{ ml: 4 }}
                                    />
                                  );
                                })}
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                  {errors.userPermissions && (
                    <FormHelperText>{errors.userPermissions?.message as string}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Divider sx={{ mb: 3 }} />
                <Box display="flex" gap={2} justifyContent={"flex-end"}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => router.back()}
                    sx={{ px: 4, py: 1, borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={!isValid || loading}
                    sx={{ px: 4, py: 1, borderRadius: 2 }}
                  >
                    Update Staff
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
