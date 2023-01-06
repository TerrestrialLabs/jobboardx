require('dotenv').config({ path: __dirname + '/.env' })
const axios = require('axios')

const tweet = async () => {
    try {
        const url = 'http://localhost:3000/api/twitter/tweet'
        // const url = 'https://www.reactdevjobs.io/api/twitter/tweet'
        await axios.post(url, {
            text: 'Between 2020 and 2030, the number of React Developer jobs is expected to grow by 667,600. --bluelight.co'
        })
    } catch (e) {
        console.log(e)
    }
}

tweet()