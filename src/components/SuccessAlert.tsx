import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Backdrop,
  Box,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

export default function SuccessDialog({
  open,
  name,
  serialNumber,
  programme,
  email,
  title,
  subject,
  handleNew,
  handleClose,
}: {
  open: boolean;
  title: string;
  name: string;
  email?: string;
  serialNumber?: string;
  programme?: string;
  subject?: string;
  handleNew?: () => void;
  handleClose: () => void;
}) {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Backdrop
      aria-labelledby="success-dialog"
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
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {/* <IconButton
            aria-label="close"
            onClick={handleOTPModalClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton> */}
        </Box>
        <Divider />
        <Box
          sx={{
            p: isMobile ? 1 : 2,
          }}
        >
          <Box mb={2}>
            <Typography variant="body1" gutterBottom align="center">
              Name: {name.toUpperCase()}
            </Typography>
            {email && (
              <Typography variant="body1" gutterBottom align="center">
                Email: {email}
              </Typography>
            )}

            {programme && (
              <Typography variant="body1" gutterBottom align="center">
                Programme: {programme.toUpperCase()}
              </Typography>
            )}
            {subject && (
              <Typography variant="body1" gutterBottom align="center">
                subject: {subject.toUpperCase()}
              </Typography>
            )}

            {serialNumber && (
              <Typography variant="body1" gutterBottom align="center">
                serialNumber: {serialNumber}
              </Typography>
            )}
          </Box>
          <Box display={"flex"} justifyContent={"center"} gap={2}>
            {handleNew && (
              <Button
                variant="outlined"
                size="small"
                color="success"
                onClick={handleNew}
                sx={{
                  width: "100px",
                }}
              >
                New
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              // color="success"
              onClick={handleClose}
              sx={{
                width: "100px",
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Box>
    </Backdrop>
  );
}
