import Button from "@mui/material/Button";
import { Dispatch, SetStateAction } from "react";

import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import {
  Backdrop,
  Box,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

export default function ConfirmationDialog({
  open,
  setOpen,
  message,
  title,
  handleConfirmation,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  message: string;
  title: string | undefined;
  handleConfirmation: () => void;
}) {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleOTPModalClose = () => {
    setOpen(false);
  };

  return (
    <Backdrop
      aria-labelledby="confirmation-dialog"
      open={open}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Box
        component={Paper}
        sx={{ minHeight: "25vh", width: isMobile ? "90vw" : "45vw" }}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{ px: isMobile ? 1 : 2 }}
        >
          <Typography fontWeight={700}>{title && title}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleOTPModalClose}
            sx={{
              // position: "absolute",
              // right: 8,
              // top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box
          sx={{
            p: isMobile ? 1 : 2,
          }}
        >
          <Typography gutterBottom align="center" mb={4}>
            {message}
          </Typography>
          <Box display={"flex"} justifyContent={"center"}>
            <Button
              variant="outlined"
              onClick={handleConfirmation}
              sx={{
                width: "100px",
              }}
            >
              YES
            </Button>
          </Box>
        </Box>
      </Box>
    </Backdrop>
  );
}
