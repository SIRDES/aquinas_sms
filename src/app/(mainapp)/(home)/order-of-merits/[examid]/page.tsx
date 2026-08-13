"use client";
import LoadingAlert from "@/components/LoadingAlert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  Card,
  Divider,
  Grid,
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

  SyntheticEvent,
  use,
  useEffect,
  useState,
} from "react";

import { useBatchesContext } from "@/context/BatchesContext";
import Tooltip from "@mui/material/Tooltip";

import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import XLSX from "xlsx-js-style";
import { getAllClasses } from "@/utils/serverActions/classes";
import {
  getRankedFridayTestScoreForASubject,
  getRankedTestScoresForAClass,
} from "@/utils/serverActions/fridayTestScore";
import { showAlert } from "@/components/Alerts";
import { getAllSubjects } from "@/utils/serverActions/subject";
import { generalScienceSubjectId, getBest6Aggregate } from "@/utils/services/utils";

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
    // cursor: "pointer",
  },
}));

export default function ExamOrderOfMerits({
  params,
}: {
  params: Promise<{ examid: string }>;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { examid } = use(params);
  const { fetchedBatches } = useBatchesContext();
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [sortAsc, setSortAsc] = useState(false);

  const [fetchedStudents, setFetchedStudents] = useState<any>(null);
  const [students, setStudents] = useState<any>([]);
  const [excelData, setExcelData] = useState<Array<any>>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [fetchedSubjects, setFetchedSubjects] = useState<any[]>([]);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [filterBy, setFilterBy] = useState("class");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [classes, setClasses] = useState<Array<any>>([]);
  const [subjectsInClass, setSubjectsInClass] = useState<Array<any>>([]);
  // const handleChangePage = (event: unknown, newPage: number) => {
  //   setPage(newPage);
  // };
  const grades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

  const getNumberOfGrades = (testScores: Array<any>, grade: string) => {
    return testScores.filter((testScore) => testScore.grade === grade).length;
  };
  const getSubjectScore = (testScores: Array<any>, subjectId: string) => {
    return testScores.filter((testScore) => testScore.subjectDetails._id === subjectId);
  };
  useEffect(() => {
    if (!examid || !fetchedBatches || fetchedBatches?.length === 0) return;
    const exam = fetchedBatches.find((batch: any) => batch._id === examid);
    setSelectedExam(exam);
    // return () => {
    //   setSelectedExam(null);
    // };
  }, [examid, fetchedBatches]);


  const fetchTestScores = async () => {
    if (selectedExam === null) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "No exam selected",
      });
      return;
    }

    if (filterBy === "subject" && selectedSubject === null) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "No subject selected",
      });
      return;
    }
    if (filterBy === "class" && selectedClass === null) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "No class selected",
      });
      return;
    }

    setLoading(true);
    setFetchedStudents([]);
    setStudents([]);
    setSubjectsInClass([]);
    try {
      let response;

      if (filterBy === "subjects") {
        response = await getRankedFridayTestScoreForASubject({
          subjectId: selectedSubject?._id,
          fridayTestBatchId: selectedExam?._id,
          yearGroup: selectedExam?.yearGroup,
        });
      } else {
        response = await getRankedTestScoresForAClass({
          className: selectedClass?.name,
          fridayTestBatchId: selectedExam?._id,
          yearGroup: selectedExam?.yearGroup,
        });
      }

      if (!response?.data) {
        showAlert({
          title: "Error",
          severity: "error",
          text: response?.message || "An error occurred, please try again",
        });
        return;
      }
      console.log("res data", response.data);
      setStudents(
        filterBy === "subjects"
          ? response?.data || []
          : response?.data?.students || [],
      );
      setFetchedStudents(
        filterBy === "subjects"
          ? response?.data || []
          : response?.data?.students || [],
      );
      if (filterBy === 'class') {
        setSubjectsInClass(response?.data?.subjectsInClass?.sort((a: any, b: any) => a.name?.localeCompare(b.name)) || []);
      }
    } catch (error: any) {
      console.log("error", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || error.data || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await getAllSubjects();
      if (response.status === "error") {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Failed to fetch subjects",
        });
        return;
      }
      if (selectedExam?.subjectIds?.length > 0) {
        const subjectData = response.data?.filter((subject: any) =>
          selectedExam?.subjectIds?.includes(subject._id),
        );
        setSubjects(subjectData || []);
        setFetchedSubjects(subjectData || []);
        return;
      }
      const subjectData = response.data?.filter(
        (subject: any) =>
          subject?.isNewCurriculum === selectedExam?.isNewCurriculum,
      );
      setSubjects(subjectData || []);
      setFetchedSubjects(subjectData || []);
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
      showAlert({
        title: "Error",
        severity: "error",
        text: "Failed to fetch subjects",
      });
    }
  };

  useEffect(() => {
    if (selectedExam === null) return;
    fetchSubjects();
  }, [selectedExam]);

  const fetchClasses = async () => {
    setClasses([]);
    try {
      const response = await getAllClasses(selectedExam?.form);
      if (!response.data) return;
      setClasses(response.data);
    } catch (error: any) { }
  };
  useEffect(() => {
    if (selectedExam === null) return;
    fetchClasses();
  }, [selectedExam]);

  const handleSortByName = () => {
    const sortedStudents = students.sort((a: any, b: any) => {
      const studentA = a?.student?.name?.toLowerCase();
      const studentB = b?.student?.name?.toLowerCase();
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

  const handleSearchByProgramme = (
    event: SyntheticEvent<Element, Event>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined,
  ) => {
    // const value = e.target.value;
    // console.log(value, reason, details);
    if (reason === "clear" || value === null) {
      setSelectedSubject(null);
      return;
    }
    // console.log(value);
    setSelectedSubject(value);
  };

  const handleSearchByClass = (
    event: SyntheticEvent<Element, Event>,
    value: any,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<any> | undefined,
  ) => {
    // console.log(value, reason, details);

    if (reason === "clear" || value === null) {
      setSelectedClass(null);
      return;
    }
    // console.log(value);
    setSelectedClass(value);
  };

  const handleDownloadBtnClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };
  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
  };

  useEffect(() => {
    // setReportData(students);
    if (students.length === 0) return;
    if (filterBy === "subjects") {
      setExcelData(
        students.map((student: any) => ({
          "Student ID": student?.student?.studentId?.toUpperCase(),
          Name: student?.student?.name?.trim().toUpperCase() || "",
          Class:
            `${student?.student?.class?.form} ${student?.student?.class?.name}`.toUpperCase(),
          Score: student?.totalScore || 0,
          Grade: student?.grade || "",
          Position: student?.position || 0,
        })),
      );
    }
    // if (filterBy === "class") {
    //   let coreSubjects: any[] = []
    //   let electiveSubjects: any[] = []
    //   subjectsInClass?.forEach((s: any) => {
    //     if (s.type === "core" || s._id === generalScienceSubjectId) {
    //       coreSubjects.push(s)
    //     } else {
    //       electiveSubjects.push(s)
    //     }
    //   })
    //   console.log(coreSubjects, 'coreSubjects')
    //   setExcelData(
    //     students.map((student: any) => ({
    //       "Student ID": student?.student?.studentId?.toUpperCase(),
    //       Name: student?.student?.name?.trim().toUpperCase() || "",

    //       ...coreSubjects.reduce((acc: any, subject: any) => {
    //         const subjScores = getSubjectScore(student?.examTestScores, subject._id);
    //         console.log("subjScores", subjScores)
    //         const totalScore = subjScores?.length > 0 ? subjScores[0]?.totalScore : "-";
    //         const grade = subjScores?.length > 0 ? subjScores[0]?.grade : "-";
    //         acc[subject.name] = totalScore;
    //         acc[`${subject.name}_grade`] = grade;
    //         return acc;
    //       }, {}),
    //       ...electiveSubjects.reduce((acc: any, subject: any) => {
    //         const subjScores = getSubjectScore(student?.examTestScores, subject._id);
    //         const totalScore = subjScores.length > 0 ? subjScores[0]?.totalScore : "-";
    //         const grade = subjScores.length > 0 ? subjScores[0]?.grade : "-";
    //         acc[subject.name] = totalScore;
    //         acc[`Grade`] = grade;
    //         return acc;
    //       }, {}),

    //       ...grades.reduce((acc: any, grade: string) => {
    //         acc[grade] = getNumberOfGrades(student?.examTestScores, grade);
    //         return acc;
    //       }, {}),
    //       "Total Score": student?.overallScore || 0,
    //       "Agg": getBest6Aggregate(student?.examTestScores),
    //       "Pstn": student?.position || 0,
    //     })),
    //   );
    // }
  }, [students]);
  const handleExcelClick = () => {
    handleDownloadClose();
    let ws: any;
    if (filterBy === "subjects") {
      ws = XLSX.utils.json_to_sheet(excelData);
    } else {
      let coreSubjects: any[] = [];
      let electiveSubjects: any[] = [];
      subjectsInClass?.forEach((s: any) => {
        if (s.type === "core" || s._id === generalScienceSubjectId) {
          coreSubjects.push(s);
        } else {
          electiveSubjects.push(s);
        }
      });

      // Headers row: Student ID, Name, Subject1, Grade, Subject2, Grade, ..., Grade counts, Total Score, Agg, Pstn
      const headers = [
        "Student ID",
        "Name",
        ...coreSubjects.flatMap((subject: any) => [subject?.shortName?.toUpperCase(), "Grade"]),
        ...electiveSubjects.flatMap((subject: any) => [subject?.shortName?.toUpperCase(), "Grade"]),
        ...grades,
        "Total Score",
        "Agg",
        "Pstn"
      ];

      // Rows for each student
      const rows = students.map((student: any) => {
        const coreCells = coreSubjects.flatMap((subject: any) => {
          const subjScores = getSubjectScore(student?.examTestScores, subject._id);
          const totalScore = subjScores?.length > 0 ? subjScores[0]?.totalScore : "-";
          const grade = subjScores?.length > 0 ? subjScores[0]?.grade : "-";
          return [totalScore, grade];
        });

        const electiveCells = electiveSubjects.flatMap((subject: any) => {
          const subjScores = getSubjectScore(student?.examTestScores, subject._id);
          const totalScore = subjScores?.length > 0 ? subjScores[0]?.totalScore : "-";
          const grade = subjScores?.length > 0 ? subjScores[0]?.grade : "-";
          return [totalScore, grade];
        });

        const gradeCounts = grades.map((grade: string) => {
          return getNumberOfGrades(student?.examTestScores, grade);
        });

        return [
          student?.student?.studentId?.toUpperCase() || "",
          student?.student?.name?.trim().toUpperCase() || "",
          ...coreCells,
          ...electiveCells,
          ...gradeCounts,
          student?.overallScore || 0,
          getBest6Aggregate(student?.examTestScores),
          student?.position || 0
        ];
      });

      ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    }

    // Format sheet: apply borders, make headers bold, and auto-fit columns
    if (ws) {
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
      const colWidths: number[] = [];

      const thinBorder = {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      };

      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 0;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell) {
            // Apply borders to all cells
            cell.s = cell.s || {};
            cell.s.border = thinBorder;

            // Make headers (Row 0) bold
            if (R === 0) {
              cell.s.font = {
                bold: true,
                name: "Calibri",
                sz: 11,
              };
            } else {
              cell.s.font = {
                name: "Calibri",
                sz: 11,
              };
            }

            // Calculate length of the content for autofit
            const valStr = cell.v !== undefined && cell.v !== null ? String(cell.v) : "";
            if (valStr.length > maxLen) {
              maxLen = valStr.length;
            }
          }
        }
        // Set column width with padding
        // colWidths.push(Math.max(maxLen + 1, 2));
        colWidths.push(maxLen + 2);
      }

      ws["!cols"] = colWidths.map((w) => ({ wch: w }));
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    if (filterBy === "subjects") {
      XLSX.writeFile(wb, `${selectedExam?.name}_${selectedSubject?.name}.xlsx`);
    } else {
      XLSX.writeFile(wb, `${selectedExam?.name}_${selectedClass?.name}.xlsx`);
    }
  };


  return (
    <>
      <LoadingAlert open={loading} />
      <Box>
        <Typography
          variant="h5"
          gutterBottom
          mb={2}
          px={{ xs: 1, sm: 2, md: 3 }}
          pt={3}
        >
          Order of merits
        </Typography>

        <Divider />

        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"flex-end"}
          mb={2}
          mt={2}
          px={{ xs: 1, sm: 2, md: 3 }}
        >
          <Grid
            container
            spacing={2}
            display={"flex"}
            gap={3}
            alignItems={"flex-end"}
          >
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="body1" gutterBottom>
                Filter by
              </Typography>
              <Select
                fullWidth
                displayEmpty
                size="small"
                // input={<CustomizedSelect />}
                value={filterBy}
                onChange={(e) => {
                  setFilterBy(e.target.value);
                  setSelectedClass(null);
                  setSelectedSubject(null);
                  setStudents([]);
                  setFetchedStudents([]);
                }}
              >
                <MenuItem value={"class"}>class</MenuItem>
                <MenuItem value={"subjects"}>subjects</MenuItem>
              </Select>
            </Grid>
            {filterBy === "subjects" ? (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1" gutterBottom>
                  Select subject
                </Typography>
                <Autocomplete
                  id="filter-by-subject"
                  fullWidth
                  size="small"
                  options={subjects}
                  getOptionLabel={(option: any) => option?.name?.toUpperCase()}
                  // defaultValue={[top100Films[13]]}
                  onChange={handleSearchByProgramme}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField {...params} placeholder="subject" />
                  )}
                />
              </Grid>
            ) : (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body1" gutterBottom>
                  Select class
                </Typography>
                <Autocomplete
                  id="filter-by-class"
                  fullWidth
                  size="small"
                  options={classes}
                  getOptionLabel={(option: any) => option?.name?.toUpperCase()}
                  // defaultValue={classes[0]}
                  onChange={handleSearchByClass}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField {...params} placeholder="class" />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                onClick={fetchTestScores}
                disabled={selectedSubject === null && selectedClass === null}
              >
                Submit
              </Button>
            </Grid>
          </Grid>

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
              {/* {filterBy === "subjects" && ( */}
              <MenuItem onClick={handleExcelClick}>Data (EXCEL)</MenuItem>
              {/* )} */}
            </Menu>
          </Box>
        </Box>
        <Divider />
        {students?.length > 0 && (
          <Box mt={2} px={{ xs: 1, sm: 2, md: 3 }} mb={4}>
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: "calc(100vh - 200px)", // Adjust this value based on your layout
                overflow: "auto",
                // "& .MuiTable-stickyHeader": {
                //   "& th": {
                //     zIndex: 1,
                //   },
                // },
              }}
            >
              <Table
                stickyHeader
                sx={{ minWidth: 650 }}
                aria-label="students table"
              >
                <TableHead>
                  <TableRow>
                    <StyledTableCell>S/N</StyledTableCell>
                    <StyledTableCell>
                      Name{" "}
                      <Tooltip
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
                          onClick={handleSortByName}
                        />
                      </Tooltip>
                    </StyledTableCell>

                    {filterBy === "subjects" ? (
                      <>
                        <StyledTableCell>Class</StyledTableCell>
                        <StyledTableCell align="center">Score</StyledTableCell>
                        <StyledTableCell align="center">Grade</StyledTableCell>
                      </>
                    ) : (
                      <>
                        {grades.map((grade) => {
                          return (
                            <StyledTableCell key={grade} align="center">
                              {grade}
                            </StyledTableCell>
                          );
                        })}
                        <StyledTableCell align="center">
                          Total Score
                        </StyledTableCell>
                        <StyledTableCell align="center">Agg</StyledTableCell>
                      </>
                    )}
                    <StyledTableCell align="center">Pstn</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students &&
                    !!students?.length &&
                    students?.map((student: any, index: number) => (
                      <StyledTableRow key={student?._id}>
                        <StyledTableCell>
                          {student?.student?.studentId?.toUpperCase()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {`${student?.student?.name}`.trim().toUpperCase()}
                        </StyledTableCell>
                        {filterBy === "subjects" ? (
                          <>
                            <StyledTableCell>
                              {`${student?.student?.class?.form} ${student?.student?.class?.name}`.toUpperCase()}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {student?.totalScore}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {student?.grade}
                            </StyledTableCell>
                          </>
                        ) : (
                          <>
                            {grades.map((grade, index) => (
                              <StyledTableCell
                                key={grade + index}
                                align="center"
                              >
                                {getNumberOfGrades(
                                  student?.examTestScores,
                                  grade,
                                )}
                              </StyledTableCell>
                            ))}
                            <StyledTableCell align="center">
                              {student?.overallScore}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {getBest6Aggregate(student?.examTestScores)}
                            </StyledTableCell>
                          </>
                        )}
                        <StyledTableCell align="center">
                          {student?.position}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* <TablePagination
              rowsPerPageOptions={[10, 25, 1000]}
              component="div"
              count={students?.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            /> */}
          </Box>
        )}
      </Box>
    </>
  );
}
