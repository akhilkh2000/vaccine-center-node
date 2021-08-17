var chai = require('chai');
var chaiHttp = require('chai-http');
const decache = require('decache');
var should = chai.should();
var expect = chai.expect;
var uuid = require('uuid').v4;
chai.use(chaiHttp);

const Constants = require("../constants");
const { Location } = require("../models/location");
const { SearchRequest } = require("../models/search_request");
const { SearchResponse } = require("../models/search_response");
const { VaccineCenter } = require("../models/vaccine_center");
const { VaccineAvailability } = require("../models/vaccine_availability");
var vaccineService = require("../vaccine_service");

describe('Vaccination center tests', function() {

    beforeEach(function() {
        decache("../vaccine_service");
        vaccineService = require("../vaccine_service");
    });
	
    it('Empty vaccine center should not be added', (done) => {
        expect(vaccineService.add(new VaccineCenter()), "Only valid vaccine centers should be added").to.be.equal(false);
        done();
	});

    it('Successfully add a valid vaccine center', (done) => {
        var center = getSampleVaccineCenter();
        expect(vaccineService.add(center), "Adding valid centers should return true").to.be.equal(true);

        var fetchedCenter = vaccineService.get(center.id);
        expect(fetchedCenter).deep.to.equal(center);
        done();
	});

    it('Add a duplicate center', (done) => {
        var center = getSampleVaccineCenter();
        expect(vaccineService.add(center)).to.be.equal(true);

        var duplicateCenter = getSampleVaccineCenter(center.id);
        expect(vaccineService.add(duplicateCenter), "Should not be able to add same center twice").to.be.equal(false);
        done();
	});

    it('Adding availablity to non existing center', (done) => {
        expect(vaccineService.addAvailability("random_id", null), "Should not be able to add availability to a non exising center").to.be.equal(false);
        expect(vaccineService.addAvailability("random_id", new VaccineAvailability()), "Should not be able to add availability to a non exising center").to.be.equal(false);
        done();
	});

    it('Adding availability', (done) => {
        var center = getSampleVaccineCenter("availability_test");

        var vaccineAvailability1 = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        var vaccineAvailability2 = new VaccineAvailability("2", Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE, 10, 0);

        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability1)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability2)).to.be.equal(true);

        var fetchedCenter = vaccineService.get(center.id);
        expect(fetchedCenter.vaccineAvailabilities.length).to.be.equal(2);
        done();
	});

    it('Adding duplicate availability', (done) => {
        var center = getSampleVaccineCenter("availability_test_2");

        var vaccineAvailability = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);

        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability)).to.be.equal(false);
        done();
	});

    it('Updating availability of non existing center', (done) => {
        expect(vaccineService.updateAvailability("random_id", null)).to.be.equal(false);
        expect(vaccineService.updateAvailability("random_id", new VaccineAvailability())).to.be.equal(false);
        done();
	});

    it('Updating availability of non existing availability', (done) => {
        var center = getSampleVaccineCenter("non_existing_availability");

        var vaccineAvailability1 = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        var vaccineAvailability2 = new VaccineAvailability("2", Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE, 10, 0);

        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.updateAvailability(center.id, vaccineAvailability1), "Should not be able to update a non existing availability").to.be.equal(false);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability1)).to.be.equal(true);
        var fetchedCenter = vaccineService.get(center.id);
        expect(fetchedCenter.vaccineAvailabilities.length).to.be.equal(1);
        expect(vaccineService.updateAvailability(center.id, vaccineAvailability2), "Should not be able to update a non existing availability").to.be.equal(false);
        done();
	});

    it('Succesfully updating availability', (done) => {
        var center = getSampleVaccineCenter();

        var vaccineAvailability1 = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        var vaccineAvailability2 = new VaccineAvailability("2", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        var updatedVaccineAvailability2 = new VaccineAvailability("2", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 9, 0);

        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability1)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability2)).to.be.equal(true);
        expect(vaccineService.updateAvailability(center.id, updatedVaccineAvailability2)).to.be.equal(true);

        var fetchedCenter = vaccineService.get(center.id);
        expect(fetchedCenter.vaccineAvailabilities).deep.to.equal([vaccineAvailability1, updatedVaccineAvailability2]);
        done();
	});

    it('Removing availability from non existing center', (done) => {
        expect(vaccineService.removeAvailability("random_id", null), "Removing availability from non existing center should return false").to.be.equal(false);
        expect(vaccineService.removeAvailability("random_id", new VaccineAvailability()), "Removing availability from non existing center should return false").to.be.equal(false);
        done();
	});

    it('Removing non existing availability', (done) => {
        var center = getSampleVaccineCenter();

        var vaccineAvailability1 = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        var vaccineAvailability2 = new VaccineAvailability("2", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        
        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.removeAvailability(center.id, vaccineAvailability1)).to.be.equal(false);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability1)).to.be.equal(true);
        expect(vaccineService.removeAvailability(center.id, vaccineAvailability2)).to.be.equal(false);

        done();
	});

    it('Removing availability succesffully', (done) => {
        var center = getSampleVaccineCenter();

        var vaccineAvailability1 = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        var vaccineAvailability2 = new VaccineAvailability("2", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        
        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability1)).to.be.equal(true);
        expect(vaccineService.addAvailability(center.id, vaccineAvailability2)).to.be.equal(true);
        expect(vaccineService.removeAvailability(center.id, vaccineAvailability1)).to.be.equal(true);
        expect(vaccineService.removeAvailability(center.id, vaccineAvailability2)).to.be.equal(true);

        var fetchedCenter = vaccineService.get(center.id);
        expect(fetchedCenter.vaccineAvailabilities.length).to.be.equal(0);

        expect(vaccineService.removeAvailability(center.id, vaccineAvailability1)).to.be.equal(false);
        expect(vaccineService.removeAvailability(center.id, vaccineAvailability2)).to.be.equal(false);
        done();
	});

    it('Booking failures', (done) => {
        expect(vaccineService.bookVaccineSlot("random_id", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE), "Booking cannot be done for a non existing center").to.be.equal(false);

        var center = getSampleVaccineCenter();
        var vaccineAvailability = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        
        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        
        expect(vaccineService.addAvailability(center.id, vaccineAvailability)).to.be.equal(true);

        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.SECOND_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVAXIN, Constants.DoseType.SECOND_DOSE), "Booking cannot be done if not available").to.be.equal(false);

        done();
	});

    it('Booking success', (done) => {
        var center = getSampleVaccineCenter();
        var vaccineAvailability1 = new VaccineAvailability("1", Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE, 10, 0);
        var vaccineAvailability2 = new VaccineAvailability("2", Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE, 1, 0);
        
        expect(vaccineService.add(center)).to.be.equal(true);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        
        expect(vaccineService.addAvailability(center.id, vaccineAvailability1)).to.be.equal(true);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.SECOND_DOSE), "Booking cannot be done if not available").to.be.equal(false);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE)).to.be.equal(true);

        expect(vaccineService.addAvailability(center.id, vaccineAvailability2)).to.be.equal(true);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE)).to.be.equal(true);
        expect(vaccineService.bookVaccineSlot(center.id, Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE), "Booking cannot be done if not available").to.be.equal(false);

        var fetchedCenter = vaccineService.get(center.id);
        expect(getAvaiabilityCountForId(vaccineAvailability1.id, fetchedCenter.vaccineAvailabilities)).to.be.equal(9);
        expect(getAvaiabilityCountForId(vaccineAvailability2.id, fetchedCenter.vaccineAvailabilities)).to.be.equal(0);

        done();
	});

    var getAvaiabilityCountForId = (id, vaccineAvailabilities) => {
        var availabilityFiltered = vaccineAvailabilities.filter(availability => availability.id == id);
        if (availabilityFiltered && availabilityFiltered.length > 0) {
            return availabilityFiltered[0].availableQuantityCount;
        }

        return -1;
    }

    it('Search by empty vaccine type and dose type', (done) => {
        var searchResponse = vaccineService.search(null, null);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results.length).to.be.equal(0);
        done();
	});

    it('Search empty vaccine type and non empty dose type', (done) => {
        var center1 = getSampleVaccineCenter();
        center1.name = "name1";

        var center2 = getSampleVaccineCenter();
        center2.name = "name2";

        var center3 = getSampleVaccineCenter();
        center3.name = "name3";
        center3.doseTypes = [Constants.DoseType.SECOND_DOSE];
        expect(vaccineService.add(center3)).to.be.equal(true);

        var searchResponse = vaccineService.search(null, Constants.DoseType.FIRST_DOSE);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results.length).to.be.equal(0);

        expect(vaccineService.add(center1)).to.be.equal(true);

        searchResponse = vaccineService.search(null, Constants.DoseType.FIRST_DOSE);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);

        expect(vaccineService.add(center2)).to.be.equal(true);

        searchResponse = vaccineService.search(null, Constants.DoseType.FIRST_DOSE);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);

        done();
	});

    it('Search by non empty vaccine type and empty dose type', (done) => {
        var center1 = getSampleVaccineCenter();
        center1.name = "name1";

        var center2 = getSampleVaccineCenter();
        center2.name = "name2";

        var center3 = getSampleVaccineCenter();
        center3.name = "name3";
        center3.vaccineTypes = [Constants.VaccineType.COVISHIELD];

        var searchResponse = vaccineService.search(Constants.VaccineType.COVAXIN, null);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results.length).to.be.equal(0);

        expect(vaccineService.add(center1)).to.be.equal(true);
        searchResponse = vaccineService.search(Constants.VaccineType.COVAXIN, null);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);

        expect(vaccineService.add(center2)).to.be.equal(true);
        expect(vaccineService.add(center3)).to.be.equal(true);

        searchResponse = vaccineService.search(Constants.VaccineType.COVISHIELD, null);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);

        done();
	});

    it('Search by non empty vaccine type and non empty dose type', (done) => {
        var center1 = getSampleVaccineCenter();
        center1.name = "name1";

        var center2 = getSampleVaccineCenter();
        center2.name = "name2";

        var center3 = getSampleVaccineCenter();
        center3.name = "name3";
        center3.vaccineTypes = [Constants.VaccineType.COVISHIELD];

        expect(vaccineService.add(center1)).to.be.equal(true);
        expect(vaccineService.add(center2)).to.be.equal(true);
        expect(vaccineService.add(center3)).to.be.equal(true);

        var searchResponse = vaccineService.search(Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE);
        expect(searchResponse.totalCount).to.be.equal(2);
        expect(searchResponse.results).deep.to.equal([center1, center2]);

        
        searchResponse = vaccineService.search(Constants.VaccineType.COVAXIN, Constants.DoseType.SECOND_DOSE);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results.length).to.be.equal(0);

        searchResponse = vaccineService.search(Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE);
        expect(searchResponse.totalCount).to.be.equal(3);
        expect(searchResponse.results).deep.to.equal([center1, center2, center3]);

        searchResponse = vaccineService.search(Constants.VaccineType.COVISHIELD, Constants.DoseType.SECOND_DOSE);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results.length).to.be.equal(0);

        done();
	});

    it('Multi search', (done) => {
        var center1 = getSampleVaccineCenter();
        center1.name = "name1";

        var center2 = getSampleVaccineCenter();
        center2.name = "name2";
        center2.vaccineTypes = [Constants.VaccineType.COVISHIELD];

        var center3 = getSampleVaccineCenter();
        center3.name = "name3";
        center3.vaccineTypes = [Constants.VaccineType.COVISHIELD];
        center3.doseTypes = [Constants.DoseType.SECOND_DOSE];

        var searchRequest = new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.SECOND_DOSE);
        var searchResponse = vaccineService.multiSearch([searchRequest]);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);

        expect(vaccineService.add(center1)).to.be.equal(true);
        expect(vaccineService.add(center2)).to.be.equal(true);
        expect(vaccineService.add(center3)).to.be.equal(true);

        searchRequest = new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.SECOND_DOSE);
        searchResponse = vaccineService.multiSearch([searchRequest]);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);

        searchResponse = vaccineService.multiSearch([new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.SECOND_DOSE), 
            new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE)]);
        expect(searchResponse.totalCount).to.be.equal(1);
        expect(searchResponse.results).deep.to.equal([center1]);

        searchResponse = vaccineService.multiSearch([new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE)]);
        expect(searchResponse.totalCount).to.be.equal(1);
        expect(searchResponse.results).deep.to.equal([center1]);

        searchResponse = vaccineService.multiSearch([new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE), 
            new SearchRequest(Constants.VaccineType.COVISHIELD, Constants.DoseType.SECOND_DOSE)]);
        expect(searchResponse.totalCount).to.be.equal(2);
        expect(searchResponse.results).to.include.members([center1, center3]);

        searchResponse = vaccineService.multiSearch([
            new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.FIRST_DOSE), 
            new SearchRequest(Constants.VaccineType.COVAXIN, Constants.DoseType.SECOND_DOSE), 
            new SearchRequest(Constants.VaccineType.COVISHIELD, Constants.DoseType.FIRST_DOSE),
            new SearchRequest(Constants.VaccineType.COVISHIELD, Constants.DoseType.SECOND_DOSE),
        ]);
        expect(searchResponse.totalCount).to.be.equal(3);
        expect(searchResponse.results).to.include.members([center1, center2, center3]);

        done();
    });

});


var getSampleVaccineCenter = (id) => {
    return new VaccineCenter(id || uuid(), "name1", new Location("vikramnagar", "kolhapur", "maharashtra", 416115),
        [Constants.VaccineType.COVAXIN, Constants.VaccineType.COVISHIELD], [Constants.DoseType.FIRST_DOSE], [Constants.CostType.FREE], []);
}
