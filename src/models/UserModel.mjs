class UserModel {

    constructor (firstName, surname, email, contactNumber, verify, passwordHash = null, id = null) {
        this.firstName = firstName;
        this.surname = surname;
        this.email = email;
        this.contactNumber = contactNumber;
        this.verify = verify;
        this.passwordHash = passwordHash;
        this.id = id;
    }

    // Creating request model with passwordHash
    static getRequestUserModel(firstName, surname, email, contactNumber, verify, passwordHash) {
        return new UserModel(firstName, surname, email, contactNumber, passwordHash);
    }

    // Creating response model with id
    static getResponseUserModel(firstName, surname, email, contactNumber, verify, id) {
        return new UserModel(firstName, surname, email, contactNumber, verify, id);
    }
}

export default UserModel;
