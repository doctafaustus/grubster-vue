window.endpoint = (window.location.origin.indexOf('http://localhost') > -1) ? 'http://localhost:8080' : 'http://www.grubster.me';

export const AUTH_CONFIG = {
  clientId: 'IZzdmaJh7q7CdHM07VVSJzdXi9Dbp7Tp',
  domain: 'grubster.auth0.com',
  callbackUrl: `${window.endpoint}/callback`,
  apiUrl: `${window.endpoint}/api`,
  redirect_uri: `${window.endpoint}/callback`,
}