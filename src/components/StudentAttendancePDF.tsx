import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import dayjs from 'dayjs';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: '1px solid black',
  },
  headerAddress: { flex: 1 },
  logo: { width: 80, height: 80 },
  schoolName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0100a3',
  },
  schoolAddress: { fontSize: 12, textAlign: 'center', marginBottom: 2 },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  studentInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  studentInfoLeft: { width: '60%' },
  studentInfoRight: { width: '40%', textAlign: 'right' },
  studentInfoRow: { marginBottom: 5, flexDirection: 'row' },
  studentInfoLabel: { fontWeight: 'bold', marginRight: 5 },
  studentInfoValue: { marginLeft: 2 },
  summaryContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    border: '1px solid #000',
    padding: 10,
  },
  summaryBox: { alignItems: 'center' },
  summaryTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  summaryValue: { fontSize: 14, fontWeight: 'bold' },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  tableHeaderRow: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  tableColDate: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: 'black',
    padding: 4,
  },
  tableColStatus: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: 'black',
    padding: 4,
    textAlign: 'center',
  },
  tableColHoliday: {
    width: '60%',
    padding: 4,
    textAlign: 'center',
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  tableHeaderCell: { fontWeight: 'bold', fontSize: 12 },
});

interface StudentAttendancePDFProps {
  student: any;
  logs: any[];
  fetchedHolidays: any[];
  daysInMonth: any[];
  attendanceRate: string | number;
  totalMorningPresent: number;
  totalAfternoonPresent: number;
  totalExpectedDays: number;
  totalExpectedMorningDays: number;
  totalExpectedAfternoonDays: number;
  filterBy: string;
  fromDate?: string;
  toDate?: string;
}

const getDayStatus = (log: any, period: "morningTime" | "afternoonTime") => {
  if (!log) return "Absent";
  const time = log[period];
  if (!time || time.trim() === "") return "Absent";
  return `Present (${time})`;
};

const StudentAttendancePDF: React.FC<StudentAttendancePDFProps> = ({
  student,
  logs,
  fetchedHolidays,
  daysInMonth,
  attendanceRate,
  totalMorningPresent,
  totalAfternoonPresent,
  totalExpectedDays,
  totalExpectedMorningDays,
  totalExpectedAfternoonDays,
  filterBy,
  fromDate,
  toDate,
}) => {
  let periodText = "";
  if (filterBy === "week") periodText = "This Week";
  else if (filterBy === "month") periodText = "This Month";
  else if (filterBy === "dateRange") periodText = `${fromDate} to ${toDate}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
            <Text style={styles.reportTitle}>STUDENT ATTENDANCE REPORT</Text>
            <Text style={styles.schoolAddress}>Period: {periodText}</Text>
          </View>
          <View>
            <Image src="/images/aquinasLogo.png" style={styles.logo} />
          </View>
        </View>

        <View style={styles.studentInfoContainer}>
          <View style={styles.studentInfoLeft}>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Name :</Text>
              <Text style={styles.studentInfoValue}>
                {`${student?.firstName ? student.firstName.toUpperCase() : ""} ${student?.lastName ? student.lastName.toUpperCase() : ""
                  }`}
              </Text>
            </View>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Admission No:</Text>
              <Text style={styles.studentInfoValue}>
                {student?.studentId?.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.studentInfoRight}>
            <View style={styles.studentInfoRow}>
              <Text style={styles.studentInfoLabel}>Class :</Text>
              <Text style={styles.studentInfoValue}>
                {student?.classDetails?.form} {student?.classDetails?.name?.toUpperCase() || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>ATTENDANCE</Text>
            <Text style={styles.summaryValue}>{logs.length} / {totalExpectedDays} Days</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666666', marginTop: 2 }}>{attendanceRate}%</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>MORNING PRESENT</Text>
            <Text style={styles.summaryValue}>{totalMorningPresent} / {totalExpectedMorningDays}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>AFTERNOON PRESENT</Text>
            <Text style={styles.summaryValue}>{totalAfternoonPresent} / {totalExpectedAfternoonDays}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>HOLIDAYS</Text>
            <Text style={styles.summaryValue}>{fetchedHolidays.length}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={styles.tableColDate}>
              <Text style={styles.tableHeaderCell}>DATE</Text>
            </View>
            <View style={styles.tableColStatus}>
              <Text style={styles.tableHeaderCell}>MORNING</Text>
            </View>
            <View style={[styles.tableColStatus, { borderRightWidth: 0 }]}>
              <Text style={styles.tableHeaderCell}>AFTERNOON</Text>
            </View>
          </View>

          {daysInMonth.map((day, index) => {
            const logForDay = logs.find(l => dayjs(l.date).isSame(day, "day"));
            const holidayForDay = fetchedHolidays.find((h: any) => dayjs(h.date).isSame(day, "day"));
            const mStatus = getDayStatus(logForDay, "morningTime");
            const aStatus = getDayStatus(logForDay, "afternoonTime");

            return (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableColDate}>
                  <Text>{day.format("MMM DD, YYYY")} - {day.format("dddd").toUpperCase()}</Text>
                </View>
                {holidayForDay && (!holidayForDay.duration || holidayForDay.duration === 'full_day') ? (
                  <View style={styles.tableColHoliday}>
                    <Text>HOLIDAY: {holidayForDay.description.toUpperCase()}</Text>
                  </View>
                ) : (
                  <>
                    {holidayForDay && holidayForDay.duration === 'morning' ? (
                      <View style={[styles.tableColStatus, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={{ color: '#D97706', fontSize: 10, textAlign: "center" }}>HOLIDAY {holidayForDay.description.toUpperCase()}</Text>
                      </View>
                    ) : (
                      <View style={styles.tableColStatus}>
                        <Text style={{ color: mStatus.startsWith("Present") ? "green" : "red" }}>
                          {mStatus}
                        </Text>
                      </View>
                    )}
                    {holidayForDay && holidayForDay.duration === 'afternoon' ? (
                      <View style={[styles.tableColStatus, { backgroundColor: '#FEF3C7', borderRightWidth: 0 }]}>
                        <Text style={{ color: '#D97706', fontSize: 10, textAlign: "center" }}>HOLIDAY {holidayForDay.description.toUpperCase()}</Text>
                      </View>
                    ) : (
                      <View style={[styles.tableColStatus, { borderRightWidth: 0 }]}>
                        <Text style={{ color: aStatus.startsWith("Present") ? "green" : "red" }}>
                          {aStatus}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export default StudentAttendancePDF;
