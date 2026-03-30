import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ru-coach.app";

export const BaseLayout = ({ previewText, children }: BaseLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src={`${baseUrl}/android-chrome-512x512.png`}
            width="64"
            height="64"
            alt="RU Coach Logo"
            style={logoImg}
          />
          <div style={logoWrapper}>
            <Text style={logoText}>RU Coach</Text>
            <Text style={coachSubtext}>Rodrigo Urbina</Text>
          </div>
        </Section>
        <Section style={content}>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            © 2026 RU Coach Premium Coaching.
            <br />
            Rodrigo Urbina - Entrenamiento de Élite.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  width: "100%",
  maxWidth: "500px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoImg = {
  margin: "0 auto",
  borderRadius: "14px",
};

const logoWrapper = {
  marginTop: "12px",
};

const logoText = {
  color: "#e5a84d",
  fontSize: "24px",
  fontWeight: "900",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "-0.05em",
};

const coachSubtext = {
  color: "#a1a1aa",
  fontSize: "10px",
  fontWeight: "600",
  margin: "2px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
};

const content = {
  backgroundColor: "#18181b",
  padding: "40px",
  borderRadius: "16px",
  border: "1px solid #27272a",
};

const hr = {
  borderColor: "#27272a",
  margin: "20px 0",
};

const footer = {
  color: "#52525b",
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "0",
};
