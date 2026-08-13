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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ProgressAlert from "@/components/ProgressAlert";
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


function AddMultiplePlacementCSVPreview(props: any) {
    const { open, handleClose, rows, handleDeleteRow, previewModalTitle, handleSubmit } = props;
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

    const handleCancel = (event: React.SyntheticEvent, reason: string) => {
        handleClose(event, reason);
        setDrugExistErrors([]);
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
                                {previewModalTitle}
                            </Typography>
                            <IconButton onClick={(event) => handleCancel(event, "close")}>
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
                                                Index
                                            </StyledTableCell>
                                            <StyledTableCell>Name</StyledTableCell>
                                            <StyledTableCell>Aggregate</StyledTableCell>
                                            <StyledTableCell>Programme</StyledTableCell>
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
                                                            "&:last-child td, &:last-child th": { border: 0 },
                                                        }}
                                                    >
                                                        <StyledTableCell>
                                                            {row?.Index}
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            {row?.Name}
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            {row?.Aggregate}
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            {row?.Programme}
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
                                onClick={(event) => handleCancel(event, "cancel")}
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

export default AddMultiplePlacementCSVPreview;