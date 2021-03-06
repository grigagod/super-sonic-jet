import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  Button,
  Card,
  Dimmer,
  Divider,
  Form,
  Grid,
  Header,
  Image,
  Label,
  Loader,
  Menu,
  Message,
  Segment,
  Select,
  Table,
  Icon,
} from "semantic-ui-react";
import {
  countryListURL,
  addressListURL,
  addressCreateURL,
  addressUpdateURL,
  addressDeleteURL,
  userIDURL,
  ordersListURL,
} from "../constants";
import VerifyEmail from "./VerifyEmail";
import { getAuthAxios } from "../utils";

const UPDATE_FORM = "UPDATE_FORM";
const CREATE_FORM = "CREATE_FORM";

class OrdersHistory extends React.Component {
  state = {
    orders: [],
  };

  componentDidMount() {
    this.handleFetchOrders();
  }

  handleFetchOrders = () => {
    this.setState({ loading: true });
    let authAxios = getAuthAxios();
    authAxios
      .get(ordersListURL)
      .then((res) => {
        this.setState({
          loading: false,
          orders: res.data,
        });
      })
      .catch((err) => {
        this.setState({ error: err, loading: false });
      });
  };

  render() {
    const { orders } = this.state;
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Total Price</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {orders.map((ord) => {
            return (
              <Table.Row key={ord.id}>
                <Table.Cell>{ord.id}</Table.Cell>
                <Table.Cell>${ord.total}</Table.Cell>
                <Table.Cell>
                  {new Date(ord.ordered_date).toUTCString()}
                </Table.Cell>
                <Table.Cell>
                  {ord.refund_granted
                    ? "Refund Granted"
                    : ord.refund_requested
                    ? "Refund Requested"
                    : ord.received
                    ? "Received"
                    : ord.being_delivered
                    ? " Being Delivered "
                    : "Ordered"}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }
}

class AddressForm extends React.Component {
  state = {
    error: null,
    loading: false,
    formData: {
      address_type: "",
      apartment_address: "",
      country: "",
      default: false,
      id: "",
      street_address: "",
      user: 1,
      zip: "",
    },
    saving: false,
    success: false,
  };

  componentDidMount() {
    const { address, formType } = this.props;
    if (formType === UPDATE_FORM) {
      this.setState({ formData: address });
    }
  }

  handleToggleDefault = () => {
    const { formData } = this.state;
    const updatedFormdata = {
      ...formData,
      default: !formData.default,
    };
    this.setState({
      formData: updatedFormdata,
    });
  };

  handleChange = (e) => {
    const { formData } = this.state;
    const updatedFormdata = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    this.setState({
      formData: updatedFormdata,
    });
  };

  handleSelectChange = (e, { name, value }) => {
    const { formData } = this.state;
    const updatedFormdata = {
      ...formData,
      [name]: value,
    };
    this.setState({
      formData: updatedFormdata,
    });
  };

  handleSubmit = (e) => {
    this.setState({ saving: true });
    e.preventDefault();
    const { formType } = this.props;
    if (formType === UPDATE_FORM) {
      this.handleUpdateAddress();
    } else {
      this.handleCreateAddress();
    }
  };

  handleCreateAddress = () => {
    const { userID, activeItem } = this.props;
    const { formData } = this.state;
    let authAxios = getAuthAxios();
    authAxios
      .post(addressCreateURL, {
        ...formData,
        user: userID,
        address_type: "S",
      })
      .then((res) => {
        this.setState({
          saving: false,
          success: true,
          formData: { default: false },
        });
        this.props.callback();
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  handleUpdateAddress = () => {
    const { userID, activeItem } = this.props;
    const { formData } = this.state;
    let authAxios = getAuthAxios();
    authAxios
      .put(addressUpdateURL(formData.id), {
        ...formData,
        user: userID,
        address_type: "S",
      })
      .then((res) => {
        this.setState({
          saving: false,
          success: true,
          formData: { default: false },
        });
        this.props.callback();
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  render() {
    const { countries } = this.props;
    const { error, formData, success, saving } = this.state;
    return (
      <Form onSubmit={this.handleSubmit} success={success} error={error}>
        <Form.Input
          required
          name="street_address"
          placeholder="Street address"
          onChange={this.handleChange}
          value={formData.street_address}
        />
        <Form.Input
          required
          name="apartment_address"
          placeholder="Apartment address"
          onChange={this.handleChange}
          value={formData.apartment_address}
        />
        <Form.Field required>
          <Select
            loading={countries.length < 1}
            fluid
            clearable
            search
            options={countries}
            name="country"
            placeholder="Country"
            onChange={this.handleSelectChange}
            value={formData.country}
          />
        </Form.Field>
        <Form.Input
          required
          name="zip"
          placeholder="Zip code"
          onChange={this.handleChange}
          value={formData.zip}
        />
        <Form.Checkbox
          name="default"
          label="Make this the default address?"
          onChange={this.handleToggleDefault}
          checked={formData.default}
        />
        {success && (
          <Message success header="Success!" content="Your address was saved" />
        )}
        {error && (
          <Message
            error
            header="There was an error"
            content={JSON.stringify(error)}
          />
        )}
        <Form.Button disabled={saving} loading={saving} primary>
          Save
        </Form.Button>
      </Form>
    );
  }
}

class Profile extends React.Component {
  state = {
    activeItem: "billingAddress",
    addresses: [],
    countries: [],
    userID: null,
    selectedAddress: null,
  };

  componentDidMount() {
    this.handleFetchAddresses();
    this.handleFetchCountries();
    this.handleFetchUserID();
  }

  handleItemClick = (name) => {
    this.setState({ activeItem: name }, () => {
      this.handleFetchAddresses();
    });
  };

  handleGetActiveItem = () => {
    const { activeItem } = this.state;
    if (activeItem === "ordersHistory") {
      return "Orders History";
    } else if (activeItem === "verifyEmail") {
      return "Verify Email";
    }
    return "Shipping Address";
  };

  handleFormatCountries = (countries) => {
    const keys = Object.keys(countries);
    return keys.map((k) => {
      return {
        key: k,
        text: countries[k],
        value: k,
      };
    });
  };

  handleDeleteAddress = (addressID) => {
    let authAxios = getAuthAxios();
    authAxios
      .delete(addressDeleteURL(addressID))
      .then((res) => {
        this.handleCallback();
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  handleSelectAddress = (address) => {
    this.setState({ selectedAddress: address });
  };

  handleFetchUserID = () => {
    let authAxios = getAuthAxios();
    authAxios
      .get(userIDURL)
      .then((res) => {
        this.setState({ userID: res.data.userID });
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  handleFetchCountries = () => {
    let authAxios = getAuthAxios();
    authAxios
      .get(countryListURL)
      .then((res) => {
        this.setState({ countries: this.handleFormatCountries(res.data) });
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  handleFetchAddresses = () => {
    this.setState({ loading: true });
    const { activeItem } = this.state;
    let authAxios = getAuthAxios();
    authAxios
      .get(addressListURL("S"))
      .then((res) => {
        this.setState({ addresses: res.data, loading: false });
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  handleCallback = () => {
    this.handleFetchAddresses();
    this.setState({ selectedAddress: null });
  };

  renderAddresses = () => {
    const {
      activeItem,
      addresses,
      countries,
      selectedAddress,
      userID,
    } = this.state;
    return (
      <React.Fragment>
        <Card.Group>
          {addresses.map((a) => {
            return (
              <Card key={a.id}>
                <Card.Content>
                  {a.default && (
                    <Label as="a" color="blue" ribbon="right">
                      Default
                    </Label>
                  )}
                  <Card.Header>
                    {a.street_address}, {a.apartment_address}
                  </Card.Header>
                  <Card.Meta>{a.country}</Card.Meta>
                  <Card.Description>{a.zip}</Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button
                    color="yellow"
                    onClick={() => this.handleSelectAddress(a)}
                  >
                    Update
                  </Button>
                  <Button
                    color="red"
                    onClick={() => this.handleDeleteAddress(a.id)}
                  >
                    Delete
                  </Button>
                </Card.Content>
              </Card>
            );
          })}
        </Card.Group>
        {addresses.length > 0 ? <Divider /> : null}
        {selectedAddress === null ? (
          <AddressForm
            activeItem={activeItem}
            countries={countries}
            formType={CREATE_FORM}
            userID={userID}
            callback={this.handleCallback}
          />
        ) : null}
        {selectedAddress && (
          <AddressForm
            activeItem={activeItem}
            userID={userID}
            countries={countries}
            address={selectedAddress}
            formType={UPDATE_FORM}
            callback={this.handleCallback}
          />
        )}
      </React.Fragment>
    );
  };

  render() {
    const { activeItem, error, loading } = this.state;
    const { isAuthenticated } = this.props;
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    return (
      <Grid container columns={2} divided>
        <Grid.Row columns={1}>
          <Grid.Column>
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
                <Image src="/images/wireframe/short-paragraph.png" />
              </Segment>
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={6}>
            <Menu pointing vertical fluid>
              <Menu.Item
                name="Shipping Address"
                active={activeItem === "shippingAddress"}
                onClick={() => this.handleItemClick("shippingAddress")}
              />
              <Menu.Item
                name="Orders history"
                active={activeItem === "ordersHistory"}
                onClick={() => this.handleItemClick("ordersHistory")}
              />
              <Menu.Item
                name="Verify email"
                active={activeItem === "verifyEmail"}
                onClick={() => this.handleItemClick("verifyEmail")}
              />
            </Menu>
          </Grid.Column>
          <Grid.Column width={10}>
            <Header>{this.handleGetActiveItem()}</Header>
            <Divider />
            {activeItem === "ordersHistory" ? (
              <OrdersHistory />
            ) : activeItem === "verifyEmail" ? (
              <VerifyEmail />
            ) : (
              this.renderAddresses()
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null,
  };
};

export default connect(mapStateToProps)(Profile);
