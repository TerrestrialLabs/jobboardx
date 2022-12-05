const fetch = require('node-fetch')

async function run() {
    // It doesn't matter which jobboard we use for this
    // TO DO: Restrict this to one domain for jobboard app
    fetch(`https://www.reactdevjobs.io/api/jobboards`).then(res => {
        res.json().then(data => {
            data.forEach(jobboard => {
                fetch(`https://${jobboard.domain}/api/send-subscription-email`, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobboard })
                }).then(res => {
                    res.json().then(data => console.log('data: ', data))
                }).catch(err => console.log("ERROR"))
            })
        })
    }).catch(err => console.log("ERROR"))
}

run()