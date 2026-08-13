import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Typography } from "@mui/material";
export default function ActionStatusAlert({
  open,
  message,
}: {
  open: boolean;
  message: string;
}) {
  return (
    <div>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 5,
          display: "flex",
          flexDirection: "column",
          gap: "10px",

        }}
        open={open}
      >
        <CircularProgress />
        <Typography>{message}</Typography>
      </Backdrop>
    </div>
  );
}
