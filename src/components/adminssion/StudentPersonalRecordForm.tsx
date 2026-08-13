"use client"
/* eslint-disable jsx-a11y/alt-text */

import type React from "react"
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    // Font,
    // PDFViewer,
} from "@react-pdf/renderer"
// import { object } from "yup"
import { formatPhoneNumber } from "react-phone-number-input"

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10,
        // paddingBottom: 10,
        // borderBottom: "1px solid black",
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
        display: "flex",
        // flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "black",
        // marginBottom: 10,
        width: 90,
        height: 110,
    },
    profileImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        // backgroundColor: "red",
        // alignSelf: "center",
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
    },
    sessionTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: "white",
        padding: 5,
        backgroundColor: "#0100a3",
        // textAlign: "center",
        // marginTop: 5,
        marginBottom: 5,
    },
    studentInfoContainer: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
    },
    studentInfoLeft: {
        width: "50%",
    },
    studentInfoRight: {
        width: "50%",
        // textAlign: "right",
    },
    studentInfoRow: {
        marginBottom: 5,
        flexDirection: "row",
    },
    studentInfoLabel: {
        fontWeight: "bold",
        marginRight: 5,
    },
    dottedUnderline: {
        borderBottomWidth: 1,
        borderBottomColor: "black",
        borderStyle: "dashed",
        flex: 1,
        // paddingBottom: 2,
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
    watermark: {
        position: "absolute",
        top: "40%",
        left: "10%",
        opacity: 0.1,
        transform: "rotate(-45deg)",
        fontSize: 80,
        color: "gray",
    },
})

interface StudentReportCardProps {
    data: any
    image?: React.ReactNode | string
}

const StudentPersonalRecordForm: React.FC<StudentReportCardProps> = ({ data }) => (
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
                    <Text style={styles.reportTitle}>STUDENT'S PERSONAL RECORD CARD</Text>
                </View>
                {/* <View style={styles.profileContainer}>
                    <Image src={data?.profileImage} style={styles.profileImage} />
                </View> */}
                {/* <View>
                    <Image src="/images/aquinasLogo.png" style={styles.logo} />
                </View> */}
            </View>
            <View>
                <Text style={styles.sessionTitle}>PERSONAL DETAILS</Text>
            </View>
            {/* PERSONAL DETAILS */}
            <View style={styles.studentInfoContainer}>
                <View style={styles.studentInfoLeft}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Name :</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.firstName?.toUpperCase()} {" "}{data?.lastName?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Date of Birth:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{new Date(data?.dob || 0).toDateString()?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Place of birth:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.placeOfBirth?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Town:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.town?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Region:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.region?.toUpperCase()}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.studentInfoRight}>
                    {/* <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Gender:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.gender?.toUpperCase()}</Text>
                        </View>
                    </View> */}
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Religion:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.religion?.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Denomination:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.religiousDenomination?.toUpperCase() || "N/A"}</Text>
                        </View>
                    </View>

                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Home Address:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.permanentAddress?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>District:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.district?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Nationality:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.nationality?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View>
                <Text style={styles.sessionTitle}>ENROLMENT DETAILS</Text>
            </View>
            { /* ENROLMENT DETAILS */}
            <View style={styles.studentInfoContainer}>
                <View style={styles.studentInfoLeft}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Admission No:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.studentId?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>BECE Index No:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.beceIndexNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Raw score:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.rawScore}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>JHS:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.jhsAttended?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.studentInfoRight}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Programme:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.admissionProgramme?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Aggregate of best six:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.aggregate}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Enrolment code :</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.csspsEnrolmentCode}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>JHS type:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.jhsType?.toUpperCase()}</Text>
                        </View>
                    </View>

                </View>
            </View>
            { /* PARENTAL DETAILS */}
            <View>
                <Text style={styles.sessionTitle}>PARENTAL DETAILS</Text>
            </View>
            <View style={styles.studentInfoContainer}>
                <View style={styles.studentInfoLeft}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Father's name:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.fatherFirstName?.toUpperCase()} {" "}{data?.fatherLastName?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Mother's name:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.motherFirstName?.toUpperCase()} {" "}{data?.motherLastName?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Guardian:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.parentFirstName?.toUpperCase()} {" "}{data?.parentLastName?.toUpperCase()}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.studentInfoRight}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Father's ocupation:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.fatherOccupation?.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Mother's ocupation:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.motherOccupation?.toUpperCase()}</Text>
                        </View>
                    </View>
                    {/* <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Enrolment code :</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.csspsEnrolmentCode}</Text>
                        </View>
                    </View> */}
                    {/* <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>JHS type:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.jhsType?.toUpperCase()}</Text>
                        </View>
                    </View> */}

                </View>
            </View>

            { /* CONTACT DETAILS */}
            <View>
                <Text style={styles.sessionTitle}>CONTACT DETAILS</Text>
            </View>
            <View style={styles.studentInfoContainer}>
                <View style={styles.studentInfoLeft}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Primary Phone Number:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{formatPhoneNumber(data?.parentPhoneNumber)}</Text>
                        </View>
                    </View>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Email:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.parentEmail?.toLowerCase() || "N/A"}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.studentInfoRight}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Alt. Phone Number:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{data?.altPhoneNumber ? formatPhoneNumber(data?.altPhoneNumber) : "N/A"}</Text>
                        </View>
                    </View>

                </View>
            </View>
            <View>
                <Text style={styles.sessionTitle}>CERTIFY</Text>
            </View>
            <View style={styles.studentInfoContainer}>
                <Text>I HEREBY CERTIFY that the information provided in this form is complete, true and correct to the best of my knowledge.
                </Text>
            </View>
            <View style={styles.studentInfoContainer}>
                {/* <View style={styles.studentInfoLeft}>
                    <View style={styles.studentInfoRow}>
                        <Text style={styles.studentInfoLabel}>Primary Phone Number:</Text>
                        <View style={styles.dottedUnderline}>
                            <Text>{formatPhoneNumber(data?.parentPhoneNumber)}</Text>
                        </View>
                    </View>

                </View> */}

                <View style={styles.studentInfoLeft}>
                    <View style={{ marginVertical: 20 }}>
                        <View style={styles.dottedUnderline}>
                            <Text></Text>
                        </View>
                        <Text style={styles.studentInfoLabel}>Signature of Student</Text>
                    </View>
                    <View>
                        <View style={styles.dottedUnderline}>
                            <Text></Text>
                        </View>
                        <Text style={styles.studentInfoLabel}>Date</Text>
                    </View>

                </View>
            </View>
        </Page>
    </Document>
)

export default StudentPersonalRecordForm
