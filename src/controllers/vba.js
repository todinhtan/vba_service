/* eslint-disable no-underscore-dangle */
import vbaHelper from '../helpers/vba';
import VbaRequest from '../models/vba';
import logger from '../utils/logger';
import graylog from '../utils/logger/graylog';

// retrieve request
export async function get(req, res) {
  try {
    const { walletId } = req.params;
    console.log(walletId);
    const docs = await VbaRequest.find({ walletId }).exec()
      .catch((err) => { logger.error(err); });
    const vbaDatas = docs.map(e => ({ country: e.country, status: e.status, accountData: e.toObject().vbaData }));
    if (docs && docs.length) return res.json({ vbaDatas }).end();
    return res.status(404).json({ message: 'Not found' }).end();
  } catch (error) {
    graylog.critical(error.message, error.stack, {
      reqType: 'GET',
      walletId: req.params.walletId,
    });
    return res.status(500).send(error.stack).end();
  }
}

// update request
export async function put(req, res) {
  try {
    const vbaRequests = vbaHelper.resolveVbaRequests(req);
    const errors = vbaHelper.validateRequests(vbaRequests);

    if (errors.length) {
      // log if failed
      graylog.error('Invalid VBA request', JSON.stringify(errors), {
        reqType: 'UPDATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
      return res.status(400).json({ message: 'Invalid request', errors }).end();
    }
    let totalAffected = 0;
    const failedCountries = [];

    await Promise.all(vbaRequests.map(async (_vr) => {
      let vr = {};
      vr = Object.assign(vr, _vr._doc);
      // eslint-disable-next-line no-underscore-dangle
      delete vr._id;
      // change status to pending
      vr.status = 'PENDING';
      const { walletId, country } = vr;
      // update request with status not equals to APPROVED
      const affectedDoc = await VbaRequest.findOneAndUpdate({ walletId, country, status: { $ne: 'APPROVED' } }, { $set: vr }, { new: true });
      if (affectedDoc) totalAffected += 1;
      else failedCountries.push(vr.country);
    }));

    // 406 for no content updated
    const httpStatus = totalAffected > 0 ? 200 : 406;
    let message = totalAffected > 0 ? `update ${totalAffected} VBA's request${totalAffected > 1 ? 's' : ''} successfully` : 'No VBA\'s request updated';
    message += failedCountries.length ? `. ${failedCountries.length > 1 ? 'Countries' : 'Country'} ${failedCountries.join(', ')} not found or APPROVED.` : '';

    // log if failed
    if (failedCountries.length) {
      graylog.error(message, {
        reqType: 'UPDATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
    }

    return res.status(httpStatus).json({ message }).end();
  } catch (error) {
    graylog.critical(error.message, error.stack, {
      reqType: 'UPDATE',
      walletId: req.params.walletId,
      vbaRequested: JSON.stringify(req.body.vba),
    });
    return res.status(500).send(error.stack).end();
  }
}

// update all requests
export async function updateAllWalletRequests(req, res) {
  try {
    const { walletId } = req.params;
    console.log(req.body.vba);
    const { idDoc, coiDoc, sessionId } = req.body.vba;
    const affectedDoc = await VbaRequest.updateMany({ walletId, status: { $ne: 'APPROVED' } }, {
      $set: {
        idDoc, coiDoc, sessionId, status: 'PENDING',
      },
    }, { new: true });
    // 406 for no content updated
    const httpStatus = affectedDoc ? 200 : 406;
    const message = affectedDoc ? `update ${affectedDoc} VBA's request${affectedDoc > 1 ? 's' : ''} successfully` : 'No VBA\'s request updated';
    return res.status(httpStatus).json({ message }).end();
  } catch (error) {
    return res.status(500).send(error.stack).end();
  }
}

// create request
export async function post(req, res) {
  try {
    const { nameCn, nameEn } = req.body.vba;
    console.log({ nameCn, nameEn });
    const vbaRequests = vbaHelper.resolveVbaRequests(req);
    const errors = vbaHelper.validateRequests(vbaRequests);

    if (errors.length) {
      // log if failed
      graylog.error('Invalid VBA request', JSON.stringify(errors), {
        reqType: 'CREATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
      return res.status(400).json({ message: 'Invalid request', errors }).end();
    }

    const dupCountries = [];
    const vbaDatas = [];
    let totalAffected = 0;
    // insert if no error
    await Promise.all(vbaRequests.map(async (vr) => {
      const affectedDoc = await vr.save().catch((err) => {
        // push duplicate country to report
        // 11000: mongo duplicate code
        if (err.code === 11000) dupCountries.push(vr.country);
        logger.error(err);
      });
      if (affectedDoc) {
        totalAffected += 1;
        vbaDatas.push({ country: vr.country, status: 'PENDING' });
      }
    }));

    // 406 for no content updated
    const httpStatus = totalAffected > 0 ? 200 : 406;
    let message = totalAffected > 0 ? `create ${totalAffected} VBA's request${totalAffected > 1 ? 's' : ''} successfully` : 'No VBA\'s request created';
    message += dupCountries.length ? `. ${dupCountries.length > 1 ? 'Countries' : 'Country'} ${dupCountries.join(', ')} duplicated.` : '';
    // log if failed
    if (dupCountries.length) {
      graylog.error(message, {
        reqType: 'CREATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
    }

    return res.status(httpStatus).json({ message, vbaDatas }).end();
  } catch (error) {
    return res.status(500).send(error.stack).end();
  }
}

export async function getMultipleWallets(req, res) {
  try {
    const { walletIds } = req.body;
    const docs = await VbaRequest.find({ walletId: { $in: walletIds } }).exec()
      .catch((err) => { logger.error(err); });
    const vbaDatas = docs.reduce((acc, curr) => {
      const jo = curr.toObject();
      const wallet = acc[jo.walletId] === undefined ? [] : acc[jo.walletId];
      const { status, country } = jo;
      wallet.push({ ...jo.vbaData, status, country });
      acc[jo.walletId] = wallet;
      return acc;
    }, {});
    if (docs && docs.length) return res.json({ vbaDatas }).end();
    return res.status(404).json({ message: 'Not found' }).end();
  } catch (error) {
    graylog.critical(error.message, error.stack, {
      reqType: 'CREATE',
      walletId: req.params.walletId,
      vbaRequested: JSON.stringify(req.body.vba),
    });
    return res.status(500).send(error.stack).end();
  }
}
