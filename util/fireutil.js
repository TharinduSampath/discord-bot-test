//Some utility functions to make life easier when dealing with firebase.
/**
 * Gets the value of the specified field from 
 * a document retrieved from a firestore.
 * @param {Object} document Firestore document
 * @param {String} fieldName Field to get
 * @returns Value of field specified
 */
function getValue(document, fieldName) {
    return document._fieldsProto[fieldName].stringValue;
}

module.exports = { getValue };