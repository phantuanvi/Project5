import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Form,
  Divider,
  Grid,
  Header,
  Icon,
  // Input,
  Image,
  Loader,
  Checkbox
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  newItemName: string
  newItemDescription: string
  newItemQuantity: string
  newItemUnit: string
  newItemPrice: string
  loadingItems: boolean
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    newItemName: '',
    newItemDescription: '',
    newItemQuantity: '',
    newItemUnit: '',
    newItemPrice: '',
    loadingItems: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemDescription: event.target.value })
  }

  handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemQuantity: event.target.value })
  }

  handleUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemUnit: event.target.value })
  }

  handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemPrice: event.target.value })
  }

  onAddImageButtonClick = (itemId: string) => {
    this.props.history.push(`/items/${itemId}/addimage`)
  }

  onItemCreate = async (event: React.SyntheticEvent) => {
    console.log("onItemCreate")
    this.setState({
      loadingItems: true
    })
    try {
      const newItem = await createItem(this.props.auth.getIdToken(), {
        name: this.state.newItemName,
        description: this.state.newItemDescription,
        quantity: this.state.newItemQuantity,
        unit: this.state.newItemUnit,
        price: this.state.newItemPrice
      })
      this.setState({
        items: [...this.state.items, newItem],
        newItemName: '',
        newItemDescription: '',
        newItemQuantity: '',
        newItemUnit: '',
        newItemPrice: '',
        loadingItems: false
      })
    } catch {
      alert('Item creation failed')
      this.setState({
        loadingItems: false
      })
    }
  }

  onItemDelete = async (itemId: string) => {
    this.setState({
      loadingItems: true
    })
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.itemId !== itemId),
        loadingItems: false
      })
    } catch {
      alert('Item deletion failed')
      this.setState({
        loadingItems: false
      })
    }
  }

  onAddItem = () => {
    this.props.history.push(`/items/addItem`)
  }

  onItemCheck = async (pos: number) => {
    this.setState({
      loadingItems: true
    })
    try {
      const item = this.state.items[pos]
      await patchItem(this.props.auth.getIdToken(), item.itemId, {
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        isDone: !item.isDone
      })
      this.setState({
        items: update(this.state.items, {
          [pos]: { isDone: { $set: !item.isDone } }
        }),
        loadingItems: false
      })
    } catch {
      alert('Item deletion failed')
      this.setState({
        loadingItems: false
      })
    }
  }

  async componentDidMount() {
    try {
      console.log(`token: ${this.props.auth.getIdToken()}`)
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${(e as Error).message}`)
      this.setState({
        loadingItems: false
      })
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">List Item need to buy</Header>
        <Button onClick={this.onAddItem} size="huge" color="olive">
          Add Item
        </Button>
        {/* {this.renderCreateItemInput()} */}
        <Divider />
        {this.renderItems()}
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <div>
        <Form onSubmit={this.onItemCreate}>
          <Form.Field>
            <label>Product Name</label>
            <input
              name="productName"
              value={this.state.newItemName}
              onChange={this.handleNameChange}
            />
          </Form.Field>

          <Form.Field>
            <label>Description</label>
            <input
              name="description"
              value={this.state.newItemDescription}
              onChange={this.handleDescriptionChange}
            />
          </Form.Field>

          <Form.Group widths="equal">
            <Form.Field>
              <label>Quantity</label>
              <input
                name="quantity"
                type="number"
                value={this.state.newItemQuantity}
                onChange={this.handleQuantityChange}
              />
            </Form.Field>

            <Form.Field>
              <label>Unit</label>
              <input
                name="unit"
                value={this.state.newItemUnit}
                onChange={this.handleUnitChange}
              />
            </Form.Field>

            <Form.Field>
              <label>Price</label>
              <input
                name="price"
                type="number"
                value={this.state.newItemPrice}
                onChange={this.handlePriceChange}
              />
            </Form.Field>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Form>

      </div>
    );
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Items
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    return (
      <Grid padded>
        {this.state.items.map((item, pos) => {
          return (
            <Grid.Row key={item.itemId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.isDone}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                <Grid.Row>
                  Item: {item.name}
                </Grid.Row>
                <Grid.Row>
                  Description: {item.description}
                </Grid.Row>
                <Grid.Row>
                  Price: {item.price}
                </Grid.Row>
                <Grid.Row>
                  Quantity: {item.quantity}
                </Grid.Row>
                <Grid.Row>
                  Unit: {item.unit}
                </Grid.Row>
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {/* {item.price} */}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onAddImageButtonClick(item.itemId)}
                >
                  Add Image
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.itemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {item.imageUrl && (
                <Image src={item.imageUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
