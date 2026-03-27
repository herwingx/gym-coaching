import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";

interface PaymentConfirmationEmailProps {
  clientName?: string;
  amount?: string;
  planName?: string;
  expiryDate?: string;
}

export const PaymentConfirmationEmail = ({
  clientName = "Atleta",
  amount = "$0.00",
  planName = "Membresía",
  expiryDate = "N/A",
}: PaymentConfirmationEmailProps) => (
  <BaseLayout previewText="¡Pago recibido con éxito!">
    <Heading style={h1}>¡Pago Confirmado!</Heading>
    <Text style={text}>
      Hola <strong>{clientName}</strong>, hemos registrado tu pago correctamente.
    </Text>
    
    <Section style={paymentBox}>
      <Text style={paymentItem}>
        <span style={label}>Monto:</span> <strong>{amount}</strong>
      </Text>
      <Text style={paymentItem}>
        <span style={label}>Plan:</span> <strong>{planName}</strong>
      </Text>
      <Text style={paymentItem}>
        <span style={label}>Vence:</span> <strong>{expiryDate}</strong>
      </Text>
    </Section>

    <Text style={text}>
      Gracias por confiar en GymCoach para tu transformación. ¡Seguimos avanzando!
    </Text>
  </BaseLayout>
);

export default PaymentConfirmationEmail;

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

const paymentBox = {
  background: "#0a0a0a",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "left" as const,
  border: "1px solid #27272a",
  marginBottom: "24px",
};

const paymentItem = {
  fontSize: "16px",
  color: "#ffffff",
  margin: "0 0 8px",
};

const label = {
  color: "#a1a1aa",
  width: "80px",
  display: "inline-block",
};
