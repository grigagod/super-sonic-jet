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
  Container,
} from "semantic-ui-react";

import { verifyCheckState, verifyEmailSend } from "../store/actions/auth";

class VerifyEmail extends React.Component {
  componentDidMount() {
    this.handleCheckVerification();
  }
  handleCheckVerification = () => {
    this.props.verifyCheck();
  };
  handleSendEmail = () => {
    this.props.tryToVerify();
  };
  render() {
    const { isVerified, loading, error } = this.props;
    return (
      <Container>
        <Segment>
          <Label>
            {isVerified ? "Email verification" : "Check for verification"}
          </Label>
          {loading ? (
            <Button
              circular
              loading
              icon="spinner"
              basic-size="small"
              floated="right"
            >
              <Icon />
            </Button>
          ) : (
            <Button
              circular
              icon
              basic-size="small"
              floated="right"
              onClick={
                !isVerified ? () => this.handleCheckVerification() : null
              }
            >
              {isVerified ? (
                <Icon color="green" name="check circle outline"></Icon>
              ) : (
                <Icon color="red" name="circle outline"></Icon>
              )}
            </Button>
          )}
        </Segment>
        {!isVerified ? (
          <Segment>
            <Button icon onClick={() => this.handleSendEmail()}>
              <Icon name="envelope outline"></Icon>
            </Button>
          </Segment>
        ) : null}
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isVerified: state.auth.verified,
    loading: state.auth.loading,
    error: state.auth.error,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    tryToVerify: (username, email) =>
      dispatch(verifyEmailSend(username, email)),
    verifyCheck: () => dispatch(verifyCheckState()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
