const { db } = require('../firebaseConfig');

// Add a new client
exports.addClient = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { name, phoneNumber, email, address, city, country } = req.body;

    if (!name || !phoneNumber || !email) {
      console.log('Validation error - missing fields:', { name, phoneNumber, email });
      return res.status(400).json({ error: 'Name, phone number, and email are required' });
    }

    console.log('Checking if client exists:', phoneNumber);
    // Check if client already exists
    const clientDoc = await db.collection('clients').doc(phoneNumber).get();
    
    if (clientDoc.exists) {
      console.log('Client already exists with phone number:', phoneNumber);
      return res.status(400).json({ error: 'A client with this phone number already exists' });
    }

    console.log('Adding new client:', { name, phoneNumber, email });
    // Add new client
    await db.collection('clients').doc(phoneNumber).set({
      name,
      email,
      phoneNumber,
      address: address || '',
      city: city || '',
      country: country || '',
      createdAt: new Date().toISOString()
    });

    console.log('Client added successfully:', phoneNumber);
    return res.status(201).json({ message: 'Client added successfully' });
  } catch (error) {
    console.error('Error adding client:', error);
    return res.status(500).json({ error: 'Failed to add client' });
  }
};

// Get client details by phone number including tours
exports.getClientByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('Fetching client by phone:', phone);
    
    // Get client details
    const clientDoc = await db.collection('clients').doc(phone).get();
    
    if (!clientDoc.exists) {
      console.log('Client not found:', phone);
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const clientData = clientDoc.data();
    console.log('Client found:', clientData);
    
    // Get client's tours
    const toursSnapshot = await db.collection('clients').doc(phone).collection('tours').get();
    
    const tours = [];
    toursSnapshot.forEach(doc => {
      tours.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${tours.length} tours for client:`, phone);
    return res.status(200).json({
      client: clientData,
      tours
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return res.status(500).json({ error: 'Failed to fetch client details' });
  }
};

// List all clients
exports.getAllClients = async (req, res) => {
  try {
    console.log('Fetching all clients');
    const clientsSnapshot = await db.collection('clients').get();
    
    const clients = [];
    clientsSnapshot.forEach(doc => {
      clients.push({
        phoneNumber: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${clients.length} clients`);
    return res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

// Add a transaction to client ledger
exports.addClientTransaction = async (req, res) => {
  try {
    const { phone } = req.params;
    const { type, amount, description, date } = req.body;
    
    console.log('Adding transaction for client:', phone, req.body);
    
    if (!type || !amount || !description) {
      return res.status(400).json({ error: 'Type, amount, and description are required' });
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    // Check if client exists
    const clientDoc = await db.collection('clients').doc(phone).get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Get or create client ledger
    const ledgerRef = db.collection('clients').doc(phone).collection('ledger');
    const summaryRef = db.collection('clients').doc(phone).collection('ledger').doc('summary');
    
    // Get ledger summary or create if not exists
    const summaryDoc = await summaryRef.get();
    let summary = {};
    
    if (summaryDoc.exists) {
      summary = summaryDoc.data();
    } else {
      summary = {
        totalDebit: 0,
        totalCredit: 0,
        balance: 0
      };
    }
    
    // Calculate new totals
    const numAmount = Number(amount);
    let newTotalDebit = summary.totalDebit || 0;
    let newTotalCredit = summary.totalCredit || 0;
    
    if (type === 'debit') {
      newTotalDebit += numAmount;
    } else if (type === 'credit') {
      newTotalCredit += numAmount;
    }
    
    const newBalance = newTotalDebit - newTotalCredit;
    
    // Use a batch to ensure atomic updates
    const batch = db.batch();
    
    // Add transaction
    const transactionRef = ledgerRef.doc();
    batch.set(transactionRef, {
      type,
      amount: numAmount,
      description,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date()
    });
    
    // Update summary
    batch.set(summaryRef, {
      totalDebit: newTotalDebit,
      totalCredit: newTotalCredit,
      balance: newBalance,
      updatedAt: new Date()
    });
    
    // Commit the batch
    await batch.commit();
    
    return res.status(201).json({
      message: 'Transaction added successfully',
      transaction: {
        id: transactionRef.id,
        type,
        amount: numAmount,
        description
      }
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    return res.status(500).json({ error: 'Failed to add transaction' });
  }
};

// Get client ledger summary
exports.getClientLedgerSummary = async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Check if client exists
    const clientDoc = await db.collection('clients').doc(phone).get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Get ledger summary
    const summaryRef = db.collection('clients').doc(phone).collection('ledger').doc('summary');
    const summaryDoc = await summaryRef.get();
    
    if (!summaryDoc.exists) {
      return res.status(200).json({
        totalDebit: 0,
        totalCredit: 0,
        balance: 0
      });
    }
    
    return res.status(200).json(summaryDoc.data());
  } catch (error) {
    console.error('Error getting ledger summary:', error);
    return res.status(500).json({ error: 'Failed to get ledger summary' });
  }
};

// Get client ledger transactions
exports.getClientLedgerTransactions = async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Check if client exists
    const clientDoc = await db.collection('clients').doc(phone).get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Get transactions
    const transactionsRef = db.collection('clients').doc(phone).collection('ledger');
    const transactionsSnapshot = await transactionsRef.where('__name__', '!=', 'summary')
      .orderBy('__name__')
      .orderBy('date', 'desc')
      .get();
    
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting ledger transactions:', error);
    return res.status(500).json({ error: 'Failed to get ledger transactions' });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { phone } = req.params;
    console.log('Deleting client:', phone);
    
    // Check if client exists
    const clientDoc = await db.collection('clients').doc(phone).get();
    
    if (!clientDoc.exists) {
      console.log('Client not found for deletion:', phone);
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Delete client document
    await db.collection('clients').doc(phone).delete();
    
    console.log('Client deleted successfully:', phone);
    return res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ error: 'Failed to delete client' });
  }
}; 