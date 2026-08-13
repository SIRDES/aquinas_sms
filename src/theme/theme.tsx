"use client";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    // mode: "light",
    primary: { main: "#0100a3", light: "#2a4576" },
    secondary: {
      main: "#4698CA",
    },
    text: {
      primary: "#151515",
      secondary: "#605A5A",
      disabled: "#647081",
    },
    success: {
      main: "#11B8A4",
      light: "#F8FAFF",
    },
    background: {
      default: "#F2FAFF",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontWeightBold: 700,

    // button: {
    //   fontSize: { xs: "14px", sm: "16px", md: "18px", lg: "10px" },
    // },
    subtitle2: {
      fontWeight: 600,
      // lineHeight: 2,
    },
    body2: {
      fontSize: "18px",
      fontWeight: 500,
      // lineHeight: 2,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "--TextField-brandBorderColorDisabled": "#E0E3E7",
          "--TextField-brandBorderHoverColor": "#0100a3",
          "--TextField-brandBorderFocusedColor": "#0100a3",
          borderRadius: "20px",
          "& label.Mui-focused": {
            color: "var(--TextField-brandBorderFocusedColor)",
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          "&:before": {
            border: "none",
          },
          "&:hover:not(.Mui-disabled, .Mui-error):before": {
            border: "none",
          },
          "&.Mui-focused:after": {
            border: "none",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // color: "#fff",
          // background: "linear-gradient(90deg, #00276E 2.59%, #560EB3 100%)",
          // borderRadius: "20px",
          textTransform: "none",
          // padding: "8px",
          "&:hover:not(.Mui-disabled, .Mui-error)": {
            // color: "#fff",
            // background: "linear-gradient(90deg, #00276E 2.59%, #560EB3 100%)",
          },
          "&.Mui-disabled": {
            background: "#ABB3BF",
            color: "#fff",
          },
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
