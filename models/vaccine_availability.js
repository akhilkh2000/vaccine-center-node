"use strict";

class VaccineAvailability {

    /**
    * @param {string} id
    * @param {string} vaccineType values from constants.VaccineType
    * @param {string} doseType values from constants.DoseType
    * @param {number} availableQuantityCount
    * @param {number} bookedQuantityCount
    */
    constructor(id, vaccineType, doseType, availableQuantityCount, bookedQuantityCount) {
        this.id = id;
        this.vaccineType = vaccineType;
        this.doseType = doseType;
        this.availableQuantityCount = availableQuantityCount;
        this.bookedQuantityCount = bookedQuantityCount;
    }
}

module.exports.VaccineAvailability = VaccineAvailability;
