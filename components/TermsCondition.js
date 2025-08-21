// e:\Kwentura\Kwentura_Mobile\components\TermsCondition.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "./HeaderProfileBackOnly";

const { width, height } = Dimensions.get('window');

const TERMS_SECTIONS = [
  {
    id: "acceptance",
    title: "1. ACCEPTANCE OF TERMS",
    content: "By accessing or using the App, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with these Terms, you are not authorized to use the App."
  },
  {
    id: "eligibility",
    title: "2. ELIGIBILITY FOR REGISTRATION",
    content: "You may only register for and use the App if you meet the following criteria:",
    listItems: [
      "You are a parent or legal guardian of a student currently enrolled at Monlimar Development Academy.",
      "If your child is not enrolled at Monlimar Development Academy, you are not permitted to use or register for the App."
    ]
  },
  {
    id: "registration",
    title: "3. ACCOUNT REGISTRATION",
    content: "To use the App, you must complete the registration process. You are required to provide the following information:",
    listItems: [
      "Guardian Information: First Name, Last Name, and Phone Number",
      "Student Information: First Name, Last Name, Learner's Reference Number (LRN), Grade Level, and Section"
    ],
    additionalContent: "You agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account."
  },
  {
    id: "restrictions",
    title: "4. RESTRICTIONS ON USE",
    content: "You may not use the App to:",
    listItems: [
      "Register if your child is not currently enrolled at Monlimar Development Academy.",
      "Engage in illegal activities, including but not limited to, fraud, data theft, or harassment.",
      "Violate any applicable local, state, or national laws or regulations."
    ],
    additionalContent: "We reserve the right to suspend or terminate any account found in violation of these restrictions."
  },
  {
    id: "privacy",
    title: "5. DATA PRIVACY AND SECURITY",
    content: "We are committed to protecting your privacy. The personal information you provide during the registration process is collected and stored securely. We will use your data solely for the purposes of operating the App and providing related services. We will not share your personal information with third parties without your consent, unless required by law.",
    additionalContent: "All data is handled in compliance with applicable data protection laws, including the Data Privacy Act of 2012 of the Republic of the Philippines. For further details, please refer to our Privacy Policy."
  },
  {
    id: "intellectual",
    title: "6. INTELLECTUAL PROPERTY",
    content: "The App and all its contents, including but not limited to, text, graphics, logos, images, software, and designs, are the exclusive intellectual property of the student developers of \"I.Think\" from the NU MOA Group and Monlimar Development Academy. You are granted a limited, non-transferable license to access and use the App for personal, non-commercial purposes. Any unauthorized use or reproduction of the content is prohibited."
  },
  {
    id: "termination",
    title: "7. ACCOUNT SUSPENSION AND TERMINATION",
    content: "We reserve the right, at our sole discretion, to suspend or terminate your account and access to the App at any time, with or without notice, for any reason, including without limitation if we believe that you have violated these Terms. Upon termination, you must immediately cease all use of the App."
  },
  {
    id: "modifications",
    title: "8. MODIFICATIONS TO THE TERMS AND CONDITIONS",
    content: "We may update these Terms at any time, and such changes will be effective immediately upon posting the revised Terms on the App. You are encouraged to review these Terms periodically. Your continued use of the App after any changes constitutes your acceptance of the modified Terms."
  },
  {
    id: "liability",
    title: "9. LIMITATION OF LIABILITY",
    content: "To the fullest extent permitted by law, Monlimar Development Academy and the developers of the App shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or revenue arising out of your use or inability to use the App.",
    additionalContent: "We are not liable for any technical issues, interruptions, or unauthorized access to your account, or for any losses that may result from such incidents."
  },
  {
    id: "governing",
    title: "10. GOVERNING LAW AND DISPUTE RESOLUTION",
    content: "These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from or in connection with these Terms shall be resolved through binding arbitration, in accordance with the rules of the Philippine Dispute Resolution Center, Inc (PDRCI)."
  }
];

const CONTACT_INFO = {
  email: "lopenafv@students.nu-moa.edu.ph",
  phone: "09686870844",
  address: "571 MLQ ST PUROK 6 BAGUMBAYAN TAGUIG CITY"
};

const TermsCondition = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSection(current => current === sectionId ? null : sectionId);
  }, []);

  const renderExpandableSection = (section) => (
    <View key={section.id} style={styles.expandableSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Ionicons
          name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
      {expandedSection === section.id && (
        <View style={styles.sectionContent}>
          <Text style={styles.paragraph}>{section.content}</Text>
          
          {section.listItems && (
            <View style={styles.listContainer}>
              {section.listItems.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          
          {section.additionalContent && (
            <Text style={[styles.paragraph, { marginTop: 12 }]}>
              {section.additionalContent}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require('../images/About.png')} // Using same background as About.js
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <AppHeader
              navigation={navigation}
              leftIconType="drawer"
              showSearch={true}
            />
            
            <View style={styles.textContainer}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Text style={styles.title}>Terms & Conditions</Text>
                <Text style={styles.subtitle}>
                  Please read these terms carefully
                </Text>
              </View>

              {/* Effective Date Card */}
              <View style={styles.dateCard}>
                <Ionicons name="calendar-outline" size={20} color="#FFCF2D" />
                <Text style={styles.effectiveDate}>Effective Date: June 4, 2025</Text>
              </View>

              {/* Introduction Card */}
              <View style={styles.introCard}>
                <Text style={styles.paragraph}>
                  Welcome to the Kwentura mobile application. The following Terms and
                  Conditions govern your use of the App, and by registering for or using
                  the App, you agree to comply with these Terms. If you do not agree to
                  these Terms, please refrain from using the App.
                </Text>
                <Text style={[styles.paragraph, { fontWeight: 'bold', marginBottom: 0 }]}>
                  Please read these Terms carefully.
                </Text>
              </View>

              {/* Terms Sections */}
              <View style={styles.section}>
                <Text style={styles.mainSectionTitle}>Terms & Conditions</Text>
                {TERMS_SECTIONS.map(section => renderExpandableSection(section))}
              </View>

              {/* Contact Section */}
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Contact Information</Text>
                <Text style={styles.contactSubtitle}>
                  If you have any questions or concerns about these Terms, please contact us:
                </Text>
                
                <View style={styles.contactDetails}>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={16} color="#FFCF2D" />
                    <Text style={styles.contactText}>{CONTACT_INFO.email}</Text>
                  </View>
                  
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={16} color="#FFCF2D" />
                    <Text style={styles.contactText}>{CONTACT_INFO.phone}</Text>
                  </View>
                  
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={16} color="#FFCF2D" />
                    <Text style={styles.contactText}>{CONTACT_INFO.address}</Text>
                  </View>
                </View>
              </View>

              {/* Acknowledgment Section */}
              <View style={styles.acknowledgmentCard}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.checkIcon} />
                <Text style={styles.acknowledgmentText}>
                  By registering and using the App, you acknowledge that you have read,
                  understood, and agreed to these Terms and Conditions. Thank you for
                  using the Kwentura mobile application.
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  © 2025 Kwentura - Monlimar Development Academy
                </Text>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  textContainer: {
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Fredoka-SemiBold',
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  effectiveDate: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginLeft: 8,
    fontWeight: "bold",
  },
  introCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 25,
  },
  mainSectionTitle: {
    fontSize: 20,
    fontFamily: 'Fredoka-SemiBold',
    color: "#333",
    marginBottom: 15,
  },
  expandableSection: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
    marginBottom: 12,
  },
  listContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFCF2D",
    marginTop: 8,
    marginRight: 10,
    marginLeft: 4,
  },
  listText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    flex: 1,
    textAlign: "justify",
  },
  contactSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  contactSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  contactDetails: {
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  acknowledgmentCard: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.2)",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  acknowledgmentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
    flex: 1,
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  versionText: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
});

export default TermsCondition;