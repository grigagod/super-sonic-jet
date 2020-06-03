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

import { getAuthAxios } from "../utils";
import { verifyFetch, verifyCheckState } from "../store/actions/auth";

class VerifyEmail extends React.Component {
  componentDidMount() {
    this.handleCheckVerification();
  }
  handleCheckVerification = () => {
    this.setState({ loading: true });
    this.props.verifyCheck();
  };
  handleSendEmail = () => {
    this.props.tryToVerify();
  };
  render() {
    const { isVerified } = this.props;
    return (
      <Container>
        <Segment>
          <Label>
            {isVerified ? "Email verification" : "Check for verification"}
          </Label>
          <Button
            circular
            icon={isVerified ? "check circle outline" : "circle outline"}
            basic-size="small"
            onClick={!isVerified ? () => this.handleCheckVerification() : null}
          ></Button>
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
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    tryToVerify: (username, email) => dispatch(verifyFetch(username, email)),
    verifyCheck: () => dispatch(verifyCheckState()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
