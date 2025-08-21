import mongoose from 'mongoose';
import Category from './models/Category.js';
import Subcategory from './models/Subcategory.js';
import cloudinary from './utils/cloudinary.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-machinery');

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...\n');
    
    // Check if categories already exist
    const existingCategories = await Category.find().lean();
    console.log(`📂 Found ${existingCategories.length} existing categories`);
    
    if (existingCategories.length > 0) {
      console.log('✅ Categories already exist, skipping seed data');
      return;
    }
    
    // Create test categories with placeholder images
    const testCategories = [
      {
        name: 'Industrial Machinery',
        description: 'Heavy-duty industrial equipment for manufacturing and production',
        image: {
          url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
          public_id: 'test-industrial-machinery'
        }
      },
      {
        name: 'Construction Equipment',
        description: 'Machinery and tools for construction and building projects',
        image: {
          url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
          public_id: 'test-construction-equipment'
        }
      },
      {
        name: 'Agricultural Machinery',
        description: 'Farm equipment and agricultural tools for modern farming',
        image: {
          url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
          public_id: 'test-agricultural-machinery'
        }
      },
      {
        name: 'Mining Equipment',
        description: 'Specialized machinery for mining and extraction operations',
        image: {
          url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
          public_id: 'test-mining-equipment'
        }
      }
    ];
    
    console.log('📝 Creating test categories...');
    const createdCategories = await Category.insertMany(testCategories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    
    // Create test subcategories
    const testSubcategories = [
      {
        name: 'CNC Machines',
        description: 'Computer numerical control machines for precision manufacturing',
        category_id: createdCategories[0]._id,
        image: {
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          public_id: 'test-cnc-machines'
        }
      },
      {
        name: 'Excavators',
        description: 'Heavy excavation equipment for construction sites',
        category_id: createdCategories[1]._id,
        image: {
          url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
          public_id: 'test-excavators'
        }
      },
      {
        name: 'Tractors',
        description: 'Agricultural tractors for farming operations',
        category_id: createdCategories[2]._id,
        image: {
          url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
          public_id: 'test-tractors'
        }
      }
    ];
    
    console.log('📝 Creating test subcategories...');
    const createdSubcategories = await Subcategory.insertMany(testSubcategories);
    console.log(`✅ Created ${createdSubcategories.length} subcategories`);
    
    console.log('\n🎉 Test data seeding complete!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Subcategories: ${createdSubcategories.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedTestData(); 