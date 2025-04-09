class SubscriptionTypeModel {

    constructor (id, subscriptionName, subscriptionPrice, subscriptionPriceCurrency, 
        apiRequestLimit, apiKeyLimit, description, functionDescription) {
        this.id = id;
        this.subscriptionName = subscriptionName;
        this.subscriptionPrice = subscriptionPrice;
        this.subscriptionPriceCurrency = subscriptionPriceCurrency;
        this.apiRequestLimit = apiRequestLimit;
        this.apiKeyLimit = apiKeyLimit;
        this.description = description;
        this.functionDescription = functionDescription;
    }
}

export default SubscriptionTypeModel;
