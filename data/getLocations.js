const fs = require('fs')
var cities = require('./cities.json')

function getCities() {
  let americanCities = []
  let worldCities = []

  const supportedCountries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Ireland',
    'Australia',
    'New Zealand'
  ]

  cities.forEach(city => {
    if (city.country_name === "United States") {
      americanCities.push(city)
    }

    if (supportedCountries.indexOf(city.country_name) > -1) {
      worldCities.push(city)
    }
  })

  const worldCitiesValues = worldCities.map(city => {
    if (city.country_name === 'United States') {
      return `${city.name}, ${city.state_code}`
    } else {
      return `${city.name}, ${city.country_name}`
    }
  })

  fs.writeFile('./world_cities.json', JSON.stringify(worldCitiesValues), err => {
    if (err) {
      console.log(err)
    } else {
      console.log('JSON file written')
    }
  })
}

getCities()
