class AdminModel {

    constructor (firstName, surname, email, contactNumber, roll, passwordHash = null, id = null) {
        this.firstName = firstName;
        this.surname = surname;
        this.email = email;
        this.contactNumber = contactNumber;
        this.roll = roll;
        this.passwordHash = passwordHash;
        this.id = id;
    }

    // Creating request model with passwordHash
    static getRequestAdminModel(firstName, surname, email, contactNumber, roll, passwordHash) {
        return new AdminModel(firstName, surname, email, contactNumber, roll, passwordHash);
    }

    // Creating response model with id
    static getResponseAdminModel(firstName, surname, email, contactNumber, roll, id) {
        return new AdminModel(firstName, surname, email, contactNumber, roll, null, id);
    }
}

export default AdminModel;
