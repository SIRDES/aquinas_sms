"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBatchesContext } from "@/context/BatchesContext";
import { useSession } from "next-auth/react";
import { addAdminSetting } from "@/utils/serverActions/adminSettings";
import { useAwards } from "@/hooks/useAwards";
import { addAward } from "@/utils/serverActions/election";
import Link from "next/link";
import { getAllElectionCategoriesByAwardId } from "@/utils/serverActions/electionCategory";
import AddOrEditCategoryModal from "./category/AddOrEditCategory";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { showAlert } from "../Alerts";
export default function CategoriesTab() {
  const theme = useTheme();
  const router = useRouter();
  const { award, isLoading, error } = useAwards();
  const { data: session } = useSession();
  const { selectedBatch, batches, setBatches, fetchedBatches } =
    useBatchesContext();
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState<any>(null);
  const [categories, setCategories] = useState<Array<any>>([]);
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [openAddNewCategoryDialog, setOpenAddNewCategoryDialog] =
    useState(false);

  const handleSearch = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedCategories.filter((student: any) =>
      student?.name?.toLowerCase().includes(value.toLowerCase())
    );
    setCategories(filteredStudents);
  };
  const fetchCategoriesData = async () => {
    setLoading(true);
    setFetchedCategories(null);
    setCategories([]);

    try {
      const res = await getAllElectionCategoriesByAwardId({
        electionId: award?._id,
      });
      // console.log("election category", res);
      if (res.success === false) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res.message,
        });
        // setSnackbar({
        //   open: true,
        //   message: res.message,
        //   severity: "error",
        // });
        return;
      }

      if (res?.data?.length === 0) {
        showAlert({
          title: "Success",
          severity: "success",
          text: "No category found",
        });
        // setSnackbar({
        //   open: true,
        //   message: "No category found",
        //   severity: "error",
        // });
        return;
      }
      setFetchedCategories(res?.data);
      setCategories(res?.data);
    } catch (error: any) {
      console.log("error", error);
      setSnackbar({
        open: true,
        message: error.message || error.data || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (award === null) return;
    fetchCategoriesData();
  }, [award]);

  // const handleaddFridayTestBatch = async () => {
  //   try {
  //     setLoading(true);
  //     // await addAcademicYear();
  //     // await addAward();
  //     setSnackbar({
  //       open: true,
  //       message: "Friday batch added successfully",
  //       severity: "success",
  //     });
  //   } catch (error: any) {
  //     setSnackbar({
  //       open: true,
  //       message: error?.message || "An error occurred",
  //       severity: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
      <AddOrEditCategoryModal
        open={openAddNewCategoryDialog}
        setOpen={setOpenAddNewCategoryDialog}
        refetchFunction={fetchCategoriesData}
        electionId={award?._id}
        category={selectedCategory}
        isEdit={isEdit}
      />
      <Box>
        <Grid
          container
          spacing={2}
          display={"flex"}
          justifyContent={"space-between"}
          mb={2}
          // mt={2}
          px={1}
        >
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              name={"search"}
              fullWidth
              size="small"
              placeholder="Search for a category"
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={2}
            display={"flex"}
            justifyContent={"flex-end"}
          >
            <Button
              variant="contained"
              // size="small"
              // startIcon={<AddIcon />}
              onClick={() => {
                // handleDownloadClose();
                setOpenAddNewCategoryDialog(true);
              }}
              sx={{
                borderRadius: "4px",

                width: "fit-content",
                color: "white",
                fontWeight: 700,
              }}
            >
              Add Category
            </Button>
          </Grid>
        </Grid>

        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 2 }} mb={4}>
          <Grid container spacing={2} mb={2}>
            {categories?.map((batch: any) => (
              <Grid item xs={12} sm={6} md={6} key={batch._id}>
                <Card
                  sx={{
                    padding: 2,
                    height: "100%",
                    border: `1px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {batch?.name}
                    </Typography>

                    <Typography variant="body1" gutterBottom>
                      Short Code: {batch?.shortCode}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      No. of votes: {batch?.totalVotes}
                    </Typography>
                  </Box>
                  {/* View and Edit icons */}
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    <IconButton
                      onClick={() => {
                        router.push(`/elections/category/${batch._id}`);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setIsEdit(true);
                        setSelectedCategory(batch);
                        setOpenAddNewCategoryDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
