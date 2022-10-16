const ms = require("ms");
const logger = require("./util/logger")(module);
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

const args = process.argv.slice(2);
const intervalTime = args[0];

logger.info("Initializing database connection...");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function updateRankings() {
    logger.info("Configuring rankings...");
    const collectionRef = db.collection('profile');
    const querySnapshot = await collectionRef.get();
    const collectionData = [];
    querySnapshot.docs.forEach((doc) => collectionData.push(doc.data()));

    function sortAndAdd(sortType) {
        collectionData.sort((a, b) => (Number(b[sortType + "Count"]) || 0) - (Number(a[sortType + "Count"]) || 0));
        collectionData.forEach((profile, i) => {
            profile[sortType + "Rank"] = i + 1;
        });
    }

    logger.info("Sorting data...");
    sortAndAdd('both');
    sortAndAdd('anime');
    sortAndAdd('manga');

    logger.info("Uploading data...");
    collectionData.forEach((profile, i) => {
        collectionRef.doc(profile.id).update(profile);
    });
}

updateRankings();
setInterval(async () => {
    updateRankings();
}, ms(intervalTime));