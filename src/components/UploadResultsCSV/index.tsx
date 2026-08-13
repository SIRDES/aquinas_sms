import { Box, Button, Typography } from "@mui/material";
import React, {
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
  use,
} from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import AddMultipUploadResultsCSVPreview from "./UploadResultsCSVPreview";
import * as XLSX from "xlsx";
import { showAlert } from "../Alerts";

// import UploadPreview from "./UploadPreview";
const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px 20px",
  width: "80%",
  borderWidth: "2px",
  borderStyle: "dotted",
  borderColor: "#000",
  borderRadius: "2px",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
  cursor: "pointer",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#2196f3",
};

function UploadResultsCSV({
  disabledUploadBtn,
  setRowsToAdd,
  handleUploadResults,
  isNewCurriculum,
}: {
  disabledUploadBtn?: boolean;
  setRowsToAdd: Dispatch<SetStateAction<any[]>>;
  handleUploadResults: () => Promise<void>;
  isNewCurriculum: boolean;
}) {
  const [isProcessingRows, setIsProcessingRows] = useState(false);
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    fileRejections,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    maxFiles: 20,
    validator: nameLengthValidator,
    accept: {
      "text/csv": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
  });
  function nameLengthValidator(file: File) {
    const fileExtension = file?.name?.split(".").pop()?.toLowerCase();
    if (
      fileExtension !== "csv" &&
      fileExtension !== "xlsx" &&
      fileExtension !== "xls"
    ) {
      return {
        code: "file-type",
        message:
          "File type not accepted. Accepts only csv, xlsx, and xls files",
      };
    }
    return null;
  }

  const [showPreview, setOpenPreview] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([]);
  const [array, setArray] = useState<CsvObject[]>([]);
  const [headers, setHeaders] = useState<Array<string>>([]);
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  useEffect(() => {
    setSelectedFiles([...acceptedFiles]);
  }, [acceptedFiles]);
  useEffect(() => {
    setRowsToAdd(array);
  }, [array, setRowsToAdd]);

  const handleRemoveSelectedFile = (index?: number) => {
    if (typeof index === "number") {
      const newFiles = [...selectedFiles];
      newFiles.splice(index, 1);
      setSelectedFiles(newFiles);
      if (newFiles.length === 0) {
        setArray([]);
      }
    } else {
      setSelectedFiles([]);
      setArray([]);
    }
  };

  interface CsvObject {
    [key: string]: string;
  }

  const parseCsv = (string: string, fileName: string) => {
    // console.log("string", string);
    // console.log("string.indexOf", string.indexOf("\n"));
    // const csvHeader: string[] = string.slice(0, string.indexOf("\n")).split(",");
    // const csvRows: string[] = string.slice(string.indexOf("\n") + 1).split("\n");
    const csvHeader: string[] = string
      .split("\n")[6]
      ?.split(",")
      ?.map((header) => header.trim().replace(/\r$/, ""));
    // const csvRows: string[] = string.split("\n").slice(7).filter(row => row.trim() !== "");
    try {
      const csvRows: string[] = string
        .split("\n")
        .slice(7, -2)
        .filter((row) => row.trim() !== "");
      // console.log("csvHeader", csvHeader);
      // console.log("csvRows", csvRows);
      const array: CsvObject[] = csvRows.map((i) => {
        const values: string[] = i.split(",");
        const obj: CsvObject = csvHeader.reduce((object, header, index) => {
          if (header === "Class (30%)") {
            const scoreData = Math.round(
              Number(values[index]?.trim()?.replace(/\r$/, "") || "0")
            );
            if (scoreData > 30) {
              throw new Error(
                `Error in ${fileName}: Class score cannot be greater than 30`
              );
            }

            object[header] = scoreData < 0 ? "0" : scoreData.toString();
            return object;
          }

          if (header === "Exams (70%)") {
            const scoreData = Math.round(
              Number(values[index]?.trim()?.replace(/\r$/, "") || "0")
            );
            if (scoreData > 70) {
              throw new Error(
                `Error in ${fileName}: Exams score cannot be greater than 70`
              );
            }

            object[header] = scoreData < 0 ? "0" : scoreData.toString();
            return object;
          }

          if (header === "Total") {
            const scoreData = Math.round(
              Number(values[index]?.trim()?.replace(/\r$/, "") || "0")
            );
            if (scoreData > 100) {
              throw new Error(
                `Error in ${fileName}: Total score cannot be greater than 100`
              );
            }

            object[header] = scoreData < 0 ? "0" : scoreData.toString();
            return object;
          }

          object[header] = values[index]?.trim()?.replace(/\r$/, "");
          return object;
        }, {} as CsvObject);
        return obj;
      });
      setHeaders(csvHeader);
      return { array, headers: csvHeader };
    } catch (error: any) {
      // console.error("Error processing CSV file:", error);
      showAlert({
        title: "Error",
        text: error?.message || "Error processing CSV file",
        severity: "error",
      });
      return { array: [], headers: [] };
    }
  };

  const parseNewCurriculumCsv = (string: string, fileName: string) => {
    // console.log("string", string);
    // console.log("string.indexOf", string.indexOf("\n"));
    // const csvHeader: string[] = string.slice(0, string.indexOf("\n")).split(",");
    // const csvRows: string[] = string.slice(string.indexOf("\n") + 1).split("\n");
    const csvHeader: string[] = string
      .split("\n")[6]
      ?.split(",")
      ?.map((header) => header.trim().replace(/\r$/, ""));
    // const csvRows: string[] = string.split("\n").slice(7).filter(row => row.trim() !== "");
    try {
      const csvRows: string[] = string
        .split("\n")
        .slice(8, -2)
        .filter((row) => row.trim() !== "");
      // console.log("csvHeader", csvHeader);
      // console.log("csvRows", csvRows);
      const array: CsvObject[] = csvRows.map((i) => {
        const values: string[] = i.split(",");
        const obj: CsvObject = csvHeader.reduce((object, header, index) => {
          if (header === "Class (60%)") {
            const scoreData = Math.round(
              Number(values[index]?.trim()?.replace(/\r$/, "") || "0")
            );
            if (scoreData > 60) {
              throw new Error(
                `Error in ${fileName}: Class score cannot be greater than 60`
              );
            }

            object[header] = scoreData < 0 ? "0" : scoreData.toString();
            return object;
          }

          if (header === "Exams (40%)") {
            const scoreData = Math.round(
              Number(values[index]?.trim()?.replace(/\r$/, "") || "0")
            );
            if (scoreData > 40) {
              throw new Error(
                `Error in ${fileName}: Exams score cannot be greater than 40`
              );
            }
            object[header] = scoreData < 0 ? "0" : scoreData.toString();
            return object;
          }
          if (header === "Total (100%)") {
            const scoreData = Math.round(
              Number(values[index]?.trim()?.replace(/\r$/, "") || "0")
            );
            if (scoreData > 100) {
              throw new Error(
                `Error in ${fileName}: Total score cannot be greater than 100`
              );
            }

            object[header] = scoreData < 0 ? "0" : scoreData.toString();
            return object;
          }

          object[header] = values[index]?.trim()?.replace(/\r$/, "");
          return object;
        }, {} as CsvObject);
        return obj;
      });
      setHeaders(csvHeader);
      return { array, headers: csvHeader };
    } catch (error: any) {
      // console.error("Error processing CSV file:", error);
      showAlert({
        title: "Error",
        text: error?.message || "Error processing CSV file",
        severity: "error",
      });
      return { array: [], headers: [] };
    }
  };

  useEffect(() => {
    const processFiles = async () => {
      if (selectedFiles.length === 0) {
        setArray([]);
        return;
      }
      setIsProcessingRows(true);
      let combinedArray: CsvObject[] = [];

      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetNames = workbook.SheetNames;
        const worksheet = workbook.Sheets[sheetNames[0]];
        const data = XLSX.utils.sheet_to_csv(worksheet);

        // Create a temporary array to hold the parsed data
        let tempArray: CsvObject[] = [];

        if (isNewCurriculum) {
          const { array: parsedArray } = parseNewCurriculumCsv(data, file.name);
          tempArray = parsedArray;
        } else {
          const { array: parsedArray } = parseCsv(data, file.name);
          tempArray = parsedArray;
        }

        // Add filename to each row for tracking
        tempArray = tempArray.map((row) => ({
          ...row,
          _sourceFile: file.name,
        }));

        combinedArray = [...combinedArray, ...tempArray];
      }

      setIsProcessingRows(false);
      setArray(combinedArray);
    };

    processFiles();
  }, [selectedFiles, isNewCurriculum]);
  interface HandlePreviewCloseEvent {
    (event: React.SyntheticEvent, reason: string): void;
  }

  const handlePreviewClose: HandlePreviewCloseEvent = (event, reason) => {
    // if (reason === "escapeKeyDown") {
    //     setOpenPreview(false);
    //     handleRemoveSelectedFile();
    //     return;
    // }
    if (reason === "backdropClick") {
      return;
    }
    setOpenPreview(false);
    setIsProcessingRows(false);
    handleRemoveSelectedFile();
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      setOpenPreview(true);
    }
  };

  interface HandleDeleteRowEvent {
    (idx: number): void;
  }

  const handleDeleteRow: HandleDeleteRowEvent = (idx) => {
    const newRow = array.filter((row, index) => index !== idx);
    setArray(newRow);
  };
  const handleConfirm = async () => {
    setOpenPreview(false);
    handleRemoveSelectedFile();
    // console.log("rows", array);
    // console.log("headers", headers);
    await handleUploadResults();
  };
  return (
    <Box>
      <AddMultipUploadResultsCSVPreview
        open={showPreview}
        handleClose={handlePreviewClose}
        isLoadingRows={isProcessingRows}
        rows={array}
        handleDeleteRow={handleDeleteRow}
        handleSubmit={handleConfirm}
        isNewCurrilculum={isNewCurriculum}
      />

      <Box
        style={{
          display: "grid",
          placeItems: "center",
          gap: "20px",
          padding: "30px 10px",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        {selectedFiles.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            {selectedFiles.map((file, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </Typography>
                <Button
                  size="small"
                  onClick={() => handleRemoveSelectedFile(index)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Box {...getRootProps()} style={style as React.CSSProperties}>
            <Typography variant="body1">Select a CSV File to Upload</Typography>
            <Typography variant="body2">or drag and drop it here</Typography>
            <input {...getInputProps()} required />
          </Box>
        )}

        {fileRejections &&
          fileRejections.map(({ file, errors }) => (
            <Box key={file.path}>
              {errors.map((e) => (
                <Typography
                  key={e.code}
                  component="p"
                  sx={{ color: "#ff1744" }}
                >
                  {e.message}
                </Typography>
              ))}
            </Box>
          ))}

        <Box>
          <Button
            disabled={selectedFiles.length === 0 || disabledUploadBtn}
            onClick={handleUpload}
            variant="contained"
          >
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default UploadResultsCSV;
// send automated birthday message based on date of birth in js
