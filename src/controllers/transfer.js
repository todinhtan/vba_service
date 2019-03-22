/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import logger from '../utils/logger';
import graylog from '../utils/logger/graylog';
import config from '../config';
import { epiLogin } from '../helpers/epiapi';

async function lookupTransfer(sessionId, transferId) {
  try {
    const response = await axios.get(`${config.api.epiapi_prefix}/transfer/${transferId}?sessionId=${sessionId}`);
    if (response && response.status === 200 && response.data) {
      return response.data;
    }
  } catch (error) {
    logger.error(error);
  }
  return null;
}

async function finaliseTransfer(sessionId, transferId) {
  try {
    await axios.post(`${config.api.epiapi_prefix}/transfer/${transferId}/finalise?sessionId=${sessionId}`);
    return true;
  } catch (error) {
    logger.error(error);
  }
  return false;
}

export async function completeTransfer(req, res) {
  try {
    // define valid values on fields
    const allowedCurrencies = ['USD'];
    const allowedStatus = 'COMPLETED';
    const {
      status,
      sourceAmount,
      message,
      sourceCurrency,
      destCurrency,
    } = req.body;

    const errors = [];

    // only allow currency in the allowed list
    if (!allowedCurrencies.includes(sourceCurrency)) errors.push(`sourceCurrency ${sourceCurrency} is not supported`);
    if (!allowedCurrencies.includes(destCurrency)) errors.push(`destCurrency ${destCurrency} is not supported`);

    // only allow status COMPLETED
    if (!status || status !== allowedStatus) errors.push('Transfer is not completed');

    // perform simple validation on message, which should be a valid transferId
    if (!message || !message.startsWith('TF-')) errors.push('message should be a valid transferId');

    // return bad request if any errors occur
    if (errors.length) return res.status(400).json({ errors }).end();

    // get epiapi admin's sessionId
    const sessionId = await epiLogin('hieu@epiapi.com', '123456789sS');

    // if sessionId is null, epiapi may be down, return
    if (!sessionId) return res.status(500).json({ errors: ['Could not connect to EPIAPI service'] }).end();

    // lookup transfer by id
    const transfer = await lookupTransfer(sessionId, message);

    // check if sourceAmount's values do not match
    // eslint-disable-next-line eqeqeq
    if (!sourceAmount || sourceAmount != transfer.sourceAmount) return res.status(400).json({ errors: ['Transfer\'s sourceAmounts are not matched'] }).end();

    // finalise transfer
    const finaliseResult = await finaliseTransfer(sessionId, message);

    // this is final step of everything
    if (finaliseResult) return res.json({ message: 'Complete transfer successfully', errors: [] }).end();
    return res.status(500).json({ errors: ['Could not finalise transfer from EPIAPI service'] }).end();
  } catch (error) {
    logger.error(error);
    graylog.critical(error.message, error.stack, {
      reqType: 'GET',
      walletId: req.params.walletId,
    });
    return res.status(500).send(error.stack).end();
  }
}
