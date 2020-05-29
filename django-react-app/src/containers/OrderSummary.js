import React from "react";
import {
  Button,
  Container,
  Header,
  Icon,
  Label,
  Menu,
  Table,
  Tab,
  Image,
  Loader,
  Message,
  Dimmer,
  Segment,
} from "semantic-ui-react";
import { getAuthAxios } from "../utils";
import { cartSuccess } from "../store/actions/cart";
import {
  addToCartURL,
  orderSummaryURL,
  OrderItemDeleteURL,
  orderItemUpdateQuantityURL,
} from "../constants";
import { Link } from "react-router-dom";

class OrderSummary extends React.Component {
  state = {
    data: null,
    error: null,
    loading: false,
  };

  componentDidMount() {
    this.handleFetchOrder();
  }

  handleFetchOrder = () => {
    this.setState({ loading: true });
    let authAxios = getAuthAxios();
    authAxios
      .get(orderSummaryURL)
      .then((res) => {
        this.setState({ data: res.data, loading: false });
      })
      .catch((err) => {
        if (err.response.status === 404) {
          this.setState({
            error: "You currently do not have an order",
            loading: false,
          });
        } else {
          this.setState({ error: err, loading: false });
        }
      });
  };

  renderVariations = (orderItem) => {
    let text = "";
    orderItem.item_variations.forEach((iv) => {
      text += `${iv.variation.name}: ${iv.value}, `;
    });
    return text;
  };

  handleFormatData = (itemVariations) => {
    return Object.keys(itemVariations).map((key) => {
      return itemVariations[key].id;
    });
  };

  handleAddToCart = (slug, itemVariations) => {
    this.setState({ loading: true });
    const variations = this.handleFormatData(itemVariations);
    let authAxios = getAuthAxios();
    authAxios
      .post(addToCartURL, { slug, variations })
      .then((res) => {
        this.handleFetchOrder();
        this.setState({ loading: false });
      })
      .catch((err) => {
        this.setState({ error: err, loading: false });
      });
  };

  handleRemoveQuantityFromCart = (slug) => {
    let authAxios = getAuthAxios();
    authAxios
      .post(orderItemUpdateQuantityURL, { slug })
      .then((res) => {
        this.handleFetchOrder();
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  handleRemoveItem = (itemID) => {
    let authAxios = getAuthAxios();
    authAxios
      .delete(OrderItemDeleteURL(itemID))
      .then((res) => {
        this.handleFetchOrder();
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  render() {
    const { data, error, loading } = this.state;
    console.log(data);
    return (
      <Container>
        <Header as="h5">OrderSummary</Header>
        {error && (
          <Message
            error
            header="There was an error"
            content={JSON.stringify(error)}
          />
        )}
        {loading && (
          <Segment>
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>

            <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
          </Segment>
        )}
        {data && (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Item #</Table.HeaderCell>
                <Table.HeaderCell>Item name</Table.HeaderCell>
                <Table.HeaderCell>Item price</Table.HeaderCell>
                <Table.HeaderCell>Item quantity</Table.HeaderCell>
                <Table.HeaderCell>Total item price</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {data.order_items.map((order_item, i) => {
                console.log(order_item);
                return (
                  <Table.Row key={order_item.id}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>
                      {order_item.item.title} -{" "}
                      {this.renderVariations(order_item)}
                    </Table.Cell>
                    <Table.Cell>${order_item.item.price}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Icon
                        name="plus"
                        style={{ float: "left", cursor: "pointer" }}
                        onClick={() =>
                          this.handleAddToCart(
                            order_item.item.slug,
                            order_item.item_variations
                          )
                        }
                      />
                      {order_item.quantity}
                      <Icon
                        name="minus"
                        style={{ float: "right", cursor: "pointer" }}
                        onClick={() =>
                          this.handleRemoveQuantityFromCart(
                            order_item.item.slug
                          )
                        }
                      />
                    </Table.Cell>
                    <Table.Cell>
                      {order_item.item.discount_price && (
                        <Label color="green" ribbon>
                          ON DISCOUNT
                        </Label>
                      )}
                      ${order_item.final_price}
                      <Icon
                        name="trash"
                        color="red"
                        style={{ float: "right", cursor: "pointer" }}
                        onClick={() => this.handleRemoveItem(order_item.id)}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              <Table.Row>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell colSpan="2" textAlign="center">
                  Total:${data.total}
                </Table.Cell>
              </Table.Row>
            </Table.Body>

            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan="5" textAlign="right">
                  <Link to="/checkout">
                    <Button floated="right" color="yellow">
                      Checkout
                    </Button>
                  </Link>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        )}
      </Container>
    );
  }
}

export default OrderSummary;
