import fs from 'fs'
// const fs = require('fs')
// var cities = require('./cities.json')
var cities = require('./world_cities.json')

export function getLocations() {
  // let americanCities = []
  // let worldCities = []

  // const supportedCountries = [
    // 'United States',
    // 'Canada',
    // 'United Kingdom',
    // 'Ireland',
    // 'Australia',
    // 'New Zealand'
  // ]

  // cities.forEach(city => {
  //   if (city.country_name === "United States") {
  //     americanCities.push(city)
  //   }

  //   if (supportedCountries.indexOf(city.country_name) > -1) {
  //     worldCities.push(city)
  //   }
  // })

  // const worldCitiesValues = worldCities.map(city => {
  //   if (city.country_name === 'United States') {
  //     return `${city.name}, ${city.state_code}`
  //   } else {
  //     return `${city.name}, ${city.country_name}`
  //   }
  // })

  // fs.writeFile('./world_cities.json', JSON.stringify(worldCitiesValues), err => {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     console.log('JSON file written')
  //   }
  // })

  const cityOptions = cities.filter(city => {
    return !city.includes(', Canada') && 
      !city.includes(', United Kingdom') && 
      !city.includes(', Ireland') && 
      !city.includes(', Australia') && 
      !city.includes(', New Zealand')
  })

  fs.writeFile('./world_cities_options.json', JSON.stringify(cityOptions), err => {
    if (err) {
      console.log(err)
    } else {
      console.log('JSON file written')
    }
  })
}
