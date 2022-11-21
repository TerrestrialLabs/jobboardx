const fetch = require('node-fetch')

async function run() {
    // fetch('http://localhost:3000/api/send-subscription-email', {
    fetch('https://react-job-board.herokuapp.com/api/send-subscription-email', {
        method: 'POST',
        body: {}
    }).then(res => {
        res.json().then(data => console.log('data: ', data))
    }).catch(err => console.log("ERROR"))
}

run()