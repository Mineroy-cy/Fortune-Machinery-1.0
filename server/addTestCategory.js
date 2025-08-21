import mongoose from 'mongoose';
import Category from './models/Category.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-machinery');

async function addTestCategory() {
  try {
    console.log('🔍 Checking if categories exist...');
    
    const existingCategories = await Category.find().lean();
    console.log(`Found ${existingCategories.length} existing categories`);
    
    if (existingCategories.length === 0) {
      console.log('📝 Adding test category with image...');
      
      const testCategory = new Category({
        name: 'Test Machinery',
        description: 'This is a test category with an image',
        image: {
          url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
          public_id: 'test-category-1'
        }
      });
      
      await testCategory.save();
      console.log('✅ Test category added successfully!');
    } else {
      console.log('✅ Categories already exist');
      
      // Check if any have images
      const categoriesWithImages = existingCategories.filter(cat => cat.image?.url);
      console.log(`${categoriesWithImages.length} categories have images`);
      
      if (categoriesWithImages.length === 0) {
        console.log('📝 Adding image to first category...');
        const firstCategory = existingCategories[0];
        firstCategory.image = {
          url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
          public_id: 'test-category-1'
        };
        await Category.findByIdAndUpdate(firstCategory._id, firstCategory);
        console.log('✅ Image added to first category!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestCategory(); 