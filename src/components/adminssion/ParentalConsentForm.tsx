"use client"

/* eslint-disable jsx-a11y/alt-text */

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
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { formatPhoneNumber } from 'react-phone-number-input';

dayjs.extend(advancedFormat);

// Define props interface
interface ParentalCommitmentFormProps {
    data: any;
}

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
        lineHeight: 1.5,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        // marginBottom: 5,
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
    schoolName: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        color: "#0100a3",
    },
    schoolAddress: {
        fontSize: 12,
        textAlign: "center",
        // marginBottom: 2,
    },
    reportTitle: {
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        // marginTop: 5,
    },
    paragraph: {
        marginBottom: 5,
        textAlign: 'justify',
    },
    numbered: {
        marginLeft: 20,
        marginBottom: 5,
    },
    pledge: {
        marginLeft: 40,
        // marginBottom: 2,
    },
    signatureBlock: {
        // marginTop: 10,
    },
    signatureLine: {
        marginBottom: 5,
    },
    footer: {
        // marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bold: {
        fontWeight: 'bold',
    },
});

const ParentalCommitmentForm: React.FC<ParentalCommitmentFormProps> = ({
    data
}) => {
    const formattedDate = dayjs(data?.adminSettings?.admissionDetails?.reportingDate).format('Do MMMM, YYYY');

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
                        {/* <Text style={styles.schoolAddress}>POST OFFICE BOX 101 OSU ACCRA</Text> */}
                        {/* <Text style={styles.schoolAddress}>Telephone : 0249074997 / 0302776801</Text> */}
                        {/* <Text style={styles.schoolAddress}>Website : https://aquinasshs.org</Text>
                        <Text style={styles.schoolAddress}>Digital Address: GL-044-9893</Text> */}
                        <Image src="/images/aquinasLogo.png" style={styles.logo} />
                        <Text style={styles.reportTitle}>PARENTAL COMMITMENT FORM</Text>
                    </View>
                    {/* <View>
                        <Image src="/images/aquinasLogo.png" style={styles.logo} />
                    </View> */}
                </View>

                <Text style={styles.paragraph}>
                    I, <Text style={styles.bold}>{`${data?.parentFirstName} ${data?.parentLastName}`?.trim()?.toUpperCase()}</Text> , hereby willingly enter into this bond with
                    St. Thomas Aquinas Senior High School on behalf of my ward, Master{' '}
                    <Text style={styles.bold}>{`${data?.firstName} ${data?.lastName}`?.trim()?.toUpperCase()}</Text>, to uphold, together with my ward, the precepts
                    established hereafter for the entire duration of my ward’s learning in the school.
                </Text>

                <Text style={styles.numbered}>
                    1. I acknowledge that I willingly sought and obtained admission for my ward at St. Thomas Aquinas Senior High School.
                </Text>
                <Text style={styles.numbered}>
                    2. I further acknowledge that St. Thomas Aquinas Senior High School, as a <Text style={styles.bold}>Catholic Category A School</Text>, requires the best and most appropriate behaviour from my ward.
                </Text>
                <Text style={styles.numbered}>
                    3. I commit to ensuring that my ward focuses on his academic work and adopts positive learning habits in order to achieve excellent results.
                </Text>
                <Text style={styles.numbered}>4. I pledge to ensure, among others, that my ward:</Text>

                {[
                    'a. shall not absent himself from or come late to school (Students must report by 7:00 am)',
                    'b. shall not abscond from school or leave school before closing (School closes at 4:00 pm)',
                    'c. shall not bring or use a mobile phone or other electronic gadgets',
                    'd. shall not bring offensive weapons or dangerous items',
                    'e. shall not fight, bully, harass or intimidate others',
                    'f. shall not carry bushy hair, facial hair, or beard',
                    'g. shall not scale school fences, pass through gutters or hide in bushes',
                    'h. shall not play cards, gamble, borrow money or commit fraud',
                    'i. shall not destroy school property intentionally',
                ].map((rule, index) => (
                    <Text key={index} style={styles.pledge}>
                        {rule}
                    </Text>
                ))}

                <Text style={styles.numbered}>
                    5. I recognize the authority of St. Thomas Aquinas Senior High School to impose appropriate disciplinary sanctions on my ward if he infringes the established Code of Conduct for Students of St. Thomas Aquinas Senior High School, including but not limited to suspension (internal, external, indefinite), dismissal, and criminal prosecution.
                </Text>

                <Text style={styles.paragraph}>
                    <Text style={styles.bold}>Note:</Text> Unapproved items retrieved from students are not returnable.
                </Text>
                <View>
                    <Text style={[styles.bold, { textAlign: 'center' }]}>STUDENT AND PARENT/GUARDIAN SIGNATURE</Text>
                </View>
                <View style={styles.signatureBlock}>
                    <Text style={styles.signatureLine}>
                        Name of student: {`${data?.parentFirstName} ${data?.parentLastName}`?.trim()?.toUpperCase()} Signature: ____________ Date: ____________
                    </Text>
                    <Text style={styles.signatureLine}>
                        Name of parent: {`${data?.firstName} ${data?.lastName}`?.trim()?.toUpperCase()}  Signature: ____________ Date: ____________
                    </Text>
                    <Text>
                        Contact(s) of Parent: {formatPhoneNumber(data?.parentPhoneNumber)} {data?.altPhoneNumber && `and ${formatPhoneNumber(data?.altPhoneNumber)}`}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.bold, { textAlign: 'center' }]}>SCHOOL USE ONLY</Text>
                </View>
                <View style={styles.footer}>
                    <View>
                        <Text>Head of School</Text>
                        <Text style={{ marginBottom: 30 }}>Signature and Stamp</Text>
                        <Text>Date: ___________</Text>
                    </View>
                    <View>
                        <Text>Chairperson (DC)</Text>
                        <Text style={{ marginBottom: 30 }}>Signature and Stamp</Text>
                        <Text>Date: ___________</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ParentalCommitmentForm;
