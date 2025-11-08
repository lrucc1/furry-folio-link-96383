import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface HealthReminderEmailProps {
  userName: string
  petName: string
  petSpecies: string
  reminderTitle: string
  reminderDescription?: string
  dueDate: string
  daysText: string
  appUrl: string
}

export const HealthReminderEmail = ({
  userName,
  petName,
  petSpecies,
  reminderTitle,
  reminderDescription,
  dueDate,
  daysText,
  appUrl,
}: HealthReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Reminder: {reminderTitle} for {petName} is due {daysText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🐾 Pet Health Reminder</Heading>
        </Section>
        
        <Section style={content}>
          <Text style={greeting}>Hi {userName},</Text>
          
          <Text style={paragraph}>
            This is a friendly reminder that <strong>{reminderTitle}</strong> for your {petSpecies}, <strong>{petName}</strong>, is due <strong>{daysText}</strong>.
          </Text>
          
          {reminderDescription && (
            <Section style={detailsBox}>
              <Text style={detailsLabel}>Details:</Text>
              <Text style={detailsText}>{reminderDescription}</Text>
            </Section>
          )}
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Due Date:</strong> {dueDate}
            </Text>
          </Section>
          
          <Section style={ctaSection}>
            <Link href={`${appUrl}/reminders`} style={button}>
              View All Reminders
            </Link>
          </Section>
          
          <Text style={paragraph}>
            Log in to your PetLink ID account to manage your reminders and keep your pet's health on track.
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
            You're receiving this because you have health reminders enabled for your pets.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default HealthReminderEmail

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
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

const detailsBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #667eea',
  padding: '16px 20px',
  margin: '24px 0',
  borderRadius: '4px',
}

const detailsLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#667eea',
  margin: '0 0 8px',
}

const detailsText = {
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
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
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
  color: '#667eea',
  textDecoration: 'none',
}

const footerSmall = {
  fontSize: '12px',
  color: '#8898aa',
  margin: '16px 0 0',
}
