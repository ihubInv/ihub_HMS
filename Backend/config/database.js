const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize beds if they don't exist
    await initializeBeds();
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const initializeBeds = async () => {
  try {
    const Bed = require('../models/Bed');
    const bedCount = await Bed.countDocuments();
    
    if (bedCount === 0) {
      console.log('Initializing beds...');
      const beds = [];
      
      // Create beds for 5 floors
      for (let floor = 1; floor <= 5; floor++) {
        // 7 rooms with 6 beds each
        for (let room = 1; room <= 7; room++) {
          for (let bed = 1; bed <= 6; bed++) {
            beds.push({
              bedId: `F${floor}R${room}B${bed}`,
              floor: floor,
              room: room,
              bedNumber: bed,
              status: 'available',
              capacity: 6
            });
          }
        }
        
        // 1 room with 4 beds (Room 8)
        for (let bed = 1; bed <= 4; bed++) {
          beds.push({
            bedId: `F${floor}R8B${bed}`,
            floor: floor,
            room: 8,
            bedNumber: bed,
            status: 'available',
            capacity: 4
          });
        }
      }
      
      await Bed.insertMany(beds);
      console.log(`Initialized ${beds.length} beds`);
    }
  } catch (error) {
    console.error('Error initializing beds:', error);
  }
};

module.exports = connectDB;