/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import config from '../config';

export async function epiLogin(email, password) {
  try {
    const response = await axios.post(`${config.api.epiapi_prefix}/sessions/auth`, { email, password });
    if (response && response.status === 200
      && response.data && response.data.sessionId) {
      return response.data.sessionId;
    }
  } catch (error) {
    // just return null
  }
  return null;
}
