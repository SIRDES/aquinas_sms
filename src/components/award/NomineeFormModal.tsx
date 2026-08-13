// src/components/award/NomineeFormModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { showAlert } from "@/components/Alerts";
import { InferType, object, string } from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomizedSelect } from "../CustomizedSelect";
import { useAwards } from "@/hooks/useAwards";
import { getAllElectionCategoriesByAwardId } from "@/utils/serverActions/electionCategory";
import { getAllElectionUsersWithRoleAsElectionNominee } from "@/utils/serverActions/electionUser";

const schema = object().shape({
  nomineeId: string().required("Nominee is required"),
  categoryId: string().required("Category is required"),
});

type FormData = InferType<typeof schema>;

type NomineeFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (nomineeData: FormData) => Promise<void>;
  loading: boolean;
};

export default function NomineeFormModal({
  open,
  onClose,
  onSave,
  loading,
}: NomineeFormModalProps) {
  const { award } = useAwards();
  const [fetchedElectionUsers, setFetchedElectionUsers] = useState<any>(null);
  const [loadingSubjectsState, setLoadingSubjectsState] = useState<
    null | string
  >();
  const [loadingProgrammesState, setLoadingProgrammesState] = useState<
    null | string
  >();
  const [fetchedProgrammes, setFetchedProgrammes] = useState<any>(null);
  const form = useForm({
    // defaultValues: {
    // },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
    // control,
    setValue,
  } = form;

  const fetchClasses = async () => {
    setLoadingProgrammesState("Loading...");
    setLoadingSubjectsState("Loading...");
    setFetchedProgrammes([]);
    setFetchedElectionUsers([]);
    try {
      const response = await Promise.all([
        getAllElectionCategoriesByAwardId({ electionId: award?._id }),
        getAllElectionUsersWithRoleAsElectionNominee(award?._id),
      ]);
      console.log("election category", response);
      if (response[0].success) {
        setFetchedProgrammes(response[0]?.data || []);
      }
      if (response[1].success) {
        setFetchedElectionUsers(response[1]?.data || []);
      }
    } catch (error: any) {
      console.log("error", error);
      setLoadingProgrammesState(
        error.message || error.data || "An error occurred"
      );
    } finally {
      setLoadingProgrammesState(null);
      setLoadingSubjectsState(null);
    }
  };
  useEffect(() => {
    if (!award) return;
    fetchClasses();
  }, [award]);

  const onSubmit = async (data: FormData) => {
    try {
      await onSave(data);
      onClose();
      reset();
    } catch (error) {
      console.error("Error saving nominee:", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: "Failed to save nominee. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add New Nominee</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <Box>
              <Typography gutterBottom>
                Nominee{" "}
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  *
                </span>
              </Typography>

              <Select
                fullWidth
                displayEmpty
                value={watch("nomineeId") || ""} // Ensures a default value
                input={<CustomizedSelect />}
                renderValue={() => {
                  const nomineeId = watch("nomineeId") || "";
                  const selectedClass = fetchedElectionUsers?.find(
                    (item: any) => item._id === nomineeId
                  );
                  return selectedClass ? (
                    <em>
                      {`${
                        selectedClass?.firstName
                          ? `${selectedClass?.firstName} `
                          : ""
                      } ${
                        selectedClass?.lastName
                          ? `${selectedClass?.lastName}`
                          : ""
                      }`.toUpperCase()}{" "}
                      {selectedClass?.aliasName !== "" && (
                        <span
                          style={{ marginLeft: "5px", fontSize: "12px" }}
                        >{`(${selectedClass?.aliasName})`}</span>
                      )}
                    </em>
                  ) : (
                    <em style={{ color: "#ABB3BF" }}>Select nominee</em>
                  );
                }}
                {...register("nomineeId", { required: true })}
              >
                {loadingSubjectsState ? (
                  <MenuItem disabled>{loadingSubjectsState}</MenuItem>
                ) : (
                  fetchedElectionUsers?.map((programme: any) => (
                    <MenuItem key={programme._id} value={programme._id}>
                      {`${
                        programme?.firstName ? `${programme?.firstName} ` : ""
                      } ${
                        programme?.lastName ? `${programme?.lastName}` : ""
                      }`.toUpperCase()}
                      {programme?.aliasName !== "" && (
                        <span
                          style={{ marginLeft: "5px", fontSize: "12px" }}
                        >{`(${programme?.aliasName})`}</span>
                      )}
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography color="error" variant="subtitle2">
                {errors.nomineeId?.message}
              </Typography>
            </Box>

            <Box>
              <Typography gutterBottom>
                Category{" "}
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  *
                </span>
              </Typography>

              <Select
                fullWidth
                displayEmpty
                value={watch("categoryId") || ""} // Ensures a default value
                input={<CustomizedSelect />}
                renderValue={() => {
                  const categoryId = watch("categoryId") || "";
                  const selectedClass = fetchedProgrammes?.find(
                    (item: any) => item._id === categoryId
                  )?.name;
                  return selectedClass ? (
                    <em>{selectedClass}</em>
                  ) : (
                    <em style={{ color: "#ABB3BF" }}>Select category</em>
                  );
                }}
                {...register("categoryId", { required: true })}
              >
                {loadingProgrammesState ? (
                  <MenuItem disabled>{loadingProgrammesState}</MenuItem>
                ) : (
                  fetchedProgrammes?.map((programme: any) => (
                    <MenuItem key={programme._id} value={programme._id}>
                      {programme?.name?.toUpperCase()}
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography color="error" variant="subtitle2">
                {errors.categoryId?.message}
              </Typography>
            </Box>

            {/* <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.name}
              value={selectedCategory || null}
              onChange={handleCategoryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  required
                  inputProps={{
                    ...params.inputProps,
                    required: true,
                  }}
                />
              )}
            /> */}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
