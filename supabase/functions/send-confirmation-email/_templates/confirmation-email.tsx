import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ConfirmationEmailProps {
  firstName: string;
  confirmUrl: string;
  token: string;
}

export const ConfirmationEmail = ({
  firstName,
  confirmUrl,
  token,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to motorcars.ng - Confirm your account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🚗 motorcars.ng</Heading>
        </Section>
        
        <Section style={content}>
          <Heading style={h2}>Welcome to motorcars.ng, {firstName}!</Heading>
          <Text style={text}>
            Thank you for joining Nigeria's trusted car marketplace. To get started, 
            please confirm your email address by clicking the button below.
          </Text>
          
          <Section style={buttonContainer}>
            <Button
              href={confirmUrl}
              style={button}
            >
              Confirm Your Account
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this confirmation code: <strong style={code}>{token}</strong>
          </Text>
          
          <Text style={smallText}>
            If you didn't create an account with motorcars.ng, you can safely ignore this email.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            © 2024 motorcars.ng - Nigeria's Premier Car Marketplace
          </Text>
          <Text style={footerText}>
            Browse thousands of verified cars from trusted dealers across Nigeria.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ConfirmationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#dc2626',
  borderRadius: '8px 8px 0 0',
};

const content = {
  padding: '32px 20px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const code = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 12px',
  display: 'inline-block',
  fontFamily: 'monospace',
};

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  padding: '32px 20px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0 0',
};