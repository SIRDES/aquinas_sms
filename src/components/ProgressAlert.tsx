import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Alert, { AlertColor } from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import { SnackbarType } from "@/types/commonTypes";

export default function ProgressAlert({
  message,
  open,
  setOpen,
  severity,
  redirect,
}: {
  message: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<SnackbarType>>;
  severity?: AlertColor;
  redirect?: string;
}) {
  const router = useRouter();
  const handleClose = () => {
    if (severity === "success" && redirect) {
      router.push(`/${redirect}`);
    }
    setOpen((prev: SnackbarType) => ({ ...prev, open: false }));
  };

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 5 }}
        open={open}
        // onClick={handleClose}
      >
        <Alert
          severity={severity}
          //  icon={<FontAwesomeIcon icon={faCircleCheck} style={{color: theme.palette.success.main}} />}
          action={
            <IconButton aria-label="close" size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          }
          sx={{ backgroundColor: "#535151", color: "#fff" }}
        >
          {message}
        </Alert>
      </Backdrop>
    </div>
  );
}
