import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface WelcomeEmailProps {
  clientName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ru-coach.app";

export const WelcomeEmail = ({
  clientName = "Atleta",
}: WelcomeEmailProps) => (
  <BaseLayout previewText="¡Bienvenido a la comunidad RU Coach!">
    <Heading style={h1}>¡Cuenta activada!</Heading>
    <Text style={text}>
      Hola <strong>{clientName}</strong>, tu cuenta en RU Coach ha sido creada con éxito.
    </Text>
    <Text style={text}>
      Ya puedes acceder a tu dashboard para ver tus rutinas personalizadas por Rodrigo Urbina, registrar tus progresos y empezar a ganar XP.
    </Text>

    <Section style={btnContainer}>
      <Button style={button} href={`${baseUrl}/client/dashboard`}>
        Ir a mi Dashboard
      </Button>
    </Section>

    <Text style={text}>
      Recuerda que la constancia es la clave del éxito. ¡Vamos a darle con todo!
    </Text>
  </BaseLayout>
);

export default WelcomeEmail;

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

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
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
