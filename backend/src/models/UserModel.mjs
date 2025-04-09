class UserModel {

    constructor (firstName, surname, email, contactNumber, passwordHash = null, id = null, verify = false) {
        this.firstName = firstName;
        this.surname = surname;
        this.email = email;
        this.contactNumber = contactNumber;
        this.passwordHash = passwordHash;
        this.id = id;
        this.verify = verify;
    }

    // Creating request model with passwordHash
    static getRequestUserModel(firstName, surname, email, contactNumber, passwordHash) {
        return new UserModel(firstName, surname, email, contactNumber, passwordHash);
    }

    // Creating response model with id
    static getResponseUserModel(firstName, surname, email, contactNumber, verify, id) {
        return new UserModel(firstName, surname, email, contactNumber, null, id, verify);
    }
}

export default UserModel;
