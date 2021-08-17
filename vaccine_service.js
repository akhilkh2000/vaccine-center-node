"use strict";

const { SearchRequest } = require("./models/search_request");
const { SearchResponse } = require("./models/search_response");
const { VaccineCenter } = require("./models/vaccine_center");
const { VaccineAvailability } = require("./models/vaccine_availability");
const Constants = require("./constants");

//Data (could be moved to another file and exported)
const vaccineCenters = [];

//Utility functions (could be put in utils folder and exported)
var checkIfVaccineCentreIsEmpty = (vaccineCenter) => {
	return (
		!vaccineCenter.id &&
		!vaccineCenter.name &&
		!vaccineCenter.location &&
		!vaccineCenter.vaccineTypes &&
		!vaccineCenter.doseTypes &&
		!vaccineCenter.costTypes &&
		!vaccineCenter.vaccineAvailabilities
	);
};
var checkAvailabityInCentre = (vaccineCentre, vaccineType, doseType) => {
	const availabileVaccines = vaccineCentre.vaccineAvailabilities;
	if (
		availabileVaccines.find((vaccine) => {
			return (
				vaccine.vaccineType === vaccineType && vaccine.doseType === doseType
			);
		})
	) {
		return true;
	}

	return false;
};

/**
 * Get vaccine center by id
 * @param {string} id
 * @return {VaccineCenter}
 */
var get = (id) => {
	let centre = vaccineCenters.find((centre) => centre.id === id);
	return centre;
};

/**
 *  Add a new vaccine center
 * @param {VaccineCenter} vaccineCenter
 * @return {boolean}
 */

var add = (vaccineCenter) => {
	if (checkIfVaccineCentreIsEmpty(vaccineCenter) || get(vaccineCenter.id))
		return false;
	vaccineCenters.push(vaccineCenter);
	return true;
};

/**
 *  Add vaccine availability to a center
 * @param {string} vaccineCenterId
 * @param {VaccineAvailability} vaccineAvailability
 * @return {boolean}
 */
var addAvailability = (vaccineCenterId, vaccineAvailability) => {
	const vaccineCenter = get(vaccineCenterId);
	if (!vaccineCenter) return false;
	const oldAvailabilities = vaccineCenter.vaccineAvailabilities;
	if (
		oldAvailabilities.find(
			(availability) => availability.id === vaccineAvailability.id
		)
	) {
		return false;
	}
	const newAvailabilities = [...oldAvailabilities, vaccineAvailability];
	vaccineCenter.vaccineAvailabilities = newAvailabilities;
	return true;
};

/**
 * Update availability of vaccines in the center based on type of vaccine and type of dose,
 * @param {string} vaccineCenterId
 * @param {VaccineAvailability} vaccineAvailability
 * @return {boolean}
 */
var updateAvailability = (vaccineCenterId, vaccineAvailability) => {
	const vaccineCenter = get(vaccineCenterId);
	if (!vaccineCenter) return false;
	const vaccineIdToBeUpdated = vaccineAvailability.id;
	const availabilityIndexToBeUpdated =
		vaccineCenter.vaccineAvailabilities.findIndex(
			(availability) => availability.id === vaccineIdToBeUpdated
		);

	if (availabilityIndexToBeUpdated == -1) return false;

	vaccineCenter.vaccineAvailabilities[availabilityIndexToBeUpdated] =
		vaccineAvailability;
	return true;
};

/**
 * Remove availability of vaccines in the center based on type of vaccine and type of dose,
 * @param {string} vaccineCenterId
 * @param {VaccineAvailability} vaccineAvailability
 * @return {boolean}
 */
var removeAvailability = (vaccineCenterId, vaccineAvailability) => {
	const vaccineCenter = get(vaccineCenterId);
	if (!vaccineCenter) return false;
	const vaccineIdToBeDeleted = vaccineAvailability.id;
	const availabilityIndexToBeDeleted =
		vaccineCenter.vaccineAvailabilities.findIndex(
			(availability) => availability.id === vaccineIdToBeDeleted
		);
	if (availabilityIndexToBeDeleted == -1) return false;
	vaccineCenter.vaccineAvailabilities.splice(availabilityIndexToBeDeleted, 1);
	return true;
};

/**
 * Book vaccine slot for given vaccineCenterId where vaccineType & doseType are available.
 * @param {string} vaccineCenterId
 * @param {string} vaccineType
 * @param {string} doseType
 * @return {boolean} if slot is booked successfully else false.
 */
var bookVaccineSlot = (vaccineCenterId, vaccineType, doseType) => {
	const vaccineCenter = get(vaccineCenterId);
	if (!vaccineCenter) return false;
	const vaccineAvailabilityIndex =
		vaccineCenter.vaccineAvailabilities.findIndex((availability) => {
			return (
				availability.vaccineType === vaccineType &&
				availability.doseType === doseType &&
				availability.availableQuantityCount > 0
			);
		});
	if (vaccineAvailabilityIndex == -1) return false;

	vaccineCenter.vaccineAvailabilities[
		vaccineAvailabilityIndex
	].bookedQuantityCount += 1;

	vaccineCenter.vaccineAvailabilities[
		vaccineAvailabilityIndex
	].availableQuantityCount -= 1;

	return true;
};

/**
 * Search vaccine centers by vaccine types and dose types
 * @param {string} vaccineType
 * @param {string} doseType
 * @return {SearchResponse}
 */

var search = (vaccineType, doseType) => {
	let totalCount = 0;
	let results = [];
	vaccineCenters.forEach((center) => {
		if (checkAvailabityInCentre(center, vaccineType, doseType)) {
			totalCount += 1;
			results.push(center);
		}
	});

	return new SearchResponse(totalCount, results);
};

/**
 * Search vaccine centers which supports any of the given vaccine type and dose type
 * @param {SearchRequest[]} searchRequestList
 * @return {SearchResponse}
 */
var multiSearch = (searchRequestList) => {
	let totalCount = 0;
	let results = [];
	searchRequestList.forEach((request) => {
		let intermediateResult = search(request.vaccineType, request.doseType);
		totalCount += intermediateResult.totalCount;
		results = [...results, ...intermediateResult.results];
	});

	return new SearchResponse(totalCount, results);
};

module.exports = {
	get: get,
	add: add,
	addAvailability: addAvailability,
	updateAvailability: updateAvailability,
	removeAvailability: removeAvailability,
	search: search,
	multiSearch: multiSearch,
	bookVaccineSlot: bookVaccineSlot,
};
