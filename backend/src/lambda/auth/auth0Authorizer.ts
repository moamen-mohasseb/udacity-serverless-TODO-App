import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-frxc8fka.us.auth0.com/.well-known/jwks.json'
//const authSecret = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InJQS25LMEZHZk54Y0ItN3ZUM3k1dCJ9.eyJpc3MiOiJodHRwczovL2Rldi1mcnhjOGZrYS51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDI4ODE2MTEwMjYzODcyNDIxNTciLCJhdWQiOiJLS29JM1BCU2VrMDlkZEhhMWNWVzNPVlhWYWVLeUdUTiIsImlhdCI6MTYzNDY2OTY5MiwiZXhwIjoxNjM1MTAxNjkyLCJhdF9oYXNoIjoiazk2eUlybWZ3cTQyYnBtT2NwdlliQSIsIm5vbmNlIjoiM1ZBR2cxWDJoRTVueW9vM3BzU01Ifms0ZFpNNDVCLVQifQ.AGAArPTeHFP3tqKqSsCGmuzh3QbnlSRuPFTbe7NofOLaWxiI1f1yCdJUFsim7uOW_B0OEO57COG0CJnya23WTfACq6TcvRta8yJgwsVev-xnkA1a9tp9NekObTMCsL9tTu6KQwE-0vhoF_Vd9RnVV43ILhUxTU3CtpaOBHaJwlSeuvccYgmMP3So_r2z4ASr7AFz3l9Re3eS0MPrz1SI625nHh_nv-2yRhw4J3du3rR5drXk8aNDX3GmegTZ7XnYA1Do7bFdecEFJZtJOjftr4dvNWGGWTDnJTJ6gfZW4aMZ1JmgnsN1wUQ6iaJ3xQEfgtrZ_-H1LdZ-6c6VgdKRdw"

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);

  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  const jwtKid = jwt.header.kid;
  const jwks = await Axios.get(jwksUrl);

  const signingKey = jwks.data.keys.filter((k) => k.kid === jwtKid)[0];

  if (!signingKey) {
    throw new Error(`Unable to find a signing key that matches '${jwtKid}'`);
  }

  const { x5c } = signingKey;

  const cert = `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`;
  if (!jwt) {
    throw new Error("invalid token");
  }
  return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
  //console.log(jwt)
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
 // return verify(token, authSecret) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
