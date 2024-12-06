import { APIGatewayProxyHandler } from 'aws-lambda';

export default function lambdaWrapper(
  handler: APIGatewayProxyHandler,
): APIGatewayProxyHandler {
  return async (event: any, context: any, callback: any) => {
    try {
      const result = await handler(event, context, callback)!;
      return {
        statusCode: result.statusCode,
        body: result.body,
        headers: result.headers ?? {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
        },
      };
    } catch (e: any) {
      console.error(e);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Internal server error`,
          time: Math.round(new Date().getTime() / 1000),
          stack_trace: e.toString(),
        }),
      };
    }
  };
}
