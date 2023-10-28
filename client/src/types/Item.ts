export interface Item {
  userId: string
  itemId: string
  createdAt: string
  name: string
  description: string
  quantity: string
  unit: string
  price: string
  imageUrl?: string
  isDone: boolean
}
