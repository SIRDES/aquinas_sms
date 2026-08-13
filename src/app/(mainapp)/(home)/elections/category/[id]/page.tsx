"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getElectionCategoryById } from "@/utils/serverActions/electionCategory";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Button,
  Avatar,
  Divider,
  Chip,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { showAlert } from "@/components/Alerts";

type Nominee = {
  _id: string;
  nomineeId: string;
  numberOfVotes: number;
  nomineeCode: string;
  nomineeDetails: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
};

type CategoryData = {
  _id: string;
  name: string;
  shortCode: string;
  nominees: Nominee[];
};

export default function CategoryDetails() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const result = await getElectionCategoryById({
          id: params.id as string,
        });

        if (!result.success) {
          showAlert({
            title: "Error",
            severity: "error",
            text: result.message || "Failed to load category details",
          });
          return;
        }

        const categoryData = result.data?.[0];
        if (!categoryData) {
          showAlert({
            title: "Error",
            severity: "error",
            text: "Category not found",
          });
          return;
        }
        // console.log("categoryData", categoryData);
        setCategory(categoryData);

        // Calculate total votes
        const votes = categoryData.nominees.reduce(
          (sum: number, nominee: Nominee) => sum + (nominee.numberOfVotes || 0),
          0
        );
        setTotalVotes(votes);
      } catch (error) {
        console.error("Error fetching category:", error);
        showAlert({
          title: "Error",
          severity: "error",
          text: "An error occurred while loading category details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.id]);

  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="h6">Category not found</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Box sx={{ mb: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" component="h1">
            {category.name}
          </Typography>
          <Chip
            label={`Total Votes: ${totalVotes}`}
            color="primary"
            variant="outlined"
            size="medium"
          />
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Category Code: {category.shortCode}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {category.nominees.length === 0 ? (
          <Grid item xs={12}>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              No nominees found for this category.
            </Typography>
          </Grid>
        ) : (
          category.nominees.map((nominee) => (
            <Grid item xs={12} md={6} key={nominee._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      src={nominee.nomineeDetails.avatar}
                      alt={`${nominee.nomineeDetails.firstName} ${nominee.nomineeDetails.lastName}`}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    >
                      {nominee.nomineeDetails.firstName?.[0]}
                      {nominee.nomineeDetails.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {nominee.nomineeDetails.firstName}{" "}
                        {nominee.nomineeDetails.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {nominee.nomineeCode}
                      </Typography>
                    </Box>
                  </Box>

                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        {nominee.numberOfVotes || 0} votes
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight="bold"
                      >
                        {getVotePercentage(nominee.numberOfVotes || 0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getVotePercentage(nominee.numberOfVotes || 0)}
                      sx={{ height: 8, borderRadius: 2 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}
