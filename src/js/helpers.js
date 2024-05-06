// contains functions that are used over and over in the project
import { TIMEOUT_SEC } from "./config";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

//# Refactored function of two down below
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          // headers are the snippets of text which are like information about the request itself
          headers: {
            "Content-Type": "application/json",
          },
          // the data we want to send, it should be in JSON
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    // throwing an error
    if (!res.ok) {
      throw new Error(`${data.message}\nStatus: ${res.status}`);
    }
    return data;
  } catch (error) {
    // Rethrow the error from getJSON to actually catch it in model.js
    throw error;
  }
};

/*
//# To get the data from the API
export const getJSON = async function (url) {
  try {
    const fetchPro = fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    // throwing an error
    if (!res.ok) {
      throw new Error(`${data.message}\nStatus: ${res.status}`);
    }
    return data;
  } catch (error) {
    // Rethrow the error from getJSON to actually catch it in model.js
    throw error;
  }
};

//# To send the new data to the API
export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: "POST",
      // headers are the snippets of text which are like information about the request itself
      headers: {
        "Content-Type": "application/json",
      },
      // the data we wanna send, it should be in JSON
      body: JSON.stringify(uploadData),
    });

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    // throwing an error
    if (!res.ok) {
      throw new Error(`${data.message}\nStatus: ${res.status}`);
    }
    return data;
  } catch (error) {
    // Rethrow the error from getJSON to actually catch it in model.js
    throw error;
  }
};
*/
