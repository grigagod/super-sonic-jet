import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";
import {
  Button,
  Card,
  Container,
  Dimmer,
  Form,
  Grid,
  Header,
  Icon,
  Image,
  Item,
  Label,
  Loader,
  Message,
  Segment,
  Select,
  Divider,
} from "semantic-ui-react";
import { productDetailURL, addToCartURL } from "../constants";
import { fetchCart } from "../store/actions/cart";
import { getAuthAxios } from "../utils";

class ProductDetail extends React.Component {
  state = {
    loading: false,
    error: null,
    data: [],
  };

  componentDidMount() {
    this.handleFetchItem();
  }

  handleFetchItem = () => {
    const {
      match: { params },
    } = this.props;
    this.setState({ loading: true });
    axios
      .get(productDetailURL(params.productID))
      .then((res) => {
        console.log(res);
        this.setState({
          data: res.data.items,
          loading: false,
        });
      })
      .catch((err) => {
        this.setState({ error: err, loading: false });
      });
  };

  handleAddToCart = (slug) => {
    this.setState({ loading: true });
    let authAxios = getAuthAxios();
    authAxios
      .post(addToCartURL, { slug })
      .then((res) => {
        this.props.refreshCart();
        this.setState({ loading: false });
      })
      .catch((err) => {
        this.setState({ error: err, loading: false });
      });
  };

  render() {
    const { data, error, loading } = this.state;
    return (
      <Container>
        {error && (
          <Message
            error
            header="There was some errors with your submission"
            content={JSON.stringify(error)}
          />
        )}
        {loading && (
          <Segment>
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>
            <Image src="/images/wireframe/short-paragraph.png" />
          </Segment>
        )}
        <Item.Group divided>
          {data.map((item) => {
            return (
              <Item key={item.id}>
                <Item.Image src={`http://127.0.0.1:8000${item.image}`} />
                <Item.Content>
                  <Item.Header as="h4">{item.title}</Item.Header>
                  <Item.Meta>
                    <span className="cinema">{item.category}</span>
                  </Item.Meta>
                  <Item.Description>{item.description}</Item.Description>
                  <Item.Extra>
                    {
                      <Button
                        primary
                        floated="right"
                        icon
                        labelPosition="right"
                        onClick={() => this.handleAddToCart(item.slug)}
                      >
                        Add to cart
                        <Icon name="cart plus" />
                      </Button>
                    }
                    {item.label && (
                      <Label
                        color={
                          item.label === "primary"
                            ? "blue"
                            : item.label === "secondary"
                            ? "green"
                            : "olive"
                        }
                      >
                        {item.label}
                      </Label>
                    )}
                  </Item.Extra>
                </Item.Content>
              </Item>
            );
          })}
        </Item.Group>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    refreshCart: () => dispatch(fetchCart()),
  };
};

export default withRouter(connect(null, mapDispatchToProps)(ProductDetail));
