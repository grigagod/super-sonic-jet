import React from "react";
import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Segment,
  Icon,
} from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { logout } from "../store/actions/auth";
import { fetchCart } from "../store/actions/cart";

class CustomLayout extends React.Component {
  componentDidMount() {
    this.props.fetchCart();
  }
  handleProfileClick() {
    return <Redirect to="/profile" />;
  }
  render() {
    const { authenticated, cart, loading } = this.props;
    return (
      <div>
        <Menu stackable borderless>
          <Container>
            <Menu.Item>
              <Image
                size="mini"
                src="http://127.0.0.1:8000/media/ico_logo.jpg"
              />
            </Menu.Item>
            <Link to="/">
              <Menu.Item header as="h3" link>
                Home
              </Menu.Item>
            </Link>
            <Link to="/products">
              <Menu.Item header as="h3" link>
                Products
              </Menu.Item>
            </Link>
            <Menu.Menu position="right">
              {authenticated ? (
                <React.Fragment>
                  <Link to="/profile">
                    <Menu.Item header as="h3" link>
                      Profile
                    </Menu.Item>
                  </Link>
                  <a>
                    <Dropdown
                      icon="cart"
                      size="mini"
                      loading={loading}
                      text={`${cart !== null ? cart.order_items.length : 0}`}
                      pointing
                      className="link item"
                      as="h3"
                    >
                      <Dropdown.Menu>
                        {cart &&
                          cart.order_items.map((element) => {
                            return (
                              <Dropdown.Item key={element.id}>
                                1 x {element.item.title}
                              </Dropdown.Item>
                            );
                          })}
                        {cart && cart.order_items.length < 1 ? (
                          <Dropdown.Item>No items in your cart</Dropdown.Item>
                        ) : null}
                        <Dropdown.Divider />
                        <Dropdown.Item
                          icon="arrow right"
                          text="Checkout"
                          onClick={() =>
                            this.props.history.push("/order-summary")
                          }
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  </a>

                  <Link to="/" onClick={() => this.props.logout()}>
                    <Menu.Item header as="h3" link>
                      Logout
                    </Menu.Item>
                  </Link>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Link to="/login">
                    <Menu.Item header as="h3" link>
                      Login
                    </Menu.Item>
                  </Link>
                  <Link to="/signup">
                    <Menu.Item header as="h3" link>
                      Signup
                    </Menu.Item>
                  </Link>
                </React.Fragment>
              )}
            </Menu.Menu>
          </Container>
        </Menu>
        {this.props.children}

        <Segment
          inverted
          vertical
          style={{ margin: "5em 0em 0em", padding: "5em 0em" }}
        >
          <Container textAlign="center">
            <Grid divided inverted stackable>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 1" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 2" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 3" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={7}>
                <Header inverted as="h4" content="Footer Header" />
                <p>
                  Extra space for a call to action inside the footer that could
                  help re-engage users.
                </p>
              </Grid.Column>
            </Grid>

            <Divider inverted section />
            <Image centered size="mini" src="/logo.png" />
            <List horizontal inverted divided link size="small">
              <List.Item as="a" href="#">
                Site Map
              </List.Item>
              <List.Item as="a" href="#">
                Contact Us
              </List.Item>
              <List.Item as="a" href="#">
                Terms and Conditions
              </List.Item>
              <List.Item as="a" href="#">
                Privacy Policy
              </List.Item>
            </List>
          </Container>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authenticated: state.auth.token !== null,
    cart: state.cart.shoppingCart,
    loading: state.cart.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
    fetchCart: () => dispatch(fetchCart()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CustomLayout)
);
