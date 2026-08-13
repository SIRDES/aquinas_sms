"use client";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Card,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useBatchesContext } from "@/context/BatchesContext";

export default function OrderOfMerits() {
  const theme = useTheme();
  const router = useRouter();
  const { batches, setBatches, fetchedBatches } = useBatchesContext();

  const handleSearch = (e: any) => {
    const value = e.target.value;
    const filteredStudents = fetchedBatches.filter(
      (student: any) =>
        student?.name?.toLowerCase().includes(value.toLowerCase()) ||
        student?.examType?.toLowerCase().includes(value.toLowerCase()),
    );
    setBatches(filteredStudents);
  };
  return (
    <>
      <Box>
        <Box
          display={"flex"}
          gap={1}
          alignItems={"center"}
          justifyContent={"space-between"}
          mb={2}
          mt={2}
          px={3}
        >
          <TextField
            name={"search"}
            // fullWidth
            sx={{ width: "300px" }}
            size="small"
            placeholder="Search exam"
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <Grid container spacing={2} mb={2}>
            {batches.map((batch: any) => (
              <Grid item xs={12} sm={6} md={4} key={batch._id}>
                <Card
                  sx={{
                    padding: 2,
                    backgroundColor: theme.palette.background.paper,
                    cursor: "pointer",
                    height: "100%",
                  }}
                  onClick={() => {
                    router.push(`/order-of-merits/${batch._id}`);
                  }}
                >
                  <Typography variant="body1" gutterBottom>
                    {batch?.name?.toUpperCase()}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {batch?.examType}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Form {batch?.form}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Academic year {batch?.academicYearDetails?.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
