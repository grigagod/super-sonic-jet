import React, { Component } from "react";
import {
  CardElement,
  injectStripe,
  Elements,
  StripeProvider,
} from "react-stripe-elements";
import { Button, Container, Message } from "semantic-ui-react";
import { getAuthAxios } from "../utils";
import { checkoutURL } from "../constants";

class CheckoutFrom extends Component {
  state = {
    loading: false,
    error: null,
    succses: false,
  };

  submit = (ev) => {
    ev.preventDefault();
    this.setState({ loading: true });
    if (this.props.stripe) {
      this.props.stripe.createToken().then((result) => {
        if (result.error) {
          this.setState({ error: result.error.message, loading: false });
        } else {
          let authAxios = getAuthAxios();
          authAxios
            .post(checkoutURL, { stripeToken: result.token.id })
            .then((res) => {
              this.setState({ loading: false, success: true });
            })
            .catch((err) => {
              this.setState({ loading: false, error: err });
            });
        }
      });
    }
    console.log("Stripe is not loaded");
  };

  render() {
    const { error, loading, success } = this.state;
    return (
      <div>
        {error && (
          <Message negative>
            <Message.Header>Your payment was unsuccessful</Message.Header>
            <p>{JSON.stringify(error)}</p>
          </Message>
        )}
        {success && (
          <Message positive>
            <Message.Header>You are eligible for a reward</Message.Header>
            <p>
              Go to your <b>profile</b> to see the order delivery status.
            </p>
          </Message>
        )}
        <p>Would you like to complete the purchase?</p>
        <CardElement />
        <Button
          loading={loading}
          disabled={loading}
          primary
          onClick={this.submit}
          style={{ marginTop: "10px" }}
        >
          Submit
        </Button>
      </div>
    );
  }
}

const InjectedForm = injectStripe(CheckoutFrom);

const WrappedForm = () => (
  <Container text>
    <StripeProvider apiKey="'pk_test_JJ1eMdKN0Hp4UFJ6kWXWO4ix00jtXzq5XG'">
      <div>
        <h1>Complete your order</h1>
        <Elements>
          <InjectedForm />
        </Elements>
      </div>
    </StripeProvider>
  </Container>
);

export default WrappedForm;
