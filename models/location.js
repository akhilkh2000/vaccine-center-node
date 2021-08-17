"use strict";

class Location {

    /**
    * Location of the vaccination center
    * @param {string} address
    * @param {string} street
    * @param {string} district
    * @param {string} state
    * @param {number} pinCode
    */
    constructor(street, district, state, pinCode) {
        this.street = street;
        this.district = district;
        this.state = state;
        this.pinCode = pinCode;
    }
}

module.exports.Location = Location;
