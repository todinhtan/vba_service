import { get, put, post, getMultipleWallets, updateAllWalletRequests, addFunds } from '../controllers/vba';

module.exports = (api) => {
  api.route('/vba/').post(getMultipleWallets);
  api.route('/vba/:walletId').get(get);
  api.route('/vba/:walletId').put(put);
  api.route('/vba/:walletId/document').put(updateAllWalletRequests);
  api.route('/vba/:walletId').post(post);

  // add funds
  api.route('/add-funds/synapse/:userId').post(addFunds);
};
