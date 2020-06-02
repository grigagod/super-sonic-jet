import React from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment,
} from "semantic-ui-react";
import { connect } from "react-redux";
import { NavLink, Redirect } from "react-router-dom";
import { verifyLastStep } from "../store/actions/auth";

class VerificationForm extends React.Component {
  state = {
    verified: false,
  };
  handleClick(token) {
    if (token) {
      this.props.verify();
    }
  }
  render() {
    const { error, loading, token, verified } = this.props;
    if (verified) {
      return <Redirect to="/" />;
    }
    return (
      <Segment>
        <Header>Press on button to verify email </Header>
        <Button onClick={this.handleClick(token)}></Button>
      </Segment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    verified: state.auth.verified,
    token: state.auth.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    verify: () => dispatch(verifyLastStep()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VerificationForm);
