class SubscriptionTypeModel {

    constructor (id, subscriptionName, subscriptionPrice, subscription_price_currency, 
        api_request_limit, api_key_limit, description, function_description) {
        this.id = id;
        this.subscriptionName = subscriptionName;
        this.subscriptionPrice = subscriptionPrice;
        this.subscription_price_currency = subscription_price_currency;
        this.api_request_limit = api_request_limit;
        this.api_key_limit = api_key_limit;
        this.description = description;
        this.function_description = function_description;
    }
}

export default SubscriptionTypeModel;
