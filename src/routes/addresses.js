const express = require('express')
const db = require('../config/database.js')
require('dotenv').config()
const router = express.Router()

const selectAddressQuery = 'SELECT address FROM wallet_address INNER JOIN coin ON coin.id=coin_id  WHERE (username=? AND coin.code=? AND wallet_address.is_active=1) limit 1'
const selectCoinQuery = 'SELECT id FROM coin WHERE (code=?) limit 1'
const insertCoinQuery = 'INSERT INTO coin (name, code, is_active) VALUES (?,?,true)'
const insertWalletAddressQuery = 'INSERT INTO wallet_address (username, coin_id, address, is_active) VALUES (?,?,?,true)'
const updateWalletAddressQuery = 'UPDATE wallet_address SET address=? WHERE (username=? AND coin_id=?)'
const deleteWalletAddressQuery = 'DELETE FROM wallet_address WHERE (username=? AND coin_id=?)'

function isAuthorized (req) {
  if (!req.headers.authorization || req.headers.authorization.indexOf('Api-Key') !== 0) {
    return false
  }
  const authorizationInfo = req.headers.authorization.split(' ')
  if (authorizationInfo.length != 2) {
    return false
  }
  const apiKey = authorizationInfo[1]
  if (apiKey == process.env.API_KEY) {
    return true
  }
  return false
}

router.get('/:username/:coin/', (req, res) => {
  const params = [req.params.username, req.params.coin]
  db.get(selectAddressQuery, params, (err, row) => {
    if (err) {
      res.status(404).json({ status: 'error', error: 'User / crypto pairing not found' })
    } else {
      res.json({ address: row.address })
    }
  })
})

router.post('/:username/:coin/', (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ status: 'error', error: 'Client not authorized' })
    return
  }
  const allowedKeys = ['address']
  const requiredKeys = ['address']

  // Check for bad inputs
  const errors = []
  const walletData = req.body
  for (const key in walletData) {
    if (allowedKeys.indexOf(key) < 0) {
      errors.push({ key: [`Invalid key '${key}'`] })
    }
  }
  // check that all required keys are present
  for (const row in requiredKeys) {
    const key = requiredKeys[row]
    if (!walletData[key]) {
      errors.push({ key: [`Missing required key '${key}'`] })
    }
  }
  if (errors.length > 0) {
    res.status(400).json({ status: 'error', errors: errors })
    return
  }

  const username = req.params.username
  const coin = req.params.coin
  const address = walletData.address
  let coinId = null

  // check that coin exists
  db.get(selectCoinQuery, [coin], (coinSelectError, coinSelectResult) => {
    if (coinSelectError) {
      db.run(insertCoinQuery, [coin, coin], (coinInsertErr, coinInsertResult) => {
        if (coinInsertErr) {
          res.status(500).json({ status: 'error', error: coinInsertErr.message })
          return
        }
        coinId = this.lastId
      })
    } else {
      coinId = coinSelectResult.id
    }

    let insertUpdateQuery = updateWalletAddressQuery
    let params = []
    let httpStatus = 200

    db.get(selectAddressQuery, [username, coin], (selectAddressError, selectAddressResult) => {
      if (selectAddressError || selectAddressResult === undefined) {
        // insert
        insertUpdateQuery = insertWalletAddressQuery
        params = [username, coinId, address]
        httpStatus = 201
      } else {
        // update
        insertUpdateQuery = updateWalletAddressQuery
        params = [address, username, coinId]
      }

      db.run(insertUpdateQuery, params, (insertUpdateError, insertUpdateResult) => {
        if (insertUpdateError) {
          res.status(500).json({ status: 'error', error: insertUpdateError.message })
        } else {
          res.status(httpStatus).json({ status: 'success' })
        }
      })
    })
  })
})

router.delete('/:username/:coin/', (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ status: 'error', error: 'Client not authorized' })
    return
  }
  const username = req.params.username
  const coin = req.params.coin

  let coinId = null
  db.get(selectCoinQuery, [coin], (coinSelectError, coinSelectResult) => {
    if (!coinSelectError && coinSelectResult !== undefined) {
      coinId = coinSelectResult.id
      db.run(deleteWalletAddressQuery, [username, coinId], (deleteError, deleteResult) => {
        res.json({ status: 'success' })
      })
    }
  })
})

module.exports = router
