import mongoose from 'mongoose';
import Category from './models/Category.js';
import Subcategory from './models/Subcategory.js';
import Machine from './models/Machine.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-machinery');

async function checkData() {
  try {
    console.log('🔍 Checking database data...\n');
    
    // Check Categories
    const categories = await Category.find().lean();
    console.log(`📂 Found ${categories.length} categories:`);
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name}`);
      console.log(`     Image: ${cat.image ? JSON.stringify(cat.image) : 'NO IMAGE'}`);
      console.log('');
    });
    
    // Check Subcategories
    const subcategories = await Subcategory.find().lean();
    console.log(`📂 Found ${subcategories.length} subcategories:`);
    subcategories.forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.name}`);
      console.log(`     Image: ${sub.image ? JSON.stringify(sub.image) : 'NO IMAGE'}`);
      console.log('');
    });
    
    // Check Machines
    const machines = await Machine.find().lean();
    console.log(`📂 Found ${machines.length} machines:`);
    machines.forEach((machine, index) => {
      console.log(`  ${index + 1}. ${machine.name}`);
      console.log(`     Cover Image: ${machine.cover_image ? JSON.stringify(machine.cover_image) : 'NO IMAGE'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkData(); 