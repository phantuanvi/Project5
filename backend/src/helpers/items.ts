import { ItemsAccess } from './itemsAcess'
import { Item } from '../models/Item'
import { CreateItemRequest } from '../requests/CreateItemRequest'
import { UpdateItemRequest } from '../requests/UpdateItemRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('ItemsAccess')
const itemsAccess = new ItemsAccess()

export async function createItem(
  userId: string,
  item: CreateItemRequest
): Promise<Item> {
  logger.info('Call function createItem')
  const itemId = uuid.v4()
  const createdAt = new Date().toISOString()
  const description = ""
  const quantity = ""
  const unit = ""
  const price = ""

  return await itemsAccess.createItem({
    userId,
    itemId,
    createdAt,
    description,
    quantity,
    unit,
    price,
    ...item,
    
  })
}

export async function getItemsForUser(userId: string): Promise<Item[]> {
  logger.info('Call function getItemsForUser')
  return await itemsAccess.getItemsForUSer(userId)
}

export async function updateItem(
  userId: string,
  itemId: string,
  updatedItem: UpdateItemRequest
): Promise<Item> {
  logger.info('Call function updateItem')
  return await itemsAccess.updateItem(userId, itemId, updatedItem)
}

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<Item> {
  logger.info('Call function deleteItem')
  return await itemsAccess.deleteItem(userId, itemId)
}

export async function createAttachmentPresignedUrl(
  userId: string,
  itemId: string
): Promise<String> {
  logger.info('Call function createAttachmentPresignedUrl')
  const uploadUrl = itemsAccess.getUploadUrl(itemId, userId)
  return uploadUrl
}
