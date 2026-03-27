import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";

interface InvitationEmailProps {
  clientName?: string;
  code?: string;
  signUpUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gymcoach.app";

export const InvitationEmail = ({
  clientName = "Atleta",
  code = "ABC-123",
  signUpUrl = `${baseUrl}/auth/sign-up?code=ABC-123`,
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Tu código de acceso a GymCoach: {code}</Preview>
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
          <Heading style={h1}>¡Bienvenido a GymCoach!</Heading>
          <Text style={text}>
            Hola <strong>{clientName}</strong>, tu entrenador te ha registrado en la plataforma. 
            Usa el siguiente código para crear tu cuenta y comenzar tu transformación.
          </Text>
          
          <Section style={codeContainer}>
            <Text style={codeTitle}>TU CÓDIGO DE ACCESO</Text>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Text style={text}>
            Haz clic en el botón de abajo para registrarte. El código es válido por 30 días.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={signUpUrl}>
              Crear mi cuenta
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            Si no esperabas este correo, simplemente ignóralo.
            <br />
            © 2026 GymCoach Premium Coaching.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default InvitationEmail;

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

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const text = {
  color: "#a1a1aa",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const codeContainer = {
  background: "#0a0a0a",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  border: "1px dashed #e5a84d",
  marginBottom: "24px",
};

const codeTitle = {
  fontSize: "12px",
  color: "#a1a1aa",
  fontWeight: "600",
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const codeText = {
  fontSize: "32px",
  color: "#e5a84d",
  fontWeight: "800",
  letterSpacing: "6px",
  margin: "0",
  fontFamily: "monospace",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#e5a84d",
  borderRadius: "8px",
  color: "#0a0a0a",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
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
