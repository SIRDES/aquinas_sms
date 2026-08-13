"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType, StudentType } from "@/types/commonTypes";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
    Autocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    Box,
    Button,
    Card,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
    ForwardedRef,
    LegacyRef,
    SyntheticEvent,
    forwardRef,
    use,
    useEffect,
    useRef,
    useState,
} from "react";

import { useBatchesContext } from "@/context/BatchesContext";
import Tooltip from "@mui/material/Tooltip";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

// import ReactToPrint, { useReactToPrint } from "react-to-print";
import Link from "next/link";
import * as XLSX from "xlsx";
import { CustomizedSelect } from "@/components/CustomizedSelect";

import Image from "next/image";
import dynamic from "next/dynamic";
import axios from "axios";
import { getAllProgrammes } from "@/utils/serverActions/programme";
import { getAllClasses } from "@/utils/serverActions/classes";
import { getAllPlacedStudents } from "@/utils/serverActions/placedStudent";


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: "9px 8px",
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 14,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
        border: 0,
    },
    "&:hover": {
        cursor: "pointer",
    },
}));

const statuses = [
    {
        id: 1, name: "Started", value: "started"
    },
    {
        id: 2, name: "Placed", value: "placed"
    },
    {
        id: 3, name: "Completed", value: "completed"
    },
]
export default function PlacementList() {
    const theme = useTheme();
    const router = useRouter();
    // const { form } = use(params);
    const { selectedBatch, fetchedBatches, adminSettings } = useBatchesContext();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // const [selectedStudent, setSelectedStudent] = useState<any>();
    const [generatReport, setGenerateReport] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [sortAsc, setSortAsc] = useState(false);
    const [sortAmountAsc, setSortAmountAsc] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarType>({
        open: false,
        message: "",
        severity: undefined,
    });
    const [fetchedStudents, setFetchedStudents] = useState<any>(null);
    const [students, setStudents] = useState<Array<StudentType>>([]);
    const [excelData, setExcelData] = useState<Array<any>>([]);
    const [reportData, setReportData] = useState<Array<any>>([]);
    const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(
        null
    );

    const [programmes, setProgrammes] = useState<Array<any>>([]);
    const [classes, setClasses] = useState<Array<any>>([]);
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    const fetchStudentsData = async () => {
        setLoading(true);
        setFetchedStudents([]);
        setStudents([]);
        // console.log(selectedBatch)
        // console.log("admission", adminSettings);
        try {
            const responseData = await getAllPlacedStudents(adminSettings?.admissionDetails?.admissionYear || "");
            // console.log("students responseData", responseData);

            if (!responseData.success) {
                setSnackbar({
                    open: true,
                    message: responseData.message,
                    severity: "error",
                });
                return;
            }
            if (responseData?.data?.length === 0) {
                setSnackbar({
                    open: true,
                    message: "No Students found",
                    severity: "error",
                });
                return;
            }
            console.log("responseData", responseData?.data);
            setFetchedStudents(responseData?.data || []);
            setStudents(responseData?.data || []);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || error.data || "An error occurred",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // console.log(selectedBatch);
    useEffect(() => {
        // fetchStudentsData();
        // console.log("adminSettings", adminSettings)
        if (!adminSettings) return;
        fetchStudentsData();
    }, [adminSettings]);

    const fetchProgrammes = async () => {
        setProgrammes([]);
        try {
            const response = await getAllProgrammes();
            if (response.status === "error") return;
            setProgrammes(response?.data || []);
        } catch (error: any) {
            // console.log("error", error);
        }
    };


    useEffect(() => {
        fetchProgrammes();
    }, []);
    const handleSortByIDAsc = () => {
        const sortedStudents = students.sort((a: StudentType, b: StudentType) => {
            const studentA = a.studentId.split("/")[1];
            const studentB = b.studentId.split("/")[1];
            if (sortAsc) {
                if (studentA > studentB) return -1;
                else if (studentA < studentB) return 1;
                return 0;
            } else {
                if (studentA < studentB) return -1;
                else if (studentA > studentB) return 1;
                return 0;
            }
        });
        setStudents(sortedStudents);
        setSortAsc((prev) => !prev);
    };

    const handleSearchByName = (e: any) => {
        const value = e.target.value;
        const filteredStudents = fetchedStudents.filter(
            (student: any) =>
                `${student?.firstName?.toUpperCase()} ${student?.lastName?.toUpperCase()}`
                    .toLowerCase()
                    .includes(value.toLowerCase()) ||
                student?.beceIndexNumber.includes(value)
        );
        setStudents(filteredStudents);
    };

    const handleSearchByProgramme = (
        event: SyntheticEvent<Element, Event>,
        value: any,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<any> | undefined
    ) => {
        // const value = e.target.value;
        // console.log(value, reason, details);
        if (reason === "clear" || value === null) {
            setStudents(fetchedStudents);
            return;
        }
        // console.log(value);
        if (value?.name?.toUpperCase() === "AGRIC SCIENCE") {
            const filteredTeachers = fetchedStudents.filter((student: any) =>
                student?.admissionProgramme
                    .toLowerCase()
                    .includes(`AGRICULTURE`.toLowerCase())
            );
            setStudents(filteredTeachers);
            return;
        }
        const filteredTeachers = fetchedStudents.filter((student: any) =>
            student?.admissionProgramme
                .toLowerCase()
                .includes(value?.name.toLowerCase())
        );
        setStudents(filteredTeachers);
    };

    const handleSearchByStatus = (
        event: SyntheticEvent<Element, Event>,
        value: any,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<any> | undefined
    ) => {
        // const value = e.target.value;
        // console.log(value, reason, details);
        if (reason === "clear" || value === null) {
            setStudents(fetchedStudents);
            return;
        }
        // console.log(value);
        const filteredTeachers = fetchedStudents.filter((student: any) =>
            student?.status?.toLowerCase().includes(value?.name.toLowerCase())
        );
        setStudents(filteredTeachers);
    };
    const handleClick = (student: any) => {
        router.push(`/students/${student._id}`);
    };

    const handleDownloadBtnClick = (event: React.MouseEvent<HTMLElement>) => {
        setDownloadAnchorEl(event.currentTarget);
    };
    const handleDownloadClose = () => {
        setDownloadAnchorEl(null);
    };

    useEffect(() => {
        setExcelData(
            students.map((student: any) => ({
                "Bece Index": student?.beceIndexNumber,
                Name: `${student?.firstName} ${student?.lastName}`.toUpperCase()?.trim(),
                Aggregate: student?.aggregate,
                Programme: student?.admissionProgramme?.toUpperCase(),
                Status: student?.status?.toUpperCase(),
            }))
        );
    }, [students]);


    const handleExcelClick = () => {
        // setSelectedBatch(batch);
        handleDownloadClose();
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `admission_data.xlsx`);
    };

    // if (loading) return <LoadingAlert open={true} />;

    return (
        <>
            <LoadingAlert open={loading} />
            <ProgressAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                setOpen={setSnackbar}
            // redirect="/students"
            />
            <Box>

                <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    mb={2}
                    mt={2}
                // px={{ xs: 1, sm: 2, md: 3 }}
                >
                    <Box display={"flex"} gap={3}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search student"
                            onChange={handleSearchByName}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Autocomplete
                            id="filter-by-programme"
                            fullWidth
                            size="small"
                            options={programmes}
                            getOptionLabel={(option: any) => option?.name?.toUpperCase()}
                            // defaultValue={[top100Films[13]]}
                            onChange={handleSearchByProgramme}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField {...params} placeholder="programme" />
                            )}
                        />
                        <Autocomplete
                            id="filter-by-status"
                            fullWidth
                            size="small"
                            options={statuses}
                            getOptionLabel={(option: any) => option?.name?.toUpperCase()}
                            // defaultValue={[top100Films[13]]}
                            onChange={handleSearchByStatus}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField {...params} placeholder="status" />
                            )}
                        />
                        {/* <Select
              fullWidth
              displayEmpty
              input={<CustomizedSelect />}
              value={selectedPaymentType}
              onChange={filterByPaymentType}
            >
              <MenuItem value={"ALL"}>ALL</MenuItem>
              <MenuItem value={"FULL PAYMENT"}>FULL PAYMENT</MenuItem>
              <MenuItem value={"PART PAYMENT"}>PART PAYMENT</MenuItem>
            </Select> */}
                    </Box>
                    <Box>
                        <Button
                            variant="contained"
                            // size="small"
                            // startIcon={<AddIcon />}
                            onClick={handleDownloadBtnClick}
                            sx={{
                                borderRadius: "4px",

                                width: "fit-content",
                                color: "white",
                                fontWeight: 700,
                            }}
                        >
                            Action
                        </Button>
                        <Menu
                            id="menu-batch"
                            anchorEl={downloadAnchorEl}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            open={Boolean(downloadAnchorEl)}
                            onClose={handleDownloadClose}
                        >
                            {/* <MenuItem
                                component={Link}
                                href={`/admission/add-placement`}
                            >
                                Single
                            </MenuItem> */}
                            <MenuItem
                                component={Link}
                                href={`/admission/add-multiple-placement`}
                            >
                                Add Multiple
                            </MenuItem>
                            <MenuItem
                                onClick={handleExcelClick}
                            >
                                Data (EXCEL)
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
                <Divider />
                <Box mt={2} mb={4}>
                    <TableContainer component={Paper}>
                        <Table
                            stickyHeader
                            sx={{ minWidth: 650 }}
                            aria-label="students table"
                        >
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>
                                        Index No.{" "}
                                        {/* <Tooltip
                                            title={`Sort in ${sortAsc ? "descending" : "ascending"}`}
                                        >
                                            <ArrowUpwardIcon
                                                sx={{
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    marginLeft: "5px",
                                                    transition: "all 0.3s ease",
                                                    transform: sortAsc
                                                        ? "rotate(180deg)"
                                                        : "rotate(0deg)",
                                                }}
                                                onClick={handleSortByIDAsc}
                                            />
                                        </Tooltip> */}
                                    </StyledTableCell>
                                    <StyledTableCell>Name</StyledTableCell>
                                    <StyledTableCell align="center">
                                        Aggregate{" "}
                                        {/* <Tooltip title={`Sort amount`}>
                                            <ArrowUpwardIcon
                                                sx={{
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    marginLeft: "5px",
                                                }}
                                                onClick={handleSortAmount}
                                            />
                                        </Tooltip> */}
                                    </StyledTableCell>
                                    <StyledTableCell>Programme</StyledTableCell>
                                    <StyledTableCell>Status</StyledTableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students &&
                                    !!students.length &&
                                    students
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((student: any, index: number) => (
                                            <Link
                                                href={`/admission/placement-list/${student?._id}`}
                                                passHref
                                                legacyBehavior
                                                key={student?._id}
                                            >
                                                <StyledTableRow

                                                    // as="a"
                                                    // onClick={() => handleClick(student)}
                                                    // href={`/students/${student?._id}`}
                                                    style={{ textDecoration: "none", color: "inherit" }}
                                                // sx={{ cursor: "pointer" }}
                                                >
                                                    <StyledTableCell>
                                                        {student?.beceIndexNumber}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {`${student?.firstName
                                                            ? student?.firstName
                                                            : ""
                                                            } ${student?.lastName ? student?.lastName : ""
                                                            }`.trim().toUpperCase()}
                                                    </StyledTableCell>
                                                    <StyledTableCell align="center">
                                                        {student?.aggregate}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {student?.admissionProgramme}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {student?.status}
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            </Link>
                                        ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={students.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            </Box >
        </>
    );
}
