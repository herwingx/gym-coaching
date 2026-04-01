import {
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./BaseLayout";
import * as theme from "./theme";

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
    <Heading style={theme.h1}>¡Pago Confirmado!</Heading>
    <Text style={theme.text}>
      Hola <strong>{clientName}</strong>, hemos registrado tu pago correctamente en RU Coach.
    </Text>
    
    <Section style={theme.infoBox}>
      <Text style={theme.infoBoxTitle}>DETALLE DEL PAGO</Text>
      <Text style={{ ...theme.infoBoxContent, fontSize: "18px" }}>
        {planName} — {amount}
      </Text>
      <Text style={{ ...theme.text, fontSize: "14px", margin: "8px 0 0" }}>
        Vence el: {expiryDate}
      </Text>
    </Section>

    <Text style={theme.text}>
      Gracias por confiar en Rodrigo Urbina para tu transformación. ¡Seguimos avanzando!
    </Text>
  </BaseLayout>
);

export default PaymentConfirmationEmail;
