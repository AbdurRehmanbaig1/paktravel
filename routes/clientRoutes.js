const express = require('express');
const { 
  addClient, 
  getClientByPhone, 
  getAllClients, 
  addClientTransaction, 
  getClientLedgerSummary, 
  getClientLedgerTransactions,
  deleteClient
} = require('../controllers/clientController');

const router = express.Router();

// POST /api/clients - Add a new client
router.post('/', addClient);

// GET /api/clients/:phone - Get client by phone number with their tours
router.get('/:phone', getClientByPhone);

// GET /api/clients - Get all clients
router.get('/', getAllClients);

// DELETE /api/clients/:phone - Delete a client
router.delete('/:phone', deleteClient);

// Ledger Routes
// POST /api/clients/:phone/ledger - Add transaction to client ledger
router.post('/:phone/ledger', addClientTransaction);

// GET /api/clients/:phone/ledger/summary - Get client ledger summary
router.get('/:phone/ledger/summary', getClientLedgerSummary);

// GET /api/clients/:phone/ledger - Get client ledger transactions
router.get('/:phone/ledger', getClientLedgerTransactions);

module.exports = router; 