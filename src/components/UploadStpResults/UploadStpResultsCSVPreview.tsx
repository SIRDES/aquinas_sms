import {
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { SnackbarType } from "@/types/commonTypes";
import ProgressAlert from "../ProgressAlert";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PermissionGuard from "../PermissionGuard";
import { USER_PERMISSIONS } from "@/utils/common";
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "9px 8px",

  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledRow = styled(TableRow)({
  // borderBottom: "10px solid #e8e8e8",
  "&.MuiTableRow-hover:hover": {
    backgroundColor: "#CEE0F0",
  },
});

function UploadStpResultsCSVPreview(props: any) {
  const {
    open,
    handleClose,
    rows,
    handleDeleteRow,
    handleSubmit,
    isNewCurrilculum,
    isLoadingRows,
  } = props;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(1000);
  //   const [drugExistErrors, setDrugExistErrors] = useState([]);
  console.log("final upload rows>>>>>>>>>", rows);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleCancel = (event: React.SyntheticEvent, reason: string) => {
    handleClose(event, reason);

    // setDrugExistErrors([]);
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleCancel}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          minWidth="48%"
          maxWidth={"90%"}
          maxHeight={"98%"}
          component={Paper}
          borderRadius={2}
          overflow={"scroll"}
        >
          <Grid container p={2} sx={{ display: "flex", gap: "4px" }}>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Upload results</Typography>
              <IconButton onClick={(event) => handleCancel(event, "close")}>
                <CloseIcon />
              </IconButton>
            </Grid>

            {isLoadingRows && (
              <Grid item container xs={12}>
                <Typography variant="h6" align="center">
                  Loading rows...
                </Typography>
              </Grid>
            )}

            {/* Preview Table */}

            {!isLoadingRows && (
              <Box sx={{ width: "100%", overflow: "scroll" }}>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader aria-label="multiple drug upload table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell color="primary">
                          CassRefID
                        </StyledTableCell>
                        <StyledTableCell>Student Name</StyledTableCell>
                        <StyledTableCell>Score</StyledTableCell>
                        <StyledTableCell>Overall</StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows &&
                        rows
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((row: any, index: number) => (
                            <StyledRow
                              hover
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >

                              <StyledTableCell>
                                {row?.["CassRefID"]}
                              </StyledTableCell>
                              <StyledTableCell>
                                {row?.["Name"]}
                              </StyledTableCell>


                              <StyledTableCell align="center">
                                {row?.["Score"]}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {row?.["OverallScore"]}
                              </StyledTableCell>

                              <StyledTableCell
                                align="center"
                                onClick={() => handleDeleteRow(index)}
                              >
                                <DeleteForeverIcon
                                  fontSize="small"
                                  sx={{ color: "#ff1744", cursor: "pointer" }}
                                />
                              </StyledTableCell>
                            </StyledRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100, 1000]}
                  component="div"
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            )}
            {!isLoadingRows && (
              <Grid
                item
                container
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "60px",
                }}
              >
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={(event) => handleCancel(event, "cancel")}
                >
                  cancel
                </Button>
                <PermissionGuard requiredPermission={USER_PERMISSIONS.EXAMS_UPLOAD_SCORE}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={isLoadingRows ? true : false}
                    size="small"
                    onClick={handleSubmit}
                  >
                    {isLoadingRows ? "adding..." : "confirm"}
                  </Button>
                </PermissionGuard>
              </Grid>
            )}
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}

export default UploadStpResultsCSVPreview;
