const { Firestore } = require('@google-cloud/firestore');

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

// Firestore client automatically uses GOOGLE_APPLICATION_CREDENTIALS
// Firestore client automatically uses the project it's running in if projectId is null
const firestore = new Firestore();

const sessionsCollection = firestore.collection('sessions');
const vectorsCollection = firestore.collection('vectors');

module.exports = { firestore, sessionsCollection, vectorsCollection };
