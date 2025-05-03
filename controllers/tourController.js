const { db } = require('../firebaseConfig');

// Add a new tour
exports.addTour = async (req, res) => {
  try {
    const { 
      clientPhone, 
      clientName,
      clientEmail,
      type, 
      price, 
      cost, 
      peopleCount, 
      days,
      date, 
      currency,
      address,
      city,
      country,
      destination,
      description
    } = req.body;

    // Required fields validation
    if (!clientPhone || !type || !clientName || !clientEmail) {
      return res.status(400).json({ 
        error: 'Client phone, name, email, and tour type are required' 
      });
    }

    // Validate numeric fields if they're provided
    if ((price && isNaN(price)) || (cost && isNaN(cost)) || (peopleCount && isNaN(peopleCount)) || (days && isNaN(days))) {
      return res.status(400).json({ error: 'Price, cost, people count and days must be numbers' });
    }

    // Determine currency if not provided (for backward compatibility)
    const tourCurrency = currency || (type === 'local' || type === 'honeymoon' ? 'PKR' : 'USD');

    // Create batch to ensure all operations are atomic
    const batch = db.batch();

    // Check if client exists - if not, create a new client
    const clientDocRef = db.collection('clients').doc(clientPhone);
    const clientDoc = await clientDocRef.get();
    
    if (!clientDoc.exists) {
      // Create a new client
      batch.set(clientDocRef, {
        name: clientName,
        email: clientEmail,
        phoneNumber: clientPhone,
        address: address || '',
        city: city || '',
        country: country || '',
        createdAt: new Date().toISOString()
      });
      console.log('New client created:', clientPhone);
    }

    // Calculate profit if both price and cost are provided
    const profit = (price && cost) ? Number(price) - Number(cost) : 0;

    // Create a new tour in client's tours subcollection
    const tourRef = db.collection('clients').doc(clientPhone).collection('tours').doc();
    
    batch.set(tourRef, {
      type,
      price: price ? Number(price) : 0,
      cost: cost ? Number(cost) : 0,
      peopleCount: peopleCount ? Number(peopleCount) : 0,
      days: days ? Number(days) : 1,
      date,
      currency: tourCurrency,
      profit: profit,
      address: address || '',
      city: city || '',
      country: country || '',
      destination: destination || '',
      description: description || '',
      createdAt: new Date().toISOString()
    });

    // Check if client already has a ledger
    const clientLedgerQuery = await db.collection('client_ledgers')
      .where('phone', '==', clientPhone)
      .limit(1)
      .get();
    
    let clientLedgerId = null;
    
    // If client doesn't have a ledger, create one with the tour price as the opening balance
    if (clientLedgerQuery.empty) {
      // Create a new client ledger with the tour price as totalDebit
      const clientLedgerRef = db.collection('client_ledgers').doc();
      clientLedgerId = clientLedgerRef.id;
      
      batch.set(clientLedgerRef, {
        name: clientName,
        phone: clientPhone,
        notes: `Auto-created when adding tour of type: ${type}`,
        totalDebit: price ? Number(price) : 0,
        totalCredit: 0,
        balance: price ? Number(price) : 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add initial transaction if price > 0
      if (price && Number(price) > 0) {
        const txnRef = db.collection('client_ledgers').doc(clientLedgerId).collection('transactions').doc();
        batch.set(txnRef, {
          type: 'debit',
          amount: Number(price),
          description: `Opening balance from ${type} tour to ${destination || country || 'destination not specified'}`,
          date: new Date(),
          createdAt: new Date(),
          paymentMethod: 'Opening Balance',
          reference: `Tour ID: ${tourRef.id}`
        });
      }
    } else {
      console.log('Client ledger already exists. Tour price will not be added as a new opening balance.');
    }

    // Commit all changes as a batch operation
    await batch.commit();

    return res.status(201).json({ 
      message: 'Tour added successfully with ledger entry',
      tourId: tourRef.id,
      ledgerId: clientLedgerId
    });
  } catch (error) {
    console.error('Error adding tour:', error);
    return res.status(500).json({ error: 'Failed to add tour' });
  }
};

// Get all tours
exports.getAllTours = async (req, res) => {
  try {
    // Get all clients
    const clientsSnapshot = await db.collection('clients').get();
    
    const allTours = [];
    
    // For each client, get their tours
    for (const clientDoc of clientsSnapshot.docs) {
      const clientPhone = clientDoc.id;
      const clientData = clientDoc.data();
      
      const toursSnapshot = await db.collection('clients').doc(clientPhone).collection('tours').get();
      
      toursSnapshot.forEach(tourDoc => {
        allTours.push({
          id: tourDoc.id,
          clientPhone,
          clientName: clientData.name,
          ...tourDoc.data()
        });
      });
    }
    
    return res.status(200).json(allTours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    return res.status(500).json({ error: 'Failed to fetch tours' });
  }
};

// Get tour details by ID
exports.getTourById = async (req, res) => {
  try {
    const { clientPhone, tourId } = req.params;
    
    // Check if client exists
    const clientDoc = await db.collection('clients').doc(clientPhone).get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Get tour details
    const tourDoc = await db.collection('clients').doc(clientPhone).collection('tours').doc(tourId).get();
    
    if (!tourDoc.exists) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    return res.status(200).json({
      id: tourDoc.id,
      clientPhone,
      clientName: clientDoc.data().name,
      ...tourDoc.data()
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return res.status(500).json({ error: 'Failed to fetch tour details' });
  }
};

// Delete a tour
exports.deleteTour = async (req, res) => {
  try {
    const { clientPhone, tourId } = req.params;
    
    if (!clientPhone || !tourId) {
      return res.status(400).json({ error: 'Client phone and tour ID are required' });
    }
    
    // Check if client exists
    const clientRef = db.collection('clients').doc(clientPhone);
    const clientDoc = await clientRef.get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Check if tour exists
    const tourRef = clientRef.collection('tours').doc(tourId);
    const tourDoc = await tourRef.get();
    
    if (!tourDoc.exists) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    // Delete the tour
    await tourRef.delete();
    
    return res.status(200).json({ 
      message: 'Tour deleted successfully',
      tourId: tourId
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return res.status(500).json({ error: 'Failed to delete tour' });
  }
}; 