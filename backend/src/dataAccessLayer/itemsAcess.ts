import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Item } from '../models/Item'
import { ItemUpdate } from '../models/ItemUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('ItemsAccess')
const url_expiration = process.env.SIGNED_URL_EXPIRATION

export class ItemsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly itemsTable = process.env.ITEMS_TABLE,
    private readonly itemsIndex = process.env.ITEMS_CREATED_AT_INDEX,
    private readonly S3 = new XAWS.S3({ signatureVersion: 'v4' })
  ) {}

  async createItem(item: Item): Promise<Item> {
    logger.info(`create itemId: ${item.itemId}`)
    let params = {
      TableName: this.itemsTable,
      Item: item
    }
    await this.docClient.put(params).promise()
    return item as Item
  }

  async getItemsForUSer(userId: string): Promise<Item[]> {
    logger.info(`get items for userId: ${userId}`)
    let params = {
      TableName: this.itemsTable,
      IndexName: this.itemsIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
    const result = await this.docClient.query(params).promise()
    return result.Items as Item[]
  }

  async updateItem(
    userId: string,
    itemId: string,
    itemUpdate: ItemUpdate
  ): Promise<Item> {
    logger.info(`update ItemId: ${itemId}, userId: ${userId}`)
    let params = {
      TableName: this.itemsTable,
      Key: {
        userId,
        itemId
      },
      UpdateExpression: 'set #name = :name, #description = :description, #quantity = :quantity, #unit = :unit , #price = :price, #isDone = :isDone',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#description': 'description',
        '#quantity': 'quantity',
        '#unit': 'unit',
        '#price': 'price',
        '#isDone': 'isDone'
      },
      ExpressionAttributeValues: {
        ':name': itemUpdate.name,
        ':description': itemUpdate.description,
        ':quantity': itemUpdate.quantity,
        ':unit': itemUpdate.unit,
        ':price': itemUpdate.price,
        ':isDone': itemUpdate.isDone
      },
      ReturnValues: 'ALL_NEW'
    }
    const result = await this.docClient.update(params).promise()
    return result.Attributes as Item
  }

  async deleteItem(userId: string, itemId: string): Promise<Item> {
    logger.info(`delete ItemId: ${itemId}, userId: ${userId}`)
    let params = {
      TableName: this.itemsTable,
      Key: {
        userId,
        itemId
      }
    }
    const result = await this.docClient.delete(params).promise()
    return result.Attributes as Item
  }

  async getUploadUrl(itemId: string, userId: string): Promise<string> {
    logger.info(`getUploadUrl ItemId: ${itemId}, userId: ${userId}`)
    const uploadUrl = this.S3.getSignedUrl('putObject', {
      Bucket: process.env.ATTACHMENT_S3_BUCKET,
      Key: itemId,
      Expires: Number(url_expiration)
    })
    let params = {
      TableName: this.itemsTable,
      Key: {
        userId,
        itemId
      },
      UpdateExpression: 'set imageUrl = :URL',
      ExpressionAttributeValues: {
        ':URL': uploadUrl.split('?')[0]
      },
      ReturnValues: 'UPDATED_NEW'
    }
    await this.docClient.update(params).promise()
    return uploadUrl
  }
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
