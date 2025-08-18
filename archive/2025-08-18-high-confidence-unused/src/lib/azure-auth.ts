import { ConfidentialClientApplication } from '@azure/msal-node';
import { verify } from 'azure-ad-verify-token';

// Microsoft Entra ID (Azure AD) Configuration
const tenantId = process.env.ENTRA_TENANT_ID || '';
const clientId = process.env.ENTRA_CLIENT_ID || '';
const clientSecret = process.env.ENTRA_CLIENT_SECRET || '';

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId,
    clientSecret,
    authority: `https://login.microsoftonline.com/${tenantId}`
  }
};

// Initialize MSAL Application
const msalClient = new ConfidentialClientApplication(msalConfig);

// Get authorization URL for Microsoft Entra ID sign-in
export async function getAuthorizationUrl(redirectUri: string, state?: string) {
  const authCodeUrlParameters = {
    scopes: ['openid', 'profile', 'email', 'User.Read'],
    redirectUri,
    state
  };

  return msalClient.getAuthCodeUrl(authCodeUrlParameters);
}

// Exchange authorization code for access token
export async function getTokenFromCode(code: string, redirectUri: string) {
  const tokenRequest = {
    code,
    redirectUri,
    scopes: ['openid', 'profile', 'email', 'User.Read'],
  };

  try {
    const response = await msalClient.acquireTokenByCode(tokenRequest);
    return response;
  } catch (error) {
    console.error('Error acquiring token:', error);
    throw error;
  }
}

// Verify ID token from Azure AD
export async function verifyAzureADToken(token: string) {
  try {
    const options = {
      jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      audience: clientId,
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`
    };
    
    const payload = await verify(token, options);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

// Get user information from Microsoft Graph API
export async function getUserInfo(accessToken: string) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
} 