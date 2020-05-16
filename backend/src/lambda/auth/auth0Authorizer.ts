import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'



const logger = createLogger('auth')
//const axios = require('axios').default;

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-w02ayhsv.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJBlilLlfOxDxvMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi13MDJheWhzdi5hdXRoMC5jb20wHhcNMjAwNDA4MDA0OTI0WhcNMzMx
MjE2MDA0OTI0WjAhMR8wHQYDVQQDExZkZXYtdzAyYXloc3YuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8dGSP9tIWt/Vw9ENbgI9+h5J
VwSNRARE+9lMw91EZxaHfewRl0ug5fI5GwTfmu2k0URovJ+EVXBnh/O53bRBW14C
YBEMmPFgk0PVBX9bP4TOkUHMOWHRKbQ3VepzsXGAin0i6zcLjB27slr8T74l6/NC
uxZnnb1+aJ3QVizR57AdMXpKyA7AZbfqllAIlvqgSKvoyaeltxYovaP1Ru/1ZlA8
HJ1QaNKDejZ8jeiDqA2yCghuLcvPNLT78dXJ04ufvjLBgi0pJ6W2InhGpQzRRBNk
zRo01GWVvBJekLUnCstYtMoomX70crqmCCXXLl1yhjAJfITP2WLLBwB7hN9kvwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTjdZMRC7sITsxO1Oqi
Ti4R0kzqmDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAFAuBjQz
XhN9c2j9MeuF1geImkAr4Y7+kyhCRyRArX6dLouCXvKVAUAk75L0vrVmosFi1IAh
CsvY4CB0pCGUqczq8KpihEt2ndQodIMu+/Yc+qvBMLHjBrP+NfaQ8g87KyadOPKS
Of+S+/slJxGQvWP0JDI4jauzAbvrV/oMoTCL6pGB3m6hBLHUNwjKZesW50CcwM99
xAKOCT+D561Rn4pz4js6eoZOz0fiWj14XP62HgQ1/dHe0urobzK/cLzRZx/yy7HN
WakPsreU10aslyGicxDvyI/M+bEixFU/lKHqp8VL1PWZOHIgH6KB59d6M4JM8fM7
4F9BV+ygtKbGiqc=
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.log(event.authorizationToken);
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    console.log(jwtToken.sub);
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
    console.log(e)
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
  const token = getToken(authHeader)

  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  console.log("Decode token...")
  console.log(jwt);

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const payload = verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
  console.log(payload);
  return payload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  console.log("verifyToken...")
  console.log(token)

  return token
}

