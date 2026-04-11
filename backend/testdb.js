import mongoose from 'mongoose';

const uri = 'mongodb://siddhartha_StayOps:Siddu_19@ac-gv0e7ky-shard-00-00.1ilwxfk.mongodb.net:27017,ac-gv0e7ky-shard-00-01.1ilwxfk.mongodb.net:27017,ac-gv0e7ky-shard-00-02.1ilwxfk.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-zdi4ef-shard-0&retryWrites=true&w=majority&appName=StayOps-cluster';

console.log('Attempting to connect to MongoDB Atlas...');

mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch((err) => {
    console.log('ERROR:', err.message);
    console.log('FULL ERROR:', JSON.stringify(err, null, 2));
    process.exit(1);
  });
