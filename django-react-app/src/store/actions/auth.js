import axios from "axios";
import { getAuthAxios } from "../../utils";
import * as actionTypes from "./actionTypes";

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START,
  };
};

export const authSuccess = (token) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    token: token,
  };
};

export const authFail = (error) => {
  return {
    type: actionTypes.AUTH_FAIL,
    error: error,
  };
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("verified");
  localStorage.removeItem("expirationDate");
  return {
    type: actionTypes.AUTH_LOGOUT,
  };
};

export const verifyStart = () => {
  return {
    type: actionTypes.VERIFICATION_START,
  };
};

export const verifySuccess = (value) => {
  return {
    type: actionTypes.VERIFICATION_SUCCESS,
    verified: value,
  };
};

export const verifyFail = (error) => {
  return {
    type: actionTypes.VERIFICATION_SUCCESS,
    error: error,
  };
};
export const verifyFetch = () => {
  return (dispatch) => {
    dispatch(verifyStart());
    const token = localStorage.getItem("token");
    console.log(token);
    let authAxios = getAuthAxios();
    authAxios
      .get("http://127.0.0.1:8000/api/verify/", {
        params: {
          token,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        dispatch(verifyFail(err));
      });
  };
};

export const verifyCheckState = () => {
  return (dispatch) => {
    let authAxios = getAuthAxios();
    authAxios
      .get("http://127.0.0.1:8000/api/user-verification/")
      .then((res) => {
        console.log(res);
        if (res.data.verification === true) {
          dispatch(verifySuccess(true));
        } else {
          dispatch(verifySuccess(false));
        }
      })
      .catch((err) => {
        dispatch(verifyFail(err));
      });
  };
};

export const checkAuthTimeout = (expirationTime) => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch(logout());
    }, expirationTime * 1000);
  };
};

export const authLogin = (username, password) => {
  return (dispatch) => {
    dispatch(authStart());
    axios
      .post("http://127.0.0.1:8000/rest-auth/login/", {
        username: username,
        password: password,
      })
      .then((res) => {
        const token = res.data.key;
        const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
        localStorage.setItem("token", token);
        localStorage.setItem("expirationDate", expirationDate);
        dispatch(authSuccess(token));
        dispatch(verifyCheckState());
        dispatch(checkAuthTimeout(3600));
      })
      .catch((err) => {
        dispatch(authFail(err));
      });
  };
};

export const authLoginGoogle = (res) => {
  return (dispatch) => {
    console.log("post");
    dispatch(authStart());
    axios
      .post("http://127.0.0.1:8000/api/google/", {
        access_token: res.accessToken,
      })
      .then((res) => {
        const token = res.data.key;
        const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
        localStorage.setItem("token", token);
        localStorage.setItem("expirationDate", expirationDate);
        dispatch(authSuccess(token));
        dispatch(verifySuccess(true));
        dispatch(checkAuthTimeout(3600));
      })
      .catch((err) => {
        dispatch(authFail(err));
      });
  };
};

export const authSignup = (username, email, password1, password2) => {
  return (dispatch) => {
    dispatch(authStart());
    axios
      .post("http://127.0.0.1:8000/rest-auth/registration/", {
        username: username,
        email: email,
        password1: password1,
        password2: password2,
      })
      .then((res) => {
        const token = res.data.key;
        console.log(username, email);
        const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
        localStorage.setItem("token", token);
        localStorage.setItem("expirationDate", expirationDate);
        dispatch(authSuccess(token));
        dispatch(verifyFetch());
        dispatch(checkAuthTimeout(3600));
      })
      .catch((err) => {
        dispatch(authFail(err));
      });
  };
};

export const authCheckState = () => {
  return (dispatch) => {
    const token = localStorage.getItem("token");
    if (token === "undefined") {
      dispatch(logout());
    } else {
      const expirationDate = new Date(localStorage.getItem("expirationDate"));
      if (expirationDate <= new Date()) {
        dispatch(logout());
      } else {
        dispatch(authSuccess(token));
        dispatch(verifyCheckState());
        dispatch(
          checkAuthTimeout(
            (expirationDate.getTime() - new Date().getTime()) / 1000
          )
        );
      }
    }
  };
};
