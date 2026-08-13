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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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


function UploadPreview(props: any) {
    const { open, handleClose, rows, handleDeleteRow } = props;
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarType>({
        open: false,
        message: "",
        severity: undefined,
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [drugExistErrors, setDrugExistErrors] = useState([]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleCancel = () => {
        handleClose();
        setDrugExistErrors([]);
    };
    const handleSubmit = async () => {
        setLoading(true);
        setDrugExistErrors([]);
        // console.log("final upload rows", rows);

        try {
            let drugErrorList = [];
            rows.forEach(async (row: any) => {
                // const drugRef = doc(
                //     db,
                //     "medicines",
                //     row.DRUG_DESCRIPTION.toUpperCase()
                // );
                // const drugSnap = await getDoc(drugRef);
                // if (drugSnap.exists()) {
                //     drugErrorList.push(
                //         `Drug ${row.DRUG_DESCRIPTION.toUpperCase()} already exist`
                //     );
                //     return;
                // }
                // await setDoc(
                //     drugRef,
                //     {
                //         DRUG_DESCRIPTION: row.DRUG_DESCRIPTION.toUpperCase(),
                //         UNIT: row.UNIT.toUpperCase(),
                //         actualStock: Number(row.STOCK),
                //         currentStock: Number(row.STOCK),
                //         createdAt: new Date(),
                //         addedBy: [
                //             {
                //                 actor: `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`,
                //                 actorId: user.uid,
                //                 role: user.role.toUpperCase(),
                //                 reason: "Added Drug to the system",
                //                 date: new Date(),
                //             },
                //         ],
                //         lastModifiedAt: "",
                //         modifiedBy: [
                //         ],
                //     },
                //     { merge: true }
                // );
            });
            // setDrugExistErrors(drugErrorList);
            // await addToAuditTrail({
            //     user,
            //     reason: `Added ${rows.length - drugErrorList.length} new drug`,
            // });
            handleCancel();
            setSnackbar({
                open: true,
                message: "Drugs uploaded successfully",
                severity: "success",
            });
        } catch (e: any) {
            setSnackbar({
                open: true,
                message:
                    e.message || "An error occurred. Try again",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <ProgressAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                setOpen={setSnackbar}
            // redirect="/students"
            />

            <Modal
                open={open}
                onClose={handleCancel}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <Box minWidth="48%" maxWidth={"90%"} maxHeight={"98%"} component={Paper} borderRadius={2} overflow={"scroll"}>
                    <Grid container p={2} sx={{ display: "flex", gap: "20px" }}>
                        <Grid
                            item
                            xs={12}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="h6">
                                MULTIPLE STUDENTS UPLOAD PREVIEW
                            </Typography>
                            <IconButton onClick={handleCancel}>
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                        {drugExistErrors && (
                            <Grid item container xs={12}>
                                {drugExistErrors.map((error) => (
                                    <Typography key={error} sx={{ color: "#ff1744" }}>
                                        {error}
                                        <span style={{ color: "#000", fontSize: "20px" }}>
                                            ;{" "}
                                        </span>{" "}
                                    </Typography>
                                ))}
                            </Grid>
                        )}

                        {/* Preview Table */}
                        <Paper sx={{ width: "100%", overflow: "scroll" }}>
                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table
                                    stickyHeader
                                    aria-label="multiple drug upload table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell color="primary">
                                                Name
                                            </StyledTableCell>
                                            <StyledTableCell align="center">UNIT</StyledTableCell>
                                            <StyledTableCell align="center">STOCK</StyledTableCell>
                                            <StyledTableCell align="center"></StyledTableCell>
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
                                                            "&:last-child td, &:last-child th": { border: 0 },
                                                        }}
                                                    >
                                                        <StyledTableCell>
                                                            {row["FULL NAME OF TEACHER"]?.toUpperCase()}
                                                        </StyledTableCell>

                                                        <StyledTableCell align="center">
                                                            {row.UNIT?.toUpperCase()}
                                                        </StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            {row.STOCK}
                                                        </StyledTableCell>
                                                        <StyledTableCell
                                                            align="center"
                                                            onClick={() => handleDeleteRow(index)}

                                                        >
                                                            <DeleteForeverIcon fontSize="small" sx={{ color: "#ff1744", cursor: "pointer" }} />

                                                        </StyledTableCell>
                                                    </StyledRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 100]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />

                        </Paper>

                        <Grid
                            item
                            container
                            xs={12}
                            sx={{ display: "flex", justifyContent: "flex-end", gap: "60px" }}
                        >
                            <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                onClick={handleCancel}
                            >
                                cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                disabled={loading ? true : false}
                                size="small"
                                onClick={handleSubmit}
                            >
                                {loading ? "adding..." : "confirm"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}

export default UploadPreview;