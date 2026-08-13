import { Box, Button, Typography } from "@mui/material";
import React, { useState, useEffect, useMemo, Dispatch, SetStateAction, use } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
// import AddMultipAddMultipleStudentsCSVPreview from "./UploadAttendanceLogCSVPreview";
import * as XLSX from "xlsx";
import { StudentAttendanceLogType } from "@/types/commonTypes";
import UploadAttendanceLogCSVPreview from "./UploadAttendanceLogCSVPreview";

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

function UploadAttendanceLogCSV({ disabledUploadBtn, setRowsToAdd, handleAddMultipleStudents, setAttendanceYear, setAttendanceMonth }: { disabledUploadBtn?: boolean, setRowsToAdd: Dispatch<SetStateAction<any[]>>, handleAddMultipleStudents: () => Promise<void>, setAttendanceYear: Dispatch<SetStateAction<string>>, setAttendanceMonth: Dispatch<SetStateAction<string>> }) {
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
    const [array, setArray] = useState<StudentAttendanceLogType[]>([]);
    const [headers, setHeaders] = useState<Array<number>>([]);
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



    const readExcelFile = (file: File) => {
        const fileReader = new FileReader();
        fileReader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target && event.target.result) {
                const data = new Uint8Array(event.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const logsSheet = workbook.Sheets['Logs'];
                if (logsSheet) {
                    const rows = XLSX.utils.sheet_to_json(logsSheet, { header: 1 }) as any[][];

                    // Parse Duration and Printed Date
                    let duration = "";
                    let printedDate = "";

                    for (let i = 0; i < Math.min(10, rows.length); i++) {
                        const row = rows[i];
                        if (!row) continue;

                        const durIdx = row.indexOf("Duration:");
                        if (durIdx !== -1) duration = row.slice(durIdx + 1).find((v: any) => v) || "";

                        const printIdx = row.indexOf("Printed :");
                        if (printIdx !== -1) printedDate = row.slice(printIdx + 1).find((v: any) => v) || "";
                    }

                    console.log("Parsed Duration:", duration);
                    console.log("Parsed Printed Date:", printedDate);

                    let yearNumber = "";
                    let monthNumber = "";
                    if (duration) {
                        const firstPart = duration.split("~")[0].trim(); // "2026/01/01"
                        const dateParts = firstPart.split("/");
                        if (dateParts.length >= 2) {
                            yearNumber = dateParts[0];
                            monthNumber = dateParts[1];
                        }
                    }


                    // Parse Students and time logs
                    const students = [];
                    for (let i = 4; i < rows.length; i += 2) {
                        const infoRow = rows[i];
                        const timesRow = rows[i + 1];

                        if (!infoRow || !infoRow.includes("No:")) continue;
                        const noIdx = infoRow.indexOf("No:");
                        const no = infoRow.slice(noIdx + 1).find((v: any) => v) || "";

                        if (!no) continue;

                        const nameIdx = infoRow.indexOf("Name:");
                        const name = infoRow.slice(nameIdx + 1).find((v: any) => v) || "";

                        if (!name) continue;

                        const deptIdx = infoRow.indexOf("Dept:");
                        const dept = infoRow.slice(deptIdx + 1).find((v: any) => v) || "";
                        if (!dept) continue;
                        const splittedDept = dept.trim().toUpperCase().split(" ");
                        if (splittedDept.length !== 3) continue;
                        const program = splittedDept[0]
                        const yearOfAdmission = splittedDept[2];

                        const timeLogs = [];
                        if (timesRow) {
                            for (let j = 0; j < 31; j++) {
                                if (timesRow[j]) {
                                    const timeStr = String(timesRow[j]).trim();
                                    const times = timeStr.split(/\s+/).map(t => t.trim()).filter(Boolean);

                                    let morningTime = "";
                                    let afternoonTime = "";

                                    for (const t of times) {
                                        const hourMatch = t.match(/^(\d{1,2}):/);
                                        if (hourMatch) {
                                            const hour = parseInt(hourMatch[1], 10);
                                            if (hour < 12 && !morningTime) {
                                                morningTime = t;
                                            } else if (hour >= 12 && !afternoonTime) {
                                                afternoonTime = t;
                                            }
                                        }
                                    }

                                    timeLogs.push({
                                        day: j + 1,
                                        morningTime,
                                        afternoonTime
                                    });
                                }
                            }
                        }

                        students.push({ no, name, dept, studentId: `${program.toUpperCase()}/${no.toString().padStart(3, "0")}/${yearOfAdmission.toUpperCase()}`, timeLogs });
                    }

                    console.log("Parsed Students:", students);
                    console.log("Year:", yearNumber, "Month:", monthNumber);

                    // Note: Month arg in Date is 0-indexed. Passing Number(monthNumber) (which is 1-indexed)
                    // with day=0 correctly returns the last day of the desired month.
                    const daysInthisMonth = new Date(Number(yearNumber), Number(monthNumber), 0).getDate();
                    const daysArray = Array.from({ length: daysInthisMonth }, (_, i) => i + 1);

                    // console.log("Days in this month:", daysInthisMonth);
                    console.log("Days Array:", daysArray);
                    setHeaders(daysArray)
                    setArray(students);
                    setAttendanceYear(yearNumber);
                    setAttendanceMonth(monthNumber);

                } else {
                    console.error("Sheet 'Logs' not found in the excel file.");
                    throw new Error("Sheet 'Logs' not found in the excel file.");
                }
            }
        };
        fileReader.readAsArrayBuffer(file);
    };

    // const csvFileToArray = (string: string) => {
    //     console.log("string>>>>>>>>>>>>>", string);
    //     const csvHeader: string[] = string.slice(0, string.indexOf("\n")).split(",")?.map(header => header.trim().replace(/\r$/, ""));
    //     const csvRows: string[] = string.slice(string.indexOf("\n") + 1, string.lastIndexOf("\n")).split("\n")
    //     console.log("csvHeader", csvHeader);
    //     console.log("csvRows", csvRows);
    //     const array: CsvObject[] = csvRows.map((i) => {
    //         const values: string[] = i.split(",")
    //         const obj: CsvObject = csvHeader.reduce((object, header, index) => {

    //             if (header === "CassRefID") {
    //                 object.cassRefID = values[index]?.trim()?.replace(/\r$/, "")
    //                 return object;
    //             }
    //             if (header === "Phone Number") {
    //                 const phone = values[index]?.trim()?.replace(/\r$/, "")
    //                 object.phoneNumber = phone === "" ? "" : phone
    //                 return object;
    //             }
    //             if (header === "First Name") {
    //                 object.firstName = values[index]?.trim()?.replace(/\r$/, "")
    //                 return object;
    //             }
    //             if (header === "Last Name") {
    //                 object.lastName = values[index]?.trim()?.replace(/\r$/, "")
    //                 return object;
    //             }
    //             object[header] = values[index]?.trim()?.replace(/\r$/, "")
    //             return object;

    //         }, {} as CsvObject);
    //         return obj;
    //     });
    //     setHeaders(csvHeader)
    //     setArray(array);
    // };

    useEffect(() => {
        const getData = async () => {
            if (selectedFile) {
                if (selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
                    readExcelFile(selectedFile);
                } else {
                    // const fileReader = new FileReader();
                    // fileReader.onload = function (event: ProgressEvent<FileReader>) {
                    //     if (event.target) {
                    //         const csvOutput = event.target.result;
                    //         if (typeof csvOutput === 'string') {
                    //             csvFileToArray(csvOutput);
                    //         }
                    //     }
                    // };
                    // fileReader.readAsText(selectedFile);
                }
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
            <UploadAttendanceLogCSVPreview
                open={showPreview}
                handleClose={handlePreviewClose}
                rows={array}
                handleDeleteRow={handleDeleteRow}
                handleSubmit={handleConfirm}
                headers={headers}
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

export default UploadAttendanceLogCSV;