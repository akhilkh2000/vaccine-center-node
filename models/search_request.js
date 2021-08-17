"use strict";

class SearchRequest {

    /**
    * @param {string} vaccineType
    * @param {string} doseType
    */
    constructor(vaccineType, doseType) {
        this.vaccineType = vaccineType;
        this.doseType = doseType;
    }
}

module.exports.SearchRequest = SearchRequest;
