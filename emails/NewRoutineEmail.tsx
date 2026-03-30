import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface NewRoutineEmailProps {
  clientName?: string;
  routineName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ru-coach.app";

export const NewRoutineEmail = ({
  clientName = "Atleta",
  routineName = "Nueva Rutina Personalizada",
}: NewRoutineEmailProps) => (
  <BaseLayout previewText="¡Tienes una nueva rutina asignada en RU Coach!">
    <Heading style={h1}>¡Nueva Rutina Asignada!</Heading>
    <Text style={text}>
      Hola <strong>{clientName}</strong>, Rodrigo Urbina te ha asignado un nuevo plan de entrenamiento personalizado:
    </Text>
    
    <Section style={routineBox}>
      <Text style={routineTitle}>{routineName}</Text>
    </Section>

    <Text style={text}>
      Ya puedes ver todos los detalles, ejercicios y series en tu app.
    </Text>

    <Section style={btnContainer}>
      <Button style={button} href={`${baseUrl}/client/routines`}>
        Ver mi nueva rutina
      </Button>
    </Section>

    <Text style={text}>
      ¡Es hora de llevar tu entrenamiento al siguiente nivel con RU Coach!
    </Text>
  </BaseLayout>
);

export default NewRoutineEmail;

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

const routineBox = {
  background: "#0a0a0a",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  border: "1px solid #e5a84d",
  marginBottom: "24px",
};

const routineTitle = {
  fontSize: "20px",
  color: "#e5a84d",
  fontWeight: "700",
  margin: "0",
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
