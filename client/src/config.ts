// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'cyhhoeyclg'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-frxc8fka.us.auth0.com',            // Auth0 domain
  clientId: 'KKoI3PBSek09ddHa1cVW3OVXVaeKyGTN',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

