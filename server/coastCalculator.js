'use strict'
const carDao = require('./car_dao');
const rentDao = require('./rent_dao');
const moment = require('moment');

//TODO add error handling!!!!!!
async function calculatePrice(user, options){
        let coast = 0;
        if(options.startDate && options.endDate && options.category && options.dailyKm && options.driverAge && options.additionalDrivers && options.extraInsurance){
            //0---> Definisco la durata del noleggio in giorni così da non dover rifare i calcoli
            const startDate = moment(options.startDate , 'YYYY-MM-DD 00:00:00');
            const endDate = moment(options.endDate , 'YYYY-MM-DD 00:00:00');
            const days = moment.duration(endDate.diff(startDate)).asDays();
            //1---> trovo tutte le macchine disponibili per quella data
            const carsAvailable = await carDao.getAvailableCarsNumber(options.startDate, options.endDate, options.category);
            if(carsAvailable === 0){
                return {availability: 0};
            }
            //3--->Calcolo il costo in base alla disponibilità e alle opzioni; ogni volta verifico la presenza dei campi necessari
            //3a--->costo base
            switch (options.category) {
                case "A":
                    coast = days*80;
                    break;
                case "B":
                    coast = days*70;
                    break;
                case "C":
                    coast = days*60;
                    break;
                case "D":
                    coast = days*50;
                    break;
                case "E":
                    coast = days*40;
                    break;
            }
            //3b--->costo in base ai Km percorsi giornalmente
            if(options.dailyKm<50) 
                coast = coast * 0.95;
            if(options.dailyKm>=150)
                coast = coast * 1.05;               
            //3c--->costo in base all'età del guidatore
            const driverBirth = moment(options.driverAge, 'YYYY-MM-DD 00:00:00');
            const current = moment();
            const driverAge = parseInt(moment.duration(current.diff(driverBirth)).asYears());

            if(driverAge<25)
                coast = coast * 1.05;
            if(driverAge>65)
                coast = coast * 1.10;
            //3d--->costo in base alla presenza di guidatori extra
            if(options.additionalDrivers!=='0')
                coast = coast * 1.15;
                
            //3e--->costo in base all'assicurazione extra
            if(options.extraInsurance === 'true')
                coast = coast *1.20;
            //4--->costo se meno di 10% dei veicoli rimasti della stessa categoria
            const cars = await carDao.getAllCarsNumberByCategory(options.category);
            if(carsAvailable <= cars*0.10 )
                coast = coast * 1.10;
            //5--->costo se cliente frequente 
            const rentsNumber = await rentDao.getRentNumberByUserId(user);
            if(rentsNumber>=3)
                coast = coast * 0.90;
            //Infine restituisco il preventivo
            coast = parseInt(coast);
            const rentProposal = { startDate: startDate, endDate: endDate, coast: coast, availability: carsAvailable, category: options.category};
            return(rentProposal);
        } else {
            return(err);
        }
}

module.exports = calculatePrice;