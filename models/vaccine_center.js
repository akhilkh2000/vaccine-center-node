"use strict";

const { VaccineAvailability } = require("./vaccine_availability");
const { Location } = require("./location");
class VaccineCenter {

    /**
    * @param {string} id
    * @param {string} name
    * @param {Location} location
    * @param {string[]} vaccineTypes values from constants.VaccineType
    * @param {string[]} doseTypes values from constants.DoseType
    * @param {string[]} costTypes values from constants.CostType
    * @param {VaccineAvailability[]} vaccineAvailabilities
    */
    constructor(id, name, location, vaccineTypes, doseTypes, costTypes, vaccineAvailabilities) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.vaccineTypes = vaccineTypes;
        this.doseTypes = doseTypes;
        this.costTypes = costTypes;
        this.vaccineAvailabilities = vaccineAvailabilities;
    }
}

module.exports.VaccineCenter = VaccineCenter;
