/* ----------------  STYLES  ---------------- */
export const styles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "#f8f9fa",
  },
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#ffffff",
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "8px",
    marginTop: "20px",
    marginBottom: "20px",
  },
  logoSection: {
    marginBottom: "24px",
  },
  logo: {
    borderRadius: "6px",
    display: "block",
  },
  company: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
    lineHeight: "70px",
  },
  heading: {
    color: "#333333",
    fontSize: "24px",
    margin: "0 0 16px 0",
    textAlign: "center" as const,
  },
  text: {
    color: "#666666",
    fontSize: "16px",
    lineHeight: 1.5,
    margin: "0 0 16px 0",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#666",
    fontSize: "12px",
    textAlign: "center" as const,
  },
  hr: {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #eaeaea",
  },
  idCard: {
    marginTop: "24px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center" as const,
    backgroundColor: "#f9fafb",
  },
  avatar: {
    borderRadius: "50%",
    margin: "0 auto 12px",
  },
  name: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  title: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 12px",
  },
  contactRow: {
    margin: "12px 0",
  },
  contactLink: {
    fontSize: "14px",
    color: "#007acc",
    textDecoration: "none",
    display: "block",
    margin: "4px 0",
  },

  /* ✅ New styles for Feature Highlight + Button */
  featureHighlight: {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    textAlign: "center" as const,
  },
  primaryButton: {
    display: "inline-block",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    marginTop: "12px",
  },
  perksSection: {
    paddingTop: "15px",
    paddingBottom: "15px",
    marginTop: "20px",
  },
  subHeading: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#111", // dark for readability
  },
  perksList: {
    paddingLeft: "20px",
    margin: "0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#333",
  },
  summarySection: {
    textAlign: "center" as const,
    padding: "25px 20px",
    marginTop: "15px",
    marginBottom: "20px",
  },

  summaryHeading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "12px",
  },

  summaryText: {
    fontSize: "15px",
    color: "#444",
    lineHeight: "1.6",
    marginBottom: "12px",
    textAlign: "center" as const,
  },

intakeList: {
  listStyleType: "none",
  paddingLeft: "0",
  margin: "12px auto 20px",
  maxWidth: "400px",
  textAlign: "left" as const,
  color: "#333",
  fontSize: "15px",
  lineHeight: "1.7",
},
} as const;
