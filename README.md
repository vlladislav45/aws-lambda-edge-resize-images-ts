## How to deploy the lambda edges
### You don't need to deploy *-app stacks but the cloudfront stack instead
* Do not forget to execute ``npm run build`` not build-2 cuz there is LambdaEdge function instead the NodejsFunction
* ``npm run cdk synth`` then check is everything alright to continue with the deploy
* Last step deploy, if you have been removal the stacks, use the following command before deploy
``npm run cdk bootstrap``

## Setup AWS vault & configure
1. Install Homebrew (Support Linux and MacOS)
2. Configure the homebrew from the ~/.bashrc because otherwise the brew won't start up each time & on each terminal which you're opening
3. Create IAM account from the root acc & add to him the developer group which i've created to be easier for everybody

## NOTEs

* Do not forget to write somewhere the credentials from the AWS IAM acc, to be more detailed
- SECRET_KEY=
- ACCESS_KEY=
- arn:aws:iam::[YOUR_ID_12_CHARS]:mfa/[YOUR_NAME] 
- region=eu-central-1 (Which is Frankfurt)

4. Install aws-vault, link: https://github.com/99designs/aws-vault
5. Configure the aws vault as it's described in the repo
6. Last step but not less important. COnfigure the aws with the command:
```
$ aws configure
```

Those steps are important to start working with CDK. Of course if you want.


# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
