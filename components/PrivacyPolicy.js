// e:\Kwentura\Kwentura_Mobile\components\PrivacyPolicy.js
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

const PRIVACY_SECTIONS = [
  {
    id: "information",
    title: "1. INFORMATION WE COLLECT",
    content: "We collect personal information from you when you register for and use the App. This information may include:",
    subsections: [
      {
        title: "Guardian Information:",
        items: ["First Name", "Last Name", "Email Address", "Phone Number"]
      },
      {
        title: "Student Information:",
        items: ["First Name", "Last Name", "Learner's Reference Number (LRN)", "Grade Level", "Section"]
      }
    ],
    additionalContent: "We may also collect additional information if you choose to provide it for the use of the App."
  },
  {
    id: "usage",
    title: "2. HOW WE USE YOUR INFORMATION",
    content: "The information we collect is used to:",
    listItems: [
      "Provide you with access to the App and its features.",
      "Verify your identity and eligibility to use the App.",
      "Communicate with you regarding updates, notices, and other information about the App.",
      "Improve the functionality and services of the App.",
      "Respond to your inquiries and requests."
    ]
  },
  {
    id: "security",
    title: "3. DATA SECURITY",
    content: "We are committed to ensuring that your information is secure. We take reasonable measures to protect the personal data you provide to us from unauthorized access, disclosure, alteration, or destruction. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
  },
  {
    id: "sharing",
    title: "4. SHARING YOUR INFORMATION",
    content: "We do not share your personal information with third parties without your consent, except in the following cases:",
    listItems: [
      "Legal Requirements: If we are required by law to do so, we may disclose your information to comply with legal obligations, protect our rights, or prevent illegal activities.",
      "Service Providers: We may share your information with trusted service providers who assist us in operating the App and providing services to you. These providers are obligated to keep your data confidential."
    ],
    additionalContent: "We will never sell or rent your personal information to third parties."
  },
  {
    id: "retention",
    title: "5. DATA RETENTION",
    content: "We will retain your personal information only for as long as necessary for the purposes outlined in this Privacy Policy. Once your information is no longer needed, we will securely delete or anonymize it, in accordance with applicable laws and regulations."
  },
  {
    id: "rights",
    title: "6. YOUR RIGHTS AND CHOICES",
    content: "As a user, you have the following rights:",
    listItems: [
      "Access to Your Data: You have the right to request a copy of the personal data we hold about you.",
      "Correction of Data: You have the right to request corrections to any inaccurate or incomplete personal data.",
      "Deletion of Data: You may request that we delete your personal data, subject to any legal obligations we may have to retain it."
    ],
    additionalContent: "To exercise these rights, please contact us using the contact details provided at the end of this Policy."
  },
  {
    id: "children",
    title: "7. CHILDREN'S PRIVACY",
    content: "The App is intended for children ages 5 to 6 (Kindergarten to Grade 1). We collect personal information from guardians of children within this age range in order to provide access to the App and its services. By using the App, you affirm that you are the guardian of a child who meets these age requirements.",
    additionalContent: "We do not knowingly collect personal information from children under 5 years of age. If we become aware that we have inadvertently collected personal information from a child under the age of 5, we will take steps to delete that information."
  },
  {
    id: "changes",
    title: "8. CHANGES TO THIS PRIVACY POLICY",
    content: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated \"Effective Date.\" We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your personal information."
  }
];

const CONTACT_INFO = {
  email: "lopenafv@students.nu-moa.edu.ph",
  phone: "09686870844",
  address: "571 MLQ ST Purok 6 Bagumbayan Taguig City"
};

const PrivacyPolicy = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSection(current => current === sectionId ? null : sectionId);
  }, []);

  const renderSubsection = (subsection, index) => (
    <View key={index} style={styles.subsectionContainer}>
      <Text style={styles.subsectionTitle}>{subsection.title}</Text>
      {subsection.items.map((item, itemIndex) => (
        <View key={itemIndex} style={styles.listItem}>
          <View style={styles.bullet} />
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );

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
          
          {section.subsections && (
            <View style={styles.subsectionsContainer}>
              {section.subsections.map((subsection, index) => renderSubsection(subsection, index))}
            </View>
          )}
          
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
      source={require('../images/About.png')} // Using same background
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
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.subtitle}>
                  Your privacy matters to us
                </Text>
              </View>

              {/* Effective Date Card */}
              <View style={styles.dateCard}>
                <Ionicons name="calendar-outline" size={20} color="#FFCF2D" />
                <Text style={styles.effectiveDate}>Effective Date: June 4, 2025</Text>
              </View>

              {/* Introduction Card */}
              <View style={styles.introCard}>
                <View style={styles.privacyIconContainer}>
                  <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.paragraph}>
                  This Privacy Policy explains how we collect, use, disclose, and
                  protect your personal information when you use the Kwentura mobile
                  application. By accessing or using the App, you agree to the
                  collection and use of your information in accordance with this Policy.
                </Text>
                <Text style={[styles.paragraph, { fontWeight: 'bold', marginBottom: 0 }]}>
                  Please read this Privacy Policy carefully to understand our views and
                  practices regarding your personal data.
                </Text>
              </View>

              {/* Privacy Sections */}
              <View style={styles.section}>
                <Text style={styles.mainSectionTitle}>Privacy Policy Details</Text>
                {PRIVACY_SECTIONS.map(section => renderExpandableSection(section))}
              </View>

              {/* Data Protection Highlight */}
              <View style={styles.protectionCard}>
                <View style={styles.protectionHeader}>
                  <Ionicons name="lock-closed" size={20} color="#FFCF2D" />
                  <Text style={styles.protectionTitle}>Data Protection Compliance</Text>
                </View>
                <Text style={styles.protectionText}>
                  All data is handled in compliance with applicable data protection
                  laws, including the Data Privacy Act of 2012 of the Republic of the Philippines.
                </Text>
              </View>

              {/* Contact Section */}
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Contact Us</Text>
                <Text style={styles.contactSubtitle}>
                  If you have any questions or concerns about this Privacy Policy or how
                  we handle your personal data, please contact us:
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

              {/* Consent Section */}
              <View style={styles.consentCard}>
                <Ionicons name="hand-right" size={24} color="#2196F3" style={styles.consentIcon} />
                <Text style={styles.consentText}>
                  By using the App, you consent to the terms of this Privacy Policy.
                  Thank you for trusting us with your personal information.
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
    alignItems: "center",
  },
  privacyIconContainer: {
    marginBottom: 12,
  },
  protectionCard: {
    backgroundColor: "rgba(255, 207, 45, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 207, 45, 0.2)",
  },
  protectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  protectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  protectionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
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
  subsectionsContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  subsectionContainer: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  listContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
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
  consentCard: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.2)",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  consentIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  consentText: {
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

export default PrivacyPolicy;