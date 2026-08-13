"use client";
import { use, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  Typography,
  Button,
  MenuItem,
  TextField,
  Grid,
  Card,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, object, ref, string } from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { showAlert } from "@/components/Alerts";
import LoadingAlert from "@/components/LoadingAlert";
import { resetUserPassword } from "@/utils/serverActions/user";
import { useSession } from "next-auth/react";

// import { DevTool } from "@hookform/devtools";


const schema = object().shape({
  adminPassword: string().required("Your password is required"),
  password: string().required("Password is required"),
  confirmPassword: string().oneOf(
    [ref("password"), undefined],
    "Passwords must match"
  ),
});

type FormData = InferType<typeof schema>;

export default function ResetUserPassword({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const currentuser = session?.user;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [selectedImages, setSelectedImages] = useState<FileType[] | null>(null);
  const form = useForm({
    defaultValues: {
      //   unitPrice: "",
      //   totalStock: "",
    },
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };


  const Submit = async (dat: FormData) => {
    console.log("formData", dat);
    if (dat.password !== dat?.confirmPassword) {
      showAlert({
        title: "Error",
        text: "Passwords do not match",
        severity: "error",
      });
      return
    }
    setLoading(true);
    try {
      const res = await resetUserPassword({ userId: id, adminPassword: dat.adminPassword, password: dat.password });
      if (!res?.success) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred while resetting password",
          severity: "error",
        })
        return;
      }
      showAlert({
        title: "Success",
        text: "Password reset successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.back()
        }
      })
    } catch (error: any) {
      console.log("add user error", error);
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred while resetting password",
        severity: "error",
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />

      <Box px={{ xs: 1, sm: 2, md: 3 }} py={4}>
        <Card sx={{ p: 2 }}>

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
            <Typography fontWeight="bold">Enter details below</Typography>

            <Grid container spacing={3} alignItems={"flex-start"}>
              {/* aDMIN password */}
              <Grid item xs={12} sm={12} md={4}>
                <Box>
                  <Typography gutterBottom>
                    Your current password
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your current password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? 'hide the password' : 'display the password'
                            }
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "6px",
                        paddingTop: "7px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("adminPassword", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors.adminPassword?.message}
                  </Typography>
                </Box>
              </Grid>

              {/* password */}
              <Grid item xs={12} sm={12} md={4}>
                <Box>
                  <Typography gutterBottom>
                    Password{" "}
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? 'hide the password' : 'display the password'
                            }
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "6px",
                        paddingTop: "7px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("password", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors.password?.message}
                  </Typography>
                </Box>
              </Grid>
              {/* confirm password */}
              <Grid item xs={12} sm={12} md={4}>
                <Box>
                  <Typography gutterBottom>
                    Confirm password{" "}
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="confirm password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? 'hide the password' : 'display the password'
                            }
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: {
                        border: "2px solid #ABB3BF",
                        padding: "6px",
                        paddingTop: "7px",
                        borderRadius: "5px",
                      },
                    }}
                    {...register("confirmPassword", { required: true })}
                  />
                  <Typography color="error" variant="subtitle2">
                    {errors?.confirmPassword?.message}
                  </Typography>
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
        </Card>
      </Box>
    </>
  );
}
