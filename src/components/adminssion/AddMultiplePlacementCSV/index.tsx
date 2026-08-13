import { Box, Button, Typography } from "@mui/material";
import React, { useState, useEffect, useMemo, Dispatch, SetStateAction, use } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import AddMultiplePlacementCSVPreview from "./AddMultiplePlacementCSVPreview";

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

function AddMultiplePlacementCSV({ previewModalTitle, disabledUploadBtn, setRowsToAdd, handleAddMultipleStudents }: { previewModalTitle: string, disabledUploadBtn?: boolean, setRowsToAdd: Dispatch<SetStateAction<any[]>>, handleAddMultipleStudents: () => Promise<void> }) {
    const {
        acceptedFiles,
        getRootProps,
        getInputProps,
        fileRejections,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        maxFiles: 1,
        validator: nameLengthValidator,
        accept: {
            "text/csv": [],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
            "application/vnd.ms-excel": [],
        },
    });
    function nameLengthValidator(file: File) {
        const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
        if (fileExtension !== "csv" && fileExtension !== "xlsx" && fileExtension !== "xls") {
            return {
                code: "file-type",
                message: "File type not accepted. Accepts only csv, xlsx, and xls files",
            };
        }
        return null;
    }

    const [showPreview, setOpenPreview] = useState(false);

    const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(null);
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
        setSelectedFile(acceptedFiles[0]);
    }, [acceptedFiles]);
    useEffect(() => {
        setRowsToAdd(array);
    }, [array, setRowsToAdd]);

    const handleRemoveSelectedFile = () => {
        setSelectedFile(null);
        setArray([]);
    };

    interface CsvObject {
        [key: string]: string;
    }

    const csvFileToArray = (string: string) => {
        // console.log("string", string);
        // console.log("string.indexOf", string.indexOf("\n"));
        // const csvHeader: string[] = string.slice(0, string.indexOf("\n")).split(",");
        // const csvRows: string[] = string.slice(string.indexOf("\n") + 1).split("\n");
        const csvHeader: string[] = string.split("\n")[0]?.split(",")?.map(header => header.trim().replace(/\r$/, ""));
        // const csvRows: string[] = string.split("\n").slice(7).filter(row => row.trim() !== "");
        const csvRows: string[] = string.split("\n").slice(1).filter(row => row.trim() !== "");
        console.log("csvHeader", csvHeader);
        console.log("csvRows", csvRows);
        const array: CsvObject[] = csvRows.map((i) => {
            const values: string[] = i.split(",")
            const obj: CsvObject = csvHeader.reduce((object, header, index) => {
                object[header] = values[index]?.trim()?.replace(/\r$/, "")
                return object;
            }, {} as CsvObject);
            return obj;
        });
        setHeaders(csvHeader)
        setArray(array);
    };

    useEffect(() => {
        const getData = async () => {
            const fileReader = new FileReader();
            // console.log(selectedFile)
            if (selectedFile) {
                // console.log(selectedFile)
                fileReader.onload = function (event: ProgressEvent<FileReader>) {
                    if (event.target) {
                        const csvOutput = event.target.result;
                        if (typeof csvOutput === 'string') {
                            csvFileToArray(csvOutput);
                        }
                    }
                };
                fileReader.readAsText(selectedFile);
            }
        };
        getData();
    }, [selectedFile]);
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
        handleRemoveSelectedFile();
    };

    const handleUpload = () => {
        setOpenPreview(true);
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
        handleRemoveSelectedFile()
        await handleAddMultipleStudents()
    }
    return (
        <Box>
            <AddMultiplePlacementCSVPreview
                open={showPreview}
                handleClose={handlePreviewClose}
                rows={array}
                handleDeleteRow={handleDeleteRow}
                modalPreviewTitle={previewModalTitle}
                handleSubmit={handleConfirm}
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
                {selectedFile ? (
                    <Box>
                        <Typography>
                            {selectedFile.name} {selectedFile.size} bytes
                        </Typography>
                        <Button onClick={handleRemoveSelectedFile}>remove</Button>
                    </Box>
                ) : (
                    <Box {...getRootProps()} style={style as React.CSSProperties}>
                        <Typography variant="body1">
                            Select a CSV File to Upload
                        </Typography>
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
                        disabled={!selectedFile || disabledUploadBtn}
                        onClick={handleUpload}
                        variant="contained"
                    >
                        upload
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default AddMultiplePlacementCSV;
// send automated birthday message based on date of birth in js