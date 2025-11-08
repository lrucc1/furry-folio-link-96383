import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface VaccinationReminderEmailProps {
  userName: string
  petName: string
  petSpecies: string
  vaccineName: string
  notes?: string
  dueDate: string
  daysText: string
  appUrl: string
}

export const VaccinationReminderEmail = ({
  userName,
  petName,
  petSpecies,
  vaccineName,
  notes,
  dueDate,
  daysText,
  appUrl,
}: VaccinationReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>{vaccineName} vaccination for {petName} is due {daysText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>💉 Vaccination Reminder</Heading>
        </Section>
        
        <Section style={content}>
          <Text style={greeting}>Hi {userName},</Text>
          
          <Text style={paragraph}>
            This is a friendly reminder that the <strong>{vaccineName}</strong> vaccination for your {petSpecies}, <strong>{petName}</strong>, is due <strong>{daysText}</strong>.
          </Text>
          
          {notes && (
            <Section style={notesBox}>
              <Text style={notesLabel}>Notes:</Text>
              <Text style={notesText}>{notes}</Text>
            </Section>
          )}
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Due Date:</strong> {dueDate}
            </Text>
          </Section>
          
          <Section style={ctaSection}>
            <Link href={`${appUrl}/reminders`} style={button}>
              View Vaccination Records
            </Link>
          </Section>
          
          <Text style={paragraph}>
            Keeping vaccinations up to date is crucial for your pet's health and wellbeing. Log in to your PetLink ID account to manage your vaccination records.
          </Text>
        </Section>
        
        <Hr style={hr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            <strong>PetLink ID</strong> - Keep your pet's health on track
          </Text>
          <Text style={footerLink}>
            <Link href={appUrl} style={link}>petlinkid.io</Link>
          </Text>
          <Text style={footerSmall}>
            You're receiving this because you have vaccination reminders enabled for your pets.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default VaccinationReminderEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 48px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  borderRadius: '12px 12px 0 0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const content = {
  padding: '24px 48px',
}

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525f7f',
  margin: '16px 0',
}

const notesBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #f5576c',
  padding: '16px 20px',
  margin: '24px 0',
  borderRadius: '4px',
}

const notesLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#f5576c',
  margin: '0 0 8px',
}

const notesText = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#525f7f',
  margin: '0',
}

const infoBox = {
  backgroundColor: '#fff9e6',
  border: '1px solid #ffe066',
  padding: '16px 20px',
  margin: '16px 0',
  borderRadius: '6px',
}

const infoText = {
  fontSize: '15px',
  color: '#333333',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#f5576c',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px rgba(245, 87, 108, 0.3)',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  padding: '0 48px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '14px',
  color: '#525f7f',
  margin: '8px 0',
}

const footerLink = {
  fontSize: '14px',
  margin: '4px 0',
}

const link = {
  color: '#f5576c',
  textDecoration: 'none',
}

const footerSmall = {
  fontSize: '12px',
  color: '#8898aa',
  margin: '16px 0 0',
}
