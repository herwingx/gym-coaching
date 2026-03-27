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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gymcoach.app";

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
            alt="GymCoach Logo"
            style={logoImg}
          />
          <Text style={logoText}>GymCoach</Text>
        </Section>
        <Section style={content}>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            © 2026 GymCoach Premium Coaching.
            <br />
            Entrenamiento basado en ciencia y resultados.
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

const logoText = {
  color: "#e5a84d",
  fontSize: "20px",
  fontWeight: "800",
  margin: "12px 0 0",
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
