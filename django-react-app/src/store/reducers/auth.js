import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  username: null,
  email: null,
  token: null,
  error: null,
  loading: false,
  verified: null,
};

const authStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const authSuccess = (state, action) => {
  return updateObject(state, {
    token: action.token,
    error: null,
    loading: false,
  });
};

const authFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const authLogout = (state, action) => {
  return updateObject(state, {
    token: null,
  });
};
const verifyStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const verifySuccess = (state, action) => {
  return updateObject(state, {
    verified: action.verified,
    error: null,
    loading: false,
  });
};

const verifyFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.AUTH_START:
      return authStart(state, action);
    case actionTypes.AUTH_SUCCESS:
      return authSuccess(state, action);
    case actionTypes.AUTH_FAIL:
      return authFail(state, action);
    case actionTypes.AUTH_LOGOUT:
      return authLogout(state, action);
    case actionTypes.VERIFICATION_START:
      return verifyStart(state, action);
    case actionTypes.VERIFICATION_SUCCESS:
      return verifySuccess(state, action);
    case actionTypes.VERIFICATION_FAIL:
      return verifyFail(state, action);
    default:
      return state;
  }
};

export default reducer;
