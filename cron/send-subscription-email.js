const fetch = require('node-fetch')

async function run() {
    fetch(`https://www.jobboardx.io/api/jobboards`).then(res => {
        res.json().then(data => {
            data.forEach(jobboard => {
                fetch(`https://www.jobboardx.io/api/send-subscription-email`, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobboard })
                }).then(res => {
                    res.json()
                }).catch(err => console.log("ERROR"))
            })
        })
    }).catch(err => console.log("ERROR"))
}

run()