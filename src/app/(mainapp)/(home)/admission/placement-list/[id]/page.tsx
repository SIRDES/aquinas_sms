"use client";
import {
  Box,
  Button,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import React, {
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import LoadingAlert from "@/components/LoadingAlert";

// import ProgressAlert from "@/components/ProgressAlert";
// import SaveIcon from "@mui/icons-material/Save";
// import ClearIcon from "@mui/icons-material/Clear";
// import { SnackbarType, SubjectType } from "@/types/commonTypes";
import Link from "next/link";
import { useBatchesContext } from "@/context/BatchesContext";
import { formatPhoneNumber, formatPhoneNumberIntl } from "react-phone-number-input";

import ConfirmationDialog from "@/components/ConfirmationDialog";
// import ActionStatusAlert from "@/components/ActionStatusAlert";
import { deletePlacedStudent, getPlacedStudentById } from "@/utils/serverActions/placedStudent";
import { showAlert } from "@/components/Alerts";
import StudentAdmissionLetter from "@/components/adminssion/StudentAdmissionLetter";
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";
import StudentPersonalRecordForm from "@/components/adminssion/StudentPersonalRecordForm";
import ParentalCommitmentForm from "@/components/adminssion/ParentalConsentForm";


export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const theme = useTheme();
  const router = useRouter();
  const { id } = use(params);
  const { adminSettings } = useBatchesContext();
  const [studentData, setStudentData] = useState<any>({});
  const [openConfirmSendSMS, setOpenConfirmDeleteStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [studentName, setStudentName] = useState<string | null>(null);

  const fetchStudentsData = async () => {
    setLoading(true);
    setStudentData({});
    try {
      const res = await getPlacedStudentById(id);
      // console.log("res", res);
      if (res?.success === false) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred, please try again",
          severity: "error",
        })
        return;
      }

      setStudentData(res?.data);
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred, please try again",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminSettings === undefined) return;
    fetchStudentsData();
  }, [adminSettings, id]);

  const handleActionBtnClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionAnchorEl(event.currentTarget);
  };
  const handleActionClose = () => {
    setActionAnchorEl(null);
  };
  useEffect(() => {
    if (studentData) {
      setStudentName(`${studentData?.firstName ? studentData?.firstName?.toUpperCase() : ""}_${studentData?.lastName ? studentData?.lastName?.toUpperCase() : ""}`);
    }
  }, [studentData]);
  const handleSaveStudentPersonalRecordForm = async () => {
    setLoading(true);
    const blob = await pdf(<StudentPersonalRecordForm data={studentData} />).toBlob();
    setLoading(false);
    saveAs(blob, `${studentName}_data_form.pdf`);
  };
  const handleSaveAdmissionLetter = async () => {
    setLoading(true);
    const blob = await pdf(<StudentAdmissionLetter data={{ ...studentData, adminSettings }} />).toBlob();
    saveAs(blob, `${studentName}_admission_letter.pdf`);
    setLoading(false);
  };


  const handleSaveParentalConsentForm = async () => {
    setLoading(true);
    const blob = await pdf(<ParentalCommitmentForm data={{ ...studentData, adminSettings }} />).toBlob();
    setLoading(false);
    saveAs(blob, `${studentName}_parental_consent.pdf`);
  };
  const handleDeleteStudent = async () => {
    setOpenConfirmDeleteStudent(false);
    try {
      setLoading(true);
      const res = await deletePlacedStudent(id);
      if (res?.success === false) {
        showAlert({
          title: "Error",
          text: res?.message || "An error occurred, please try again",
          severity: "error",
        })
        return;
      }
      showAlert({
        title: "Success",
        text: "Student deleted successfully",
        severity: "success",
        handleConfirmButtonClick: () => {
          router.push("/admission");
        }
      })
    } catch (error: any) {
      showAlert({
        title: "Error",
        text: error?.message || "An error occurred, please try again",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />
      {/* <ActionStatusAlert
        open={actionStatus.open}
        message={actionStatus.message}
      /> */}
      {/* <ProgressAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setOpen={setSnackbar}
      // redirect="/charities"
      /> */}
      <ConfirmationDialog
        open={openConfirmSendSMS}
        setOpen={setOpenConfirmDeleteStudent}
        message="Are you sure you want to delete this student?"
        title="Delete student"
        handleConfirmation={handleDeleteStudent}
      />
      <Box mb={10}>
        <Box
          display="flex"
          justifyContent="space-between"
          mb={1}
          mt={1}
          px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Typography
            variant="h6"
          // gutterBottom
          >
            <Link
              href={""}
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              style={{ textDecoration: "none", color: "#2C7873" }}
            >
              Placement List
            </Link>{" "}
            / student details
          </Typography>
          {Object.keys(studentData).length !== 0 && (
            <Box display={"flex"} gap={1}>
              <Button
                variant="contained"
                size="small"
                onClick={handleActionBtnClick}
              >
                Action
              </Button>
              <Menu
                id="menu-action"
                anchorEl={actionAnchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(actionAnchorEl)}
                onClose={handleActionClose}
              >
                <Button
                  component={Link}
                  href={`/admission/placement-list/${id}/edit`}
                  sx={{ fontSize: "16px" }}
                // size="small"
                // onClick={handleEdit}
                // startIcon={<EditIcon />}
                >
                  Edit
                </Button>


                <MenuItem
                  sx={{ fontSize: "16px" }}
                  onClick={() => {
                    handleActionClose();
                    handleSaveAdmissionLetter();
                  }}
                >
                  Admission Letter (PDF)
                </MenuItem>
                <MenuItem
                  sx={{ fontSize: "16px" }}
                  onClick={() => {
                    handleActionClose();
                    handleSaveStudentPersonalRecordForm();
                  }}
                >
                  Person Details (PDF)
                </MenuItem>
                <MenuItem
                  sx={{ fontSize: "16px" }}
                  onClick={() => {
                    handleActionClose();
                    handleSaveParentalConsentForm();
                  }}
                >
                  Parental Consent (PDF)
                </MenuItem>

                <MenuItem
                  sx={{ fontSize: "16px", color: "red" }}
                  onClick={() => {
                    handleActionClose();
                    setOpenConfirmDeleteStudent(true);
                  }}
                >
                  Delete Student
                </MenuItem>

              </Menu>
            </Box>

          )}
        </Box>
        <Divider />
        <Box
          sx={{
            px: { xs: 1, sm: 2, md: 4 },
            mb: 2,
            mt: 3,
          }}
        >
          {Object.keys(studentData).length !== 0 && (
            <>
              <Grid container spacing={2} mb={3}>
                {/* Index number */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Index Number:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.beceIndexNumber}
                  </Typography>
                </Grid>
                {/* Admission code number */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Admission code:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.admissionCode || "N/A"}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.firstName}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Gender:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.gender}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Programme:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.admissionProgramme}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Aggregate:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.aggregate}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Date of birth:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {new Date(studentData?.dob).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Place of birth:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.placeOfBirth?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Nationality:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.nationality?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Religion:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.religion?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Denomination:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.religiousDenomination?.toUpperCase()}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Raw score:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.rawScore}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Enrolment code:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.csspsEnrolmentCode}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">JHS:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.jhsAttended?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">JHS type:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.jhsType?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Interests:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.interests?.toUpperCase() || "None"}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Awards:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.schoolAwards?.toUpperCase() || "None"}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Positions held:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.positionsHeld?.toUpperCase() || "None"}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Address:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.permanentAddress?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Town:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.town?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Town:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.town?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Region:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.region?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">District:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.district?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Father's first name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.fatherFirstName?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Father's last name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.fatherLastName?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Father's occupation:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.fatherOccupation?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Mother's first name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.motherFirstName?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Mother's last name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.motherLastName?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Mother's occupation:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.motherOccupation?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Guardian first name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.parentFirstName?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Guardian last name:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.parentLastName?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Guardian email:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {studentData?.parentEmail?.toLowerCase()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Guardian phone number:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {formatPhoneNumber(studentData?.parentPhoneNumber)}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Typography variant="body1">Guardian Alt. phone number:</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {formatPhoneNumber(studentData?.parentAltPhoneNumber) || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
