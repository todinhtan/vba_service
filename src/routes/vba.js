import {
  get,
  put,
  post,
  getMultipleWallets,
  updateAllWalletRequests,
  addFunds,
  updateVbaData,
  getWalletByUserId,
} from '../controllers/vba';

import { completeTransfer } from '../controllers/transfer';

module.exports = (api) => {
  api.route('/vba/').post(getMultipleWallets);
  api.route('/vba/:walletId').get(get);
  api.route('/vba/:walletId').put(put);
  api.route('/vba/:walletId/document').put(updateAllWalletRequests);
  api.route('/vba/:walletId').post(post);
  api.route('/vba/:walletId/vbaData/:country').post(updateVbaData);

  // add funds
  api.route('/add-funds/synapse').post(addFunds);

  // get wallets by userId
  api.route('/user/:userId/wallets').get(getWalletByUserId);

  // add transfer routes
  api.route('/callbacks/complete-transfer').post(completeTransfer);
};
