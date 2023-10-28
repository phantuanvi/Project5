import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateItem } from '../../helpers/items'
import { UpdateItemRequest } from '../../requests/UpdateItemRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const itemId = event.pathParameters.itemId
    const updatedItem: UpdateItemRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const updatedItemItem = await updateItem(userId, itemId, updatedItem)
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: JSON.stringify({ item: updatedItemItem })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
