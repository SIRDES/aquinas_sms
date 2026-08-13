"use client";
// import ConfirmationDialog from "@/components/ConfirmationDialog";
// import LoadingAlert from "@/components/LoadingAlert";
// import ProgressAlert from "@/components/ProgressAlert";
// import { SnackbarType, StudentType } from "@/types/commonTypes";
// import AddIcon from "@mui/icons-material/Add";
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
// import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
// import SearchIcon from "@mui/icons-material/Search";
import {
    AppBar,
    // Autocomplete,
    // AutocompleteChangeDetails,
    // AutocompleteChangeReason,
    Box,
    // Button,
    // Card,
    // Divider,
    // Grid,
    // IconButton,
    // InputAdornment,
    // Menu,
    // MenuItem,
    // Paper,
    // Select,
    // SelectChangeEvent,
    Tab,
    // Table,
    // TableBody,
    // TableCell,
    // TableContainer,
    // TableHead,
    // TablePagination,
    // TableRow,
    Tabs,
    // TextField,
    // Typography,
    useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
    // ForwardedRef,
    // LegacyRef,
    // SyntheticEvent,
    // forwardRef,
    // useEffect,
    // useRef,
    useState,
} from "react";

// import { useBatchesContext } from "@/context/BatchesContext";
// import Tooltip from "@mui/material/Tooltip";

// import { styled } from "@mui/material/styles";
// import { tableCellClasses } from "@mui/material/TableCell";
// import { getAllPaymentTransactionsByBatchId } from "@/utils/serverActions/paymentTransaction";
// import { formatPhoneNumberIntl } from "react-phone-number-input";
// import UploadcsvData from "@/components/uploadcsvData";
// import GeneralAdmissionSettings from "@/components/adminssion/General";
import PlacementList from "@/components/adminssion/PlacementList";
// import { getAdminSetting } from "@/utils/serverActions/adminSettings";
import AdmissionPayments from "@/components/adminssion/Payments";

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            // hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ px: 1 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}
export default function AdmissionPage() {
    const theme = useTheme();
    // const router = useRouter();
    const [value, setValue] = useState(0);
    // const [loading, setLoading] = useState(false);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
            {/* <LoadingAlert open={loading} /> */}
            <Box>
                {/* <Typography
                    variant="h5"
                    gutterBottom
                    mb={2}
                    px={{ xs: 1, sm: 2, md: 3 }}
                    pt={3}
                >
                    Admission
                </Typography>

                <Divider /> */}
                <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }} sx={{ height: '100%' }}>
                    <AppBar position="static">
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            // indicatorColor="secondary"
                            textColor="inherit"
                        // variant="fullWidth"
                        >
                            {/* <Tab label="General" {...a11yProps(0)} /> */}
                            <Tab label="Placement List" {...a11yProps(0)} />
                            <Tab label="Payments" {...a11yProps(1)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0} dir={theme.direction}>
                        <PlacementList />
                    </TabPanel>
                    <TabPanel value={value} index={1} dir={theme.direction}>
                        <AdmissionPayments />
                    </TabPanel>
                </Box>

            </Box >
        </>
    );
}
