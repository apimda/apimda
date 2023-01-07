const fs = require('fs');

const deploymentProps = {};
if (fs.existsSync('./cdk.outputs.json')) {
  const cdkOutputs = require('./cdk.outputs.json');
  const region = cdkOutputs['UserApiStack']['awsRegion'];
  const cognitoPrefix = cdkOutputs['UserApiStack']['userPoolDomainName'];
  const url = cdkOutputs['UserApiStack']['apiUrl'];
  deploymentProps['components'] = {
    securitySchemes: {
      userApiSecurityScheme: {
        type: 'oauth2',
        description:
          'See https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html',
        flows: {
          authorizationCode: {
            authorizationUrl: `https://${cognitoPrefix}.auth.${region}.amazoncognito.com/oauth2/authorize`,
            tokenUrl: `https://${cognitoPrefix}.auth.${region}.amazoncognito.com/oauth2/token`,
            refreshUrl: `https://${cognitoPrefix}.auth.${region}.amazoncognito.com/oauth2/token`,
            scopes: {}
          }
        }
      }
    }
  };
  deploymentProps['servers'] = [{ url: `${url}` }];
  deploymentProps['security'] = [{ cognito: [] }];
}

module.exports = {
  apimdaSecuritySchemeName: 'userApiSecurityScheme',
  openApi: {
    info: {
      title: 'User API',
      version: '1.0.0',
      contact: {},
      description: 'Example apimda API'
    },
    ...deploymentProps
  }
};
