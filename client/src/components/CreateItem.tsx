import { History } from 'history'
// import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Form,
  Grid,
  Header,
  Loader
} from 'semantic-ui-react'

import { createItem } from '../api/items-api'
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

export class CreateItem extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    newItemName: '',
    newItemDescription: '',
    newItemQuantity: '',
    newItemUnit: '',
    newItemPrice: '',
    loadingItems: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemDescription: event.target.value })
  }

  handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as any;
    if (value > 0 || value === "") {
      this.setState({ newItemQuantity: value });
    }
  }

  handleUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemUnit: event.target.value })
  }

  handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as any;
    if (value > 0 || value === "") {
      this.setState({ newItemPrice: value });
    }
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
      this.props.history.push(`/`)
    } catch {
      alert('Item creation failed')
      this.setState({
        loadingItems: false
      })
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Add Item need to buy</Header>
        {this.renderCreateItemInput()}
      </div>
    )
  }

  renderCreateItemInput() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }
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
              {this.state.newItemPrice && <p style={{ color: 'red' }}>{this.state.newItemPrice}</p>}
            </Form.Field>
          </Form.Group>

          <Button type="submit">Submit</Button>
        </Form>

      </div>
    );
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
}
