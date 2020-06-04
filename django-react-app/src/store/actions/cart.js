import { CART_START, CART_SUCCESS, CART_FAIL } from "./actionTypes";
import { getAuthAxios } from "../../utils";
import { orderSummaryURL } from "../../constants";

export const cartStart = () => {
  return {
    type: CART_START,
  };
};

export const cartSuccess = (data) => {
  return {
    type: CART_SUCCESS,
    data,
  };
};

export const cartFail = (error) => {
  return {
    type: CART_FAIL,
    error: error,
  };
};

export const fetchCart = () => {
  return (dispatch) => {
    dispatch(cartStart());
    let authAxios = getAuthAxios();
    authAxios
      .get(orderSummaryURL)
      .then((res) => {
        console.log(res);
        dispatch(cartSuccess(res.data));
      })
      .catch((err) => {
        console.log(err);
        dispatch(cartFail(err));
      });
  };
};
