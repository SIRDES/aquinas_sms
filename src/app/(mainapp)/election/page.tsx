"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import { SnackbarType } from "@/types/commonTypes";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAwards } from "@/hooks/useAwards";
import { getNominationsByNomineeId } from "@/utils/serverActions/electionNominee";
import { showAlert } from "@/components/Alerts";
import VisibilityIcon from "@mui/icons-material/Visibility";
export default function Students() {
  const theme = useTheme();
  const { award } = useAwards();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const [nomineeCategories, setNomineeCategories] = useState<any>([]);

  const handleGetNomineeCategories = async () => {
    try {
      setLoading(true);
      const response = await getNominationsByNomineeId({
        id: session?.user?._id as string,
      });
      console.log("response", response);
      if (!response.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: response.message || "An error occurred",
        });
        return;
      }
      setNomineeCategories(response.data);
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error?.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetNomineeCategories();
  }, []);

  return (
    <>
      <LoadingAlert open={loading} />

      <Box>
        <Typography variant="h6" gutterBottom mb={1} mt={1} pl={3}>
          {award?.name?.toUpperCase()}
        </Typography>
        <Divider />
        <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
          <Grid container spacing={2} mb={2}>
            {nomineeCategories &&
              nomineeCategories?.map((batch: any) => (
                <Grid item xs={12} sm={6} md={4} key={batch._id}>
                  <Card
                    sx={{
                      // padding: 2,
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {batch?.category?.name}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Your Nominee Code: {batch?.nomineeCode}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Your votes: {batch?.numberOfVotes || 0}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Total Votes: {batch?.totalVotes || 0}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        sx={{ textDecoration: "underline" }}
                        size="small"
                        onClick={() => {
                          router.push(`/election/${batch.categoryId}`);
                        }}
                      >
                        View More
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
