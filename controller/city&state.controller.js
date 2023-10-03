const db = require('../model/db')
const city = db.cities
const state = db.states
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.EncryptDataKey, { saltLength: 10 })
const errorResponse = require('../response/error.response')
const successResponses = require('../response/success.response');
const op = db.sequelize

// const getAllCity = async (req, res) => {
//     try {
//         const allCity = await city.findAll({
//             include: [{
//                 model: state,
//             }],
//         })
     
//         const data = allCity.map(el => {

//             return {
//                 cityId: cryptr.encrypt(el.dataValues.id),
//                 cityName: el.cities,
//                 stateId: cryptr.encrypt(el.dataValues.state.id),
//                 stateName:el.dataValues.state.state
//             };


//         })

//         return successResponses.responseMessage(res, 200, "Here is the complete set of all city and state data", data)
//     } catch (error) {
//         return errorResponse.catchErrorMessage(res, error)
//     }
// }

const getAllCity = async (req, res) => {
    try {
        const allCity = await city.findAll({
            attributes: ['StateId',[op.fn('COUNT',op.col('StateId')),'countstate']],
            group:['StateId'],
            include: [{
                model: state,
            }],
        });

        const stateCity = [];

        allCity.forEach(el => {
            const stateId = el.dataValues.state.id;
            const stateName = el.dataValues.state.state;
            
            if (!stateCity[stateId]) {
                stateCity[stateId] = {
                    stateId: cryptr.encrypt(stateId),
                    stateName,
                    cities: [],
                };
            }
            
            // stateCity[stateId].cities.push({
            //     cityId: cryptr.encrypt(el.dataValues.id),
            //     cityName: el.cities,
            // });
            
        });

        // const data = Object.values(stateCity);
       
        return successResponses.responseMessage(res, 200, "Here is the complete set of all city and state data",allCity );
    } catch (error) {
        return errorResponse.catchErrorMessage(res, error);
    }
}

module.exports = { getAllCity }



// const { Op } = require('sequelize');

