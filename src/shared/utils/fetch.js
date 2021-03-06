import isNode from "detect-node";

const API = "node-api.jess.gallery";

function constructPrefix() {
  const prefix = isNode ? "http:" : location.protocol;

  return `${prefix}//${API}`;
}

function augmentURL(url, params) {
  const queryParams = params
    ? Object.keys(params)
        .map(key => {
          const value = params[key];
          if (value) {
            return `${key}=${encodeURIComponent(value)}`;
          }
        })
        .filter(Boolean)
        .join("&")
    : "";

  const prefix = constructPrefix();

  return `${prefix}${url}${queryParams.length ? "?" : ""}${queryParams}`;
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}

export function get(url, { params } = {}) {
  return fetch(augmentURL(url, params), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then(parseJSON);
}

export function post(url, { params }) {
  return fetch(`${constructPrefix()}${url}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  })
    .then(checkStatus)
    .then(parseJSON);
}
