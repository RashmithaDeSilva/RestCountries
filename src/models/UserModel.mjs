class UserModel {

    constructor (firstName, surname, email, contactNumber, passwordHash = null, id = null) {
        this.firstName = firstName;
        this.surname = surname;
        this.email = email;
        this.contactNumber = contactNumber;
        this.passwordHash = passwordHash;
        this.id = id;
    }

    // Creating request model with passwordHash
    static getRequestUserModel(firstName, surname, email, contactNumber, passwordHash) {
        return new UserModel(firstName, surname, email, contactNumber, passwordHash);
    }

    // Creating response model with id
    static getResponseUserModel(id, firstName, surname, email, contactNumber) {
        return new UserModel(firstName, surname, email, contactNumber, null, id);
    }
}

export default UserModel;
