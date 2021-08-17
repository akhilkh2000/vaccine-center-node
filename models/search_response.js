"use strict";

const { VaccineCenter } = require("./vaccine_center");

class SearchResponse {

    /**
    * @param {number} totalCount
    * @param {VaccineCenter[]} results
    */
    constructor(totalCount, results) {
        this.totalCount = totalCount;
        this.results = results;
    }
}

module.exports.SearchResponse = SearchResponse;
