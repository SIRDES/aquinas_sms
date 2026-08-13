"use client";
import { SnackbarType, StudentType } from "@/types/commonTypes";
import Image from "next/image";
import {
  Box,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { LegacyRef, forwardRef, useRef } from "react";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import { useReactToPrint } from "react-to-print";

const GradeTableCell = styled(TableCell)(({ theme }) => ({
  padding: "3px 8px",
  [`&.${tableCellClasses.head}`]: {
    // backgroundColor: theme.palette.primary.main,
    // color: theme.palette.common.white,
    fontSize: 10,
    fontWeight: "bold",
    border: "1px solid black",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 10,
    border: "1px solid black",
  },
}));

const ResultsTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const ResultsTableCell = styled(TableCell)(({ theme }) => ({
  padding: "9px 8px",
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const gradingSystem = [
  {
    id: 1,
    marks: "80 - 100",
    grade: "A1",
    remarks: "EXCELLENT",
  },
  {
    id: 2,
    marks: "70 - 79",
    grade: "B2",
    remarks: "VERY GOOD",
  },
  {
    id: 3,
    marks: "60 - 69",
    grade: "B3",
    remarks: "GOOD",
  },
  {
    id: 4,
    marks: "55 - 59",
    grade: "C4",
    remarks: "CREDIT",
  },
  {
    id: 5,
    marks: "50 - 54",
    grade: "C5",
    remarks: "CREDIT",
  },
  {
    id: 6,
    marks: "50 - 59",
    grade: "C6",
    remarks: "CREDIT",
  },
  {
    id: 7,
    marks: "45 - 49",
    grade: "D7",
    remarks: "PASS",
  },
  {
    id: 8,
    marks: "40 - 44",
    grade: "E8",
    remarks: "WEAK PASS",
  },
  {
    id: 9,
    marks: "0 - 39",
    grade: "E8",
    remarks: "FAIL",
  },
];
/* eslint-disable react/display-name */
const ComponentToPrint = forwardRef(
  (
    props: {
      studentsData: Array<StudentType>;
      batch: any;
    },
    ref: LegacyRef<HTMLDivElement> | undefined
  ) => {
    const { batch, studentsData } = props;
    // console.log(studentsData);
    return (
      <div ref={ref}>
        {studentsData?.length !== 0 &&
          studentsData.map((student: StudentType, index: number) => (
            <>
              <div className="page-break" />
              <Box
                key={index}
                // m={2}
                border={3}
                borderColor="#000"
                height={"100vh"}
              // width={"100%"}
              >
                <Box sx={{ borderBottom: "3px solid #000" }} p={2} pb={0}>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    textAlign={"center"}
                  >
                    AQUINAS REMEDIAL ASSOCIATION
                  </Typography>
                  <Typography
                    variant={"body2"}
                    fontWeight="bold"
                    textAlign={"center"}
                    gutterBottom
                  >
                    CANTONMENTS, ACCRA.
                  </Typography>
                  <Typography
                    variant={"body1"}
                    fontWeight="bold"
                    align={"center"}
                    gutterBottom
                  >
                    ACADEMIC REPORT
                  </Typography>

                  <Box display="flex" gap={2} justifyContent={"center"}>
                    {batch?.contact.length > 0 &&
                      batch?.contact?.map((contact: any) => (
                        <>
                          <Typography variant="body2" key={contact}>
                            {contact}
                          </Typography>
                        </>
                      ))}
                  </Box>

                  <Typography align="center">Email: {batch?.email}</Typography>
                </Box>
                <Box sx={{ borderBottom: "3px solid #000" }} p={2} mb={2}>
                  <Grid container spacing={1}>
                    {/* student name */}
                    <Grid item xs={8} sx={{ display: "flex", gap: "10px" }}>
                      <Typography variant="body1">Name:</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {student?.firstName?.toUpperCase()}{" "}
                        {student?.middleName?.toUpperCase()}{" "}
                        {student?.lastName?.toUpperCase()}
                      </Typography>
                    </Grid>

                    {/* student id */}
                    <Grid
                      item
                      xs={4}
                      sx={{
                        display: "flex",
                        gap: "5px",
                      }}
                    >
                      <Typography variant="body1">STUDENT ID:</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {student?.studentId?.split("/")[1]}
                      </Typography>
                    </Grid>
                    {/* duration */}
                    <Grid
                      item
                      xs={8}
                      sx={{
                        display: "flex",
                        gap: "5px",
                      }}
                    >
                      <Typography variant="body1">DURATION:</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {student?.studentId?.split("/")[0]?.toUpperCase()} -{" "}
                        {batch?.duration?.toUpperCase()}
                      </Typography>
                    </Grid>

                    {/* Form */}
                    <Grid item xs={4} sx={{ display: "flex", gap: "10px" }}>
                      <Typography variant="body1">YEAR:</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {batch?.form?.toUpperCase()}
                      </Typography>
                    </Grid>
                    {/* Programme */}
                    <Grid item xs={6} sx={{ display: "flex", gap: "10px" }}>
                      <Typography variant="body1">PROGRAMME:</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {student?.programme?.toUpperCase()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Paper
                  sx={{
                    width: "95%",
                    overflow: "hidden",
                    margin: "auto",
                    marginBottom: 2,
                  }}
                >
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table aria-label="results table">
                      <TableHead>
                        <TableRow>
                          <ResultsTableCell>SUBJECT</ResultsTableCell>

                          <ResultsTableCell align="center">
                            MARKS
                          </ResultsTableCell>
                          <ResultsTableCell align="center">
                            GRADE
                          </ResultsTableCell>
                          <ResultsTableCell>REMARKS</ResultsTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.keys(student.coreSubjects).length !== 0 &&
                          Object.keys(student.coreSubjects).map(
                            (subject: string, index: number) => (
                              <ResultsTableRow key={subject}>
                                <ResultsTableCell>
                                  {subject?.toUpperCase()}
                                </ResultsTableCell>
                                <ResultsTableCell align="center">
                                  {student.coreSubjects[subject].score}
                                </ResultsTableCell>
                                <ResultsTableCell align="center">
                                  {student.coreSubjects[
                                    subject
                                  ].grade?.toUpperCase()}
                                </ResultsTableCell>
                                <ResultsTableCell>
                                  {student.coreSubjects[
                                    subject
                                  ].remarks?.toUpperCase()}
                                </ResultsTableCell>
                              </ResultsTableRow>
                            )
                          )}
                        {Object.keys(student.selectedElectiveSubjects)
                          .length !== 0 &&
                          Object.keys(student.selectedElectiveSubjects)
                            .sort()
                            .map((subject: string, index: number) => (
                              <ResultsTableRow key={subject}>
                                <ResultsTableCell>
                                  {subject?.toUpperCase()}
                                </ResultsTableCell>
                                <ResultsTableCell align="center">
                                  {
                                    student.selectedElectiveSubjects[subject]
                                      .score
                                  }
                                </ResultsTableCell>
                                <ResultsTableCell align="center">
                                  {student.selectedElectiveSubjects[
                                    subject
                                  ].grade?.toUpperCase()}
                                </ResultsTableCell>
                                <ResultsTableCell>
                                  {student.selectedElectiveSubjects[
                                    subject
                                  ].remarks?.toUpperCase()}
                                </ResultsTableCell>
                              </ResultsTableRow>
                            ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                  gutterBottom
                >
                  GRADING SYSTEM
                </Typography>
                <TableContainer
                  sx={{
                    // maxHeight: 500,
                    width: "300px",
                    margin: "auto",
                    marginBottom: 2,
                  }}
                >
                  <Table aria-label="grading system table">
                    <TableHead>
                      <TableRow>
                        <GradeTableCell>MARKS</GradeTableCell>
                        <GradeTableCell align="center">GRADE</GradeTableCell>
                        <GradeTableCell align="center">REMARKS</GradeTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gradingSystem.map((grade: any, index: number) => (
                        <TableRow key={grade.id}>
                          <GradeTableCell>{grade?.marks}</GradeTableCell>
                          <GradeTableCell align="center">
                            {grade?.grade?.toUpperCase()}
                          </GradeTableCell>
                          <GradeTableCell align="center">
                            {grade?.remarks?.toUpperCase()}
                          </GradeTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src={"/assets/images/signature.jpg"}
                    alt="signature"
                    width={100}
                    height={50}
                  />
                  <Typography variant={"body2"}>
                    .............................
                  </Typography>
                  <Typography variant="body1">COURSE ORGANIZER</Typography>
                </Box>
              </Box>
            </>
          ))}
      </div>
    );
  }
);

const ResultsPDFs = ({
  studentsData,
  batch,
  handleCloseMenuList,
}: {
  studentsData: Array<StudentType>;
  handleCloseMenuList: () => Promise<void>;
  batch: any;
}) => {
  const componentRef = useRef<any>(null);
  const handlePrint = useReactToPrint({
    print: () => componentRef.current,
    onBeforePrint: () => handleCloseMenuList(),
    documentTitle: "Students reports",
    pageStyle: "@page {size: auto; margin: 0mm;background-color:red; }",
    onAfterPrint: () => { },
  });

  return (
    <div>
      <MenuItem sx={{ fontSize: "12px" }} onClick={() => handlePrint()}>
        Students report (pdf)
      </MenuItem>
      <Box style={{ display: "none" }}>
        <ComponentToPrint
          studentsData={studentsData}
          ref={componentRef}
          batch={batch}
        />
      </Box>
    </div>
  );
};

export default ResultsPDFs;
