"use client";
import type React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { getBest6Aggregate } from "@/utils/services/utils";
// import { StudentData } from "@/types/student"

// Register fonts
// Font.register({
//     family: "Times New Roman",
//     fonts: [
//         { src: "https://fonts.gstatic.com/s/timesnewroman/v18/4iCp6KVjbNBYlgoKejZftWyI.ttf", fontWeight: 400 },
//         { src: "https://fonts.gstatic.com/s/timesnewroman/v18/4iCp6KVjbNBYlgoKejZftWyI.ttf", fontWeight: 700 },
//     ],
// })

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    // fontFamily: "Times New Roman",
    fontSize: 12,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    // alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1px solid black",
  },
  headerAddress: {
    flex: 1,
    // alignItems: "center",
    // marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    // marginBottom: 5,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0100a3",
  },
  schoolAddress: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 2,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
    // marginBottom: 5,
    // paddingBottom: 5,
  },
  studentInfoContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    // marginTop: 10,
  },
  studentInfoLeft: {
    width: "70%",
  },
  studentInfoRight: {
    width: "30%",
    textAlign: "right",
  },
  studentInfoRow: {
    marginBottom: 5,
    flexDirection: "row",
  },
  studentInfoLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  studentInfoValue: {
    marginLeft: 2,
  },
  averageMarkContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  firstSemContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  tableHeaderRow: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableColSubject: {
    width: "38%",
    borderRightWidth: 1,
    borderRightColor: "black",
    padding: 4,
  },
  tableColScore: {
    width: "12%",
    borderRightWidth: 1,
    borderRightColor: "black",
    padding: 4,
    textAlign: "center",
  },
  tableColClassAvg: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "black",
    padding: 4,
    textAlign: "center",
  },
  tableColPosition: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "black",
    padding: 4,
    textAlign: "center",
  },
  tableColGrade: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "black",
    padding: 4,
    textAlign: "center",
  },
  tableColRemarks: {
    width: "16%",
    // borderRightWidth: 1,
    // borderRightColor: "black",
    padding: 4,
  },
  // tableColInitials: {
  //     width: "8%",
  //     padding: 4,
  //     textAlign: "center",
  // },
  tableHeaderCell: {
    fontWeight: "bold",
    fontSize: 12,
  },
  tableHeaderSubCell: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  sectionHeader: {
    fontWeight: "bold",
    marginTop: 2,
    marginBottom: 2,
  },
  totalRow: {
    flexDirection: "row",
    // borderBottomWidth: 1,
    // borderBottomColor: "black",
    fontWeight: "bold",
  },
  attendanceContainer: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
  },
  attendanceLabel: {
    width: "20%",
    fontWeight: "bold",
  },
  attendanceValue: {
    width: "15%",
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginRight: 5,
  },
  promotionStatus: {
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    paddingBottom: 5,
  },
  reportContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  reportLabel: {
    fontWeight: "bold",
  },
  reportValue: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginTop: 15,
    marginBottom: 5,
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  signatureItem: {
    width: "30%",
    textAlign: "center",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    textAlign: "center",
  },
  gradesBox: {
    border: "1px solid black",
    padding: 5,
    marginTop: 10,
    width: "30%",
  },
  gradesTitle: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  gradesText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  headmasterContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 10,
  },
  headmasterSignature: {
    width: 120,
    height: 60,
    marginBottom: -5,
  },
  headmasterName: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  headmasterTitle: {
    fontSize: 9,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "10%",
    opacity: 0.1,
    transform: "rotate(-45deg)",
    fontSize: 80,
    color: "gray",
  },
});

// const gradeValue = {
//   A1: 1,
//   B2: 2,
//   B3: 3,
//   C4: 4,
//   C5: 5,
//   C6: 6,
//   D7: 7,
//   E8: 8,
//   F9: 9,
// };

// const gradeCoreSubjects = [
//   "67a7c20a65f7639968515146",
//   "67a7c20a65f7639968515156",
//   "67a7c20a65f763996851515d",
//   "67a7c20a65f763996851514c",
//   "685441de72cf3cd5e517c2ce",
//   "685441de72cf3cd5e517c2cf",
//   "685441de72cf3cd5e517c2d0",
//   "685441de72cf3cd5e517c2d1",
// ];
interface StudentReportCardProps {
  students: Array<any>;
}
const examsTotalScore = (exams: any) => {
  let total = 0;
  for (let i = 0; i < exams.length; i++) {
    total += exams[i].totalScore;
  }
  return Number(total).toFixed(1);
};

const generalScienceSubjectId = "685441de72cf3cd5e517c2d1"; // ID for General Science subject


const examsAverageScore = (exams: any) => {
  let total = 0;
  for (let i = 0; i < exams.length; i++) {
    total += exams[i].totalScore;
  }
  return total / exams.length;
};

const MultipleStudentsReportCard: React.FC<StudentReportCardProps> = ({
  students,
}) => (
  <Document>
    {students?.map((data: any) => (
      <Page size="A4" style={styles.page} key={data.student._id}>
        {/* School Header */}
        <View style={styles.header}>
          <View>
            <Image src="/images/aquinasLogo.png" style={styles.logo} />
          </View>
          <View style={styles.headerAddress}>
            <Text style={styles.schoolName}>
              ST. THOMAS AQUINAS SENIOR HIGH SCHOOL
            </Text>
            <Text style={styles.schoolAddress}>
              POST OFFICE BOX 101 OSU ACCRA
            </Text>
            <Text style={styles.schoolAddress}>
              Telephone : 0249074997 / 0302776801
            </Text>
            <Text style={styles.schoolAddress}>
              E-mail : aquinasshs.2014@yahoo.com
            </Text>
            <Text style={styles.schoolAddress}>
              Digital Address: GL-044-9893
            </Text>
            {/* Report Title */}
            <Text style={styles.reportTitle}>STUDENT'S REPORT</Text>
          </View>
          <View>
            <Image src="/images/aquinasLogo.png" style={styles.logo} />
          </View>
        </View>

        {/* Student Information - Top Row */}
        <View style={styles.studentInfoContainer}>
          <View style={styles.studentInfoLeft}>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Name :</Text>
              <Text
                style={styles.studentInfoValue}
              >{`${data?.student?.firstName ? data?.student?.firstName?.toUpperCase() : ""} ${data?.student?.lastName ? data?.student?.lastName?.toUpperCase() : ""}`}</Text>
            </View>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Admission No:</Text>
              <Text style={styles.studentInfoValue}>
                {data?.student?.studentId?.toUpperCase()}
              </Text>
            </View>

            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Programme:</Text>
              <Text style={styles.studentInfoValue}>
                {data?.student?.class?.programmeDetails?.name?.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.studentInfoRight}>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Class :</Text>
              <Text
                style={styles.studentInfoValue}
              >{`${data?.batchInfo?.form} ${data?.student?.class?.name?.toUpperCase()}`}</Text>
            </View>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Year:</Text>
              <Text style={styles.studentInfoValue}>
                {data?.academicYearDetails?.name?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Semester:</Text>
              <Text style={styles.studentInfoValue}>
                {data?.batchInfo?.examType?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Subjects Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={styles.tableColSubject}>
              <Text style={styles.tableHeaderCell}>Subjects</Text>
            </View>
            <View style={styles.tableColScore}>
              <Text style={styles.tableHeaderCell}>Class</Text>
              <Text style={styles.tableHeaderSubCell}>Score</Text>
              <Text style={styles.tableHeaderSubCell}>
                {data?.batchInfo?.isNewCurriculum ? "60%" : "30%"}
              </Text>
            </View>
            <View style={styles.tableColScore}>
              <Text style={styles.tableHeaderCell}>Exam</Text>
              <Text style={styles.tableHeaderSubCell}>Score</Text>
              <Text style={styles.tableHeaderSubCell}>
                {data?.batchInfo?.isNewCurriculum ? "40%" : "70%"}
              </Text>
            </View>
            <View style={styles.tableColScore}>
              <Text style={styles.tableHeaderCell}>Total</Text>
              <Text style={styles.tableHeaderSubCell}>Score</Text>
              <Text style={styles.tableHeaderSubCell}>100%</Text>
            </View>

            <View style={styles.tableColGrade}>
              <Text style={styles.tableHeaderCell}>Grades</Text>
            </View>
            <View style={styles.tableColRemarks}>
              <Text style={styles.tableHeaderCell}>Remarks</Text>
            </View>
          </View>

          {/* Core Subjects */}
          {data?.scores
            ?.filter(
              (subject: any) =>
                subject?.subjectDetails.type === "core" ||
                subject?.subjectDetails._id === generalScienceSubjectId,
            )
            .map((subject: any, index: number) => (
              <View key={`core-${index}`} style={styles.tableRow}>
                <View style={styles.tableColSubject}>
                  <Text>{subject?.subjectDetails?.name?.toUpperCase()}</Text>
                </View>
                <View style={styles.tableColScore}>
                  <Text>{subject?.classScore}</Text>
                </View>
                <View style={styles.tableColScore}>
                  <Text>{subject?.marks}</Text>
                </View>
                <View style={styles.tableColScore}>
                  <Text>{subject?.totalScore}</Text>
                </View>

                <View style={styles.tableColGrade}>
                  <Text>{subject?.grade?.toUpperCase()}</Text>
                </View>
                <View style={styles.tableColRemarks}>
                  <Text>{subject?.remarks?.toUpperCase()}</Text>
                </View>
              </View>
            ))}

          {/* Elective Subjects Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColSubject, { fontWeight: "bold" }]}>
              <Text style={styles.sectionHeader}>[ELECTIVE SUBJECTS:]</Text>
            </View>
            <View style={styles.tableColScore}>
              <Text></Text>
            </View>
            <View style={styles.tableColScore}>
              <Text></Text>
            </View>
            <View style={styles.tableColScore}>
              <Text></Text>
            </View>
            <View style={styles.tableColClassAvg}>
              <Text></Text>
            </View>
            {/* <View style={styles.tableColPosition}>
                        <Text></Text>
                    </View> */}
            {/* <View style={styles.tableColGrade}>
                        <Text></Text>
                    </View>
                    <View style={styles.tableColRemarks}>
                        <Text></Text>
                    </View>
                    <View style={styles.tableColInitials}>
                        <Text></Text>
                    </View> */}
          </View>

          {/* Elective Subjects */}
          {data?.scores
            ?.filter(
              (subject: any) =>
                subject?.subjectDetails.type === "elective" &&
                subject?.subjectDetails._id !== generalScienceSubjectId,
            )
            .map((subject: any, index: number) => (
              <View key={`elective-${index}`} style={styles.tableRow}>
                <View style={styles.tableColSubject}>
                  <Text>{subject?.subjectDetails?.name?.toUpperCase()}</Text>
                </View>
                <View style={styles.tableColScore}>
                  <Text>{subject?.classScore}</Text>
                </View>
                <View style={styles.tableColScore}>
                  <Text>{subject?.marks}</Text>
                </View>
                <View style={styles.tableColScore}>
                  <Text>{subject?.totalScore}</Text>
                </View>

                <View style={styles.tableColGrade}>
                  <Text>{subject?.grade?.toUpperCase()}</Text>
                </View>
                <View style={styles.tableColRemarks}>
                  <Text>{subject?.remarks?.toUpperCase()}</Text>
                </View>
              </View>
            ))}

          {/* Total Row */}
          <View style={styles.totalRow}>
            <View style={styles.tableColSubject}>
              <Text style={{ fontWeight: "bold" }}>TOTAL</Text>
            </View>
            <View style={styles.tableColScore}>
              <Text></Text>
            </View>
            <View style={styles.tableColScore}>
              <Text></Text>
            </View>
            <View style={styles.tableColScore}>
              <Text>{examsTotalScore(data?.scores)}</Text>
            </View>

            <View style={[styles.tableColRemarks, { width: "26%" }]}>
              <Text>
                AGGREGATE OF BEST SIX SUBJECTS:{" "}
                {getBest6Aggregate(data?.scores)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {/* Grades Interpretation */}
          <View style={styles.gradesBox}>
            <Text style={styles.gradesTitle}>Interpretation of Grades:</Text>
            <Text style={styles.gradesText}>
              80 TO 100 = A1: EXCELLENT;{"\n"}70 TO 79 = B2: VERY GOOD;{"\n"}
              60 TO 69 = B3: GOOD;{"\n"}55 TO 59 = C4: CREDIT;{"\n"}50 TO 54 =
              C5: CREDIT;{"\n"}
              45 TO 49 = C6: CREDIT;{"\n"}40 TO 44 = D7: PASS;{"\n"}35 TO 39 =
              E8: PASS;{"\n"}0 TO 34 = F9: FAIL;
            </Text>
          </View>

          {/* Headmaster Signature */}
          <View style={styles.headmasterContainer}>
            <Image
              src="/images/head-sign.png"
              style={styles.headmasterSignature}
            />
            <Text style={styles.headmasterName}>
              REV. FR. DR. GEORGE OBENG APPAH
            </Text>
            <Text style={styles.headmasterTitle}>(HEADMASTER)</Text>
          </View>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark}>
          {data?.batchInfo?.examType?.toUpperCase()}
        </Text>
      </Page>
    ))}
  </Document>
);

export default MultipleStudentsReportCard;
