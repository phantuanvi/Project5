import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLogic/items'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const itemId = event.pathParameters.itemId
    const userId = getUserId(event)
    const url = await createAttachmentPresignedUrl(userId, itemId)

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: url })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
