class SubscriptionUserModel {

    constructor (userId, subscriptionId, id = null, insertTime = null, expiryTime = null) {
        this.id = id;
        this.userId = userId;
        this.subscriptionId = subscriptionId;
        this.insertTime = insertTime;
        this.expiryTime = expiryTime;
    }
}

export default SubscriptionUserModel;
