"use client";
import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";
import { ELECTION_USER_TYPE } from "@/utils/constants";
import { useAwards } from "@/hooks/useAwards";
import { showAlert } from "@/components/Alerts";
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME;

const schema = Yup.object().shape({
  email: Yup.string().required(),
  password: Yup.string().required(),
});
export type FormData = Yup.InferType<typeof schema>;

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const { award } = useAwards();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const form = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    // control,
  } = form;
  // selectedElectiveSubjects
  // const { onChange, onBlur, name, ref } = register("phoneNumber");

  const Submit = async (dat: FormData) => {
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email: dat.email,
        password: dat.password,
        callbackUrl: "/dashboard",
        user_type: userType,
        redirect: false,
      });
      if (res?.error === null) {
        router.push("/dashboard");
      } else {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.error || "An error occurred",
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

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session?.status, router]);

  if (session?.status === "loading") {
    return <LoadingAlert open={true} />;
  }

  return (
    <>
      <LoadingAlert open={loading} />
      {/* <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
      /> */}
      <Box
        height={"100vh"}
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          backgroundColor: theme.palette.primary.main,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h5"
          textAlign={"center"}
          color="white"
          gutterBottom
        >
          {COMPANY_NAME}
        </Typography>
        <Box sx={{ mx: "auto", width: { xs: "100%", sm: "80%", md: "40%" } }}>
          <Card
            component={"form"}
            onSubmit={handleSubmit(Submit)}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              // justifyContent: "center",
              // alignItems: "center",
              borderRadius: "2px",
              boxShadow: "0px 4px 30px 0px #00000012",
              gap: "30px",
              color: theme.palette.text.primary,
              p: { xs: 2, sm: 4 },
            }}
          >
            <Typography
              variant="h5"
              textAlign={"center"}
              color={theme.palette.primary.main}
              sx={{ fontWeight: 700 }}
              // gutterBottom
            >
              SIGN IN {userType === ELECTION_USER_TYPE && "AS A NOMINEE"}
            </Typography>
            {/* Email */}
            <Box>
              <Typography gutterBottom variant="body1" color="primary">
                {userType === ELECTION_USER_TYPE ? "Nominee ID" : "Email"}
              </Typography>
              <TextField
                fullWidth
                type={userType === ELECTION_USER_TYPE ? "text" : "email"}
                variant="standard"
                placeholder={
                  userType === ELECTION_USER_TYPE
                    ? "Enter your nominee ID"
                    : "Enter your email address"
                }
                inputProps={{
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "6px",
                    paddingTop: "7px",
                    borderRadius: "5px",
                  },
                }}
                {...register("email", { required: true })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.email?.message}
              </Typography>
            </Box>
            {/* Password */}
            <Box>
              <Typography gutterBottom variant="body1" color="primary">
                Password
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                type="password"
                placeholder="Enter your password"
                inputProps={{
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "6px",
                    paddingTop: "7px",
                    borderRadius: "5px",
                  },
                }}
                {...register("password", { required: true })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.password?.message}
              </Typography>
            </Box>

            <Box>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={!isDirty || !isValid}
                sx={{ padding: "7px", mb: 1 }}
              >
                sign In
              </Button>
              {/* {!award?.isSuspended && userType !== ELECTION_USER_TYPE && (
                <Button
                  variant="text"
                  type="button"
                  fullWidth
                  onClick={() => setUserType(ELECTION_USER_TYPE)}
                >
                  sign In as a nominee
                </Button>
              )} */}
            </Box>
          </Card>
        </Box>
      </Box>
    </>
  );
}
