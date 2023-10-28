import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateItemRequest } from '../../requests/CreateItemRequest'
import { getUserId } from '../utils'
import { createItem } from '../../helpers/items'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const createItemRequest: CreateItemRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const newItem = await createItem(userId, createItemRequest)
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: JSON.stringify({
        item: newItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
