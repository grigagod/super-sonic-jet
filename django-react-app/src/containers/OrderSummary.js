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
  TableCell,
} from "semantic-ui-react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getAuthAxios } from "../utils";
import { cartSuccess } from "../store/actions/cart";
import {
  addToCartURL,
  orderSummaryURL,
  OrderItemDeleteURL,
  orderDoneURL,
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
        console.log(res);
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
    const { isVerified } = this.props;
    if (!isVerified) {
      return <Redirect to="/profile" />;
    }
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
          <Container>
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>

            <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
          </Container>
        )}
        {data && (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Item #</Table.HeaderCell>
                <Table.HeaderCell>Item name</Table.HeaderCell>
                <Table.HeaderCell>Item size</Table.HeaderCell>
                <Table.HeaderCell>Item price</Table.HeaderCell>
                <Table.HeaderCell>Item final price</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {data.order_items.map((order_item, i) => {
                console.log(order_item);
                return (
                  <Table.Row key={order_item.id}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>{order_item.item.title}</Table.Cell>
                    <Table.Cell>{order_item.item.size}</Table.Cell>
                    <Table.Cell>${order_item.item.price}</Table.Cell>
                    <Table.Cell textAlign="left">
                      <Segment>
                        ${order_item.final_price}
                        {order_item.item.discount_price && (
                          <Label color="green" attached="top right">
                            DISCOUNT
                          </Label>
                        )}
                      </Segment>
                    </Table.Cell>
                    <TableCell icon>
                      <Icon
                        name="trash"
                        color="red"
                        style={{ float: "right", cursor: "pointer" }}
                        onClick={() => this.handleRemoveItem(order_item.id)}
                      />
                    </TableCell>
                  </Table.Row>
                );
              })}
              <Table.Row>
                <Table.Cell />
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
                <Table.HeaderCell colSpan="6" textAlign="right">
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

const mapStateToProps = (state) => {
  return {
    isVerified: state.auth.verified,
  };
};

export default connect(mapStateToProps)(OrderSummary);
