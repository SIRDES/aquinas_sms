'use client';
/* eslint-disable jsx-a11y/alt-text */

import type React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekday from 'dayjs/plugin/weekday';

// Extend Day.js with needed plugins
dayjs.extend(advancedFormat);
dayjs.extend(weekday);

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
        position: 'relative',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
    },
    headerAddress: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: 70,
        height: 70,
    },
    profileContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'black',
        width: 90,
        height: 110,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    schoolName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#0100a3',
    },
    schoolAddress: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 2,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
    studentInfoContainer: {
        marginBottom: 10,
    },
    studentInfoLeft: {
        width: '50%',
    },
    headmasterContainer: {
        flexDirection: 'column',
    },
    headmasterSignature: {
        width: 120,
        height: 60,
        marginBottom: -5,
    },
    headmasterName: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    headmasterTitle: {
        fontSize: 12,
    },
});

interface StudentAdmissionLetterProps {
    data: any;
}

const StudentAdmissionLetter: React.FC<StudentAdmissionLetterProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark Image */}
                <Image
                    src="/images/aquinasLogo.png"
                    style={{
                        position: 'absolute',
                        top: '25%',
                        left: '50%',
                        marginLeft: -175, // Half of the width (350 / 2)
                        width: 350,
                        height: 370,
                        opacity: 0.05,
                        // transform: 'rotate(-45deg)', // Optional
                    }}
                />

                {/* Header */}
                <View style={styles.header}>
                    {/* <View>
                        <Image src="/images/aquinasLogo.png" style={styles.logo} />
                    </View> */}
                    <View style={styles.headerAddress}>
                        <Text style={styles.schoolName}>ST. THOMAS AQUINAS SENIOR HIGH SCHOOL</Text>
                        <Text style={styles.schoolAddress}>POST OFFICE BOX 101 OSU ACCRA</Text>
                        {/* <Text style={styles.schoolAddress}>Telephone : 0249074997 / 0302776801</Text> */}
                        <Text style={styles.schoolAddress}>Website : https://aquinasshs.org</Text>
                        <Text style={styles.schoolAddress}>Digital Address: GL-044-9893</Text>
                        <Image src="/images/aquinasLogo.png" style={styles.logo} />
                        <Text style={styles.reportTitle}>ADMISSION LETTER</Text>
                    </View>
                    {/* <View style={styles.profileContainer}>
                        <Image src={data?.profileImage} style={styles.profileImage} />
                    </View> */}
                    {/* <View>
                        <Image src="/images/aquinasLogo.png" style={styles.logo} />
                    </View> */}
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text>HEADMASTER</Text>
                    <Text>{dayjs(data?.adminSettings?.admissionDetails?.date).format('Do MMMM, YYYY')}</Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>Our Ref. No. : {data?.adminSettings?.admissionDetails?.admissionLetterRefNo}</Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>
                        Dear <Text style={{ fontWeight: 'bold' }}>{`${data?.firstName} ${data?.lastName}`?.trim()?.toUpperCase()}</Text>,
                    </Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text style={{ fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center' }}>
                        ADMISSION TO FORM ONE - {data?.adminSettings?.admissionDetails?.name?.split(' ')[0]} ACADEMIC YEAR
                    </Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>
                        I am pleased to inform you that you have been offered admission as a{' '}
                        <Text style={{ fontWeight: 'bold' }}>DAY</Text> student into Form One in ST. THOMAS AQUINAS SENIOR HIGH SCHOOL to offer{' '}
                        <Text style={{ fontWeight: 'bold' }}>{data?.admissionProgramme}</Text> under the Government's Free Senior High School
                        Programme from the 2024/2025 Academic Year.
                    </Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>
                        Within your programme of choice, you shall study four elective subjects in addition to the prescribed core
                        subjects. The elective subjects you select cannot be varied during the course of your learning in the school.
                    </Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>
                        You shall undergo a medical examination in the school on a date that will be communicated to you and/or your
                        parents or guardian.
                    </Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>
                        You are expected to report to school on{' '}
                        <Text style={{ fontWeight: 'bold' }}>
                            {dayjs(data?.adminSettings?.admissionDetails?.reportingDate).format('dddd, Do MMMM YYYY')} at 08:00 AM
                        </Text>{' '}
                        in the company of a parent or a designated guardian. Please present yourself, upon reporting, at the School
                        Administration Block for registration. Ensure to complete and submit the following documents:
                    </Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <View>
                        <Text>1. Student Data Form</Text>
                        <Text>2. Parental Commitment Form</Text>
                        <Text>3. Two (2) passport-size pictures</Text>
                        <Text>4. A copy of your birth certificate</Text>
                        <Text>5. A copy of your BECE results slip</Text>
                        <Text>6. Your original placement forms fully filled and stamped</Text>
                        <Text>7. Copies of your NHIS card & National ID Card (Ghana Card if any)</Text>
                    </View>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>
                        Be reminded that you are enrolling in a highly disciplined and hardworking catholic school. You will be
                        required to behave appropriately, and to work hard to meet the high standards of the school.
                    </Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <Text>Please, accept my congratulations!</Text>
                </View>

                <View style={styles.studentInfoContainer}>
                    <View style={styles.studentInfoLeft}>
                        <View style={styles.headmasterContainer}>
                            <Text style={{ marginBottom: 5 }}>Yours faithfully,</Text>
                            <Image src="/images/head-sign.png" style={styles.headmasterSignature} />
                            <Text style={styles.headmasterName}>REV. FR. DR. GEORGE OBENG APPAH</Text>
                            <Text style={styles.headmasterTitle}>(HEADMASTER)</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default StudentAdmissionLetter;
