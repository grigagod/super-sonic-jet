import React from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import {
  Button,
  Container,
  Card,
  Grid,
  Header,
  Icon,
  Image,
  Item,
  Label,
  Loader,
  Dimmer,
  Message,
  Segment,
  GridColumn,
} from "semantic-ui-react";

import { productDetailURL, addToCartURL } from "../constants";
import { getAuthAxios } from "../utils";
import { fetchCart } from "../store/actions/cart";

class ProductDetail extends React.Component {
  state = {
    loading: false,
    error: null,
    data: []
  };

  componentDidMount() {
    this.handleFetchItem();
  }

  handleFetchItem = () => {
    const { match: { params } } = this.props;
    this.setState({ loading: true });
    axios
      .get(productDetailURL(params.productID))
      .then(res => {
        this.setState({ data: res.data, loading: false });
      })
      .catch(err => {
        this.setState({ error: err, loading: false });
      });
  }

  handleAddToCart = (slug) => {
    this.setState({ loading: true });
    this.props.fetchCart();
    let authAxios = getAuthAxios();
    authAxios
      .post(addToCartURL, { slug })
      .then((res) => {
        console.log(res);
        this.props.fetchCart();
        this.setState({ loading: false });
      })
      .catch((err) => {
        this.setState({ error: err, loading: false });
      });
  };

  render() {
    const { data, error, loading } = this.state;
    const item = data;
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
            <Dimmer active>
              <Loader />
            </Dimmer>

            <Image src="/images/wireframe/short-paragraph.png" />
          </Segment>
        )}
        <Grid columns={2} divided>
          <Grid.Row>
            <GridColumn>
              <Card
                image={item.image}
                header={item.title}
                meta={<React.Fragment>
                  {item.category}
                  {item.discount_price && (
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
                </React.Fragment>}
                description={item.description}
                extra={(<React.Fragment>
                  <Button
                    fluid
                    color="yellow"
                    floated="right"
                    icon
                    labelPosition="right"
                    onClick={() => this.handleAddToCart(item.slug)}
                  >
                    Add to cart
                  <Icon name="cart plus" />
                  </Button>
                </React.Fragment>)}
              />
            </GridColumn>
            <GridColumn>
              {data.variations && (
                data.variations.map(v => {
                  return (
                    <React.Fragment>
                      <Header as="h2">Try different variations</Header>
                      <Item.Group divided key={v.id}>
                        {v.item_variations.map(iv => {
                          return (
                            <React.Fragment>
                              <Header as="h3">{v.name}</Header>
                              <Item key={iv.id}>
                                {iv.attachment && (
                                  <Item.Image
                                    size='tiny'
                                    src={`http://127.0.0.1:8000${iv.attachment}`}
                                  />
                                )}
                                <Item.Content verticalAlign='middle'>{iv.value}</Item.Content>
                              </Item>
                            </React.Fragment>
                          );
                        })}
                      </Item.Group>
                    </React.Fragment>
                  );
                })
              )}
            </GridColumn>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCart: () => dispatch(fetchCart()),
  };
};

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(ProductDetail)
);
