# Deployment

Apimda uses the CDK for deployment. It provides two constructs:

1. `ApimdaApp` to generate lambda functions for controllers and wire routes to API Gateway
2. `NpmLayerVersion` to bundle dependencies into lambda layers

These are described in the following sections.
