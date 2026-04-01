/**
 * UI Styles for RU Coach Emails
 * This file centralizes all styles to avoid redundancy across templates.
 */

export const colors = {
  black: "#0b0a0d",
  card: "#18171a",
  primary: "#e5a84d",
  primaryForeground: "#0a0a0a",
  text: "#a1a1aa",
  muted: "#52525b",
  border: "#2a292d",
  hr: "#27272a",
  white: "#ffffff",
};

export const typography = {
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

export const main = {
  backgroundColor: colors.black,
  fontFamily: typography.fontFamily,
};

export const container = {
  margin: "0 auto",
  padding: "40px 20px",
  width: "100%",
  maxWidth: "540px",
};

export const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

export const logoImg = {
  margin: "0 auto",
  borderRadius: "14px",
};

export const logoText = {
  color: colors.primary,
  fontSize: "24px",
  fontWeight: "900",
  margin: "12px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "-0.05em",
};

export const coachSubtext = {
  color: colors.text,
  fontSize: "10px",
  fontWeight: "600",
  margin: "2px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
};

export const content = {
  backgroundColor: colors.card,
  padding: "40px",
  borderRadius: "24px",
  border: `1px solid ${colors.border}`,
};

export const h1 = {
  color: colors.white,
  fontSize: "28px",
  fontWeight: "800",
  textAlign: "center" as const,
  margin: "0 0 24px",
  letterSpacing: "-0.02em",
};

export const text = {
  color: colors.text,
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

export const infoBox = {
  backgroundColor: colors.black,
  borderRadius: "16px",
  padding: "24px",
  textAlign: "center" as const,
  border: `1px solid ${colors.primary}`,
  marginBottom: "24px",
};

export const infoBoxTitle = {
  fontSize: "12px",
  color: colors.text,
  fontWeight: "600",
  letterSpacing: "0.1em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

export const infoBoxContent = {
  fontSize: "24px",
  color: colors.primary,
  fontWeight: "800",
  margin: "0",
};

export const button = {
  backgroundColor: colors.primary,
  borderRadius: "12px",
  color: colors.primaryForeground,
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

export const hr = {
  borderColor: colors.hr,
  margin: "30px 0",
};

export const footer = {
  color: colors.muted,
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "0",
};
