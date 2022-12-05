const fetch = require('node-fetch')

async function run() {
    // It doesn't matter which jobboard we use for this
    fetch(`https://www.reactdevjobs.io/api/jobboards`).then(res => {
        res.json().then(data => {
            data.forEach(jobboard => {
                fetch(`https://${jobboard.domain}/api/send-subscription-email`, {
                    method: 'POST',
                    body: {
                        jobboard
                    }
                }).then(res => {
                    res.json().then(data => console.log('data: ', data))
                }).catch(err => console.log("ERROR"))
            })
        })
    }).catch(err => console.log("ERROR"))
}

run()