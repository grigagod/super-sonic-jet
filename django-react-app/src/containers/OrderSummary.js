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
} from "semantic-ui-react";
import { getAuthAxios } from "../utils";
import { cartSuccess } from "../store/actions/cart";
import { addToCartURL, orderSummaryURL, OrderItemDeleteURL } from "../constants";
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
        this.setState({ error: err, loading: false });
      });
  };

  handleFormatData = itemVariations => {
    return Object.keys(itemVariations).map(key => {
      return itemVariations[key].id;
    });
  };

  handleAddToCart = (slug, itemVariations) => {
    this.setState({ loading: true });
    const variations = this.handleFormatData(itemVariations);
    let authAxios = getAuthAxios();
    authAxios
      .post(addToCartURL, { slug, variations })
      .then(res => {
        this.handleFetchOrder();
        this.setState({ loading: false });
      })
      .catch(err => {
        this.setState({ error: err, loading: false });
      });
  };

  handleRemoveItem = itemID => {
    let authAxios = getAuthAxios();
    authAxios.post(OrderItemDeleteURL(itemID))
      .then((res) => {
        this.handleFetchOrder();
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  }

  render() {
    const { data, error, loading } = this.state;
    console.log(data);
    return (
      <Container>
        <Header as="h5">OrderSummary</Header>
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
                return (
                  <Table.Row key={order_item.id}>
                    <Table.Cell>{i}</Table.Cell>
                    <Table.Cell>{order_item.item}</Table.Cell>
                    <Table.Cell>${order_item.item_obj.price}</Table.Cell>
                    <Table.Cell textAlign='center'>
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
                        onClick={() => this.handleRemoveItem(order_item.id)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      {order_item.item_obj.discount_price && (
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
